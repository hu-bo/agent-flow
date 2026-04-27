package docker

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os/exec"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/agent-flow/runner/runner/types"
)

type Executor struct {
	id     string
	binary string
}

func NewExecutor(id string, binary string) *Executor {
	if strings.TrimSpace(binary) == "" {
		binary = "docker"
	}
	return &Executor{
		id:     id,
		binary: binary,
	}
}

func (e *Executor) ID() string {
	return e.id
}

func (e *Executor) Engine() types.Engine {
	return types.EngineDocker
}

func (e *Executor) Run(ctx context.Context, req types.TaskRequest, sink types.EventSink) (types.TaskResult, error) {
	start := time.Now()
	spec := req.Docker
	if strings.TrimSpace(spec.Image) == "" {
		return types.TaskResult{}, errors.New("docker image is required when engine=docker")
	}

	dockerArgs, err := buildDockerArgs(req)
	if err != nil {
		return types.TaskResult{}, err
	}

	if err := sink.Emit(types.TaskEvent{
		TaskID:    req.TaskID,
		SessionID: req.SessionID,
		StepID:    req.StepID,
		Type:      types.EventStarted,
		Timestamp: time.Now(),
		RunnerID:  e.id,
		Message:   "docker execution started",
	}); err != nil {
		return types.TaskResult{}, err
	}

	if err := sink.Emit(types.TaskEvent{
		TaskID:    req.TaskID,
		SessionID: req.SessionID,
		StepID:    req.StepID,
		Type:      types.EventProgress,
		Timestamp: time.Now(),
		RunnerID:  e.id,
		Message:   "docker command prepared",
		Percent:   10,
	}); err != nil {
		return types.TaskResult{}, err
	}

	cmd := exec.CommandContext(ctx, e.binary, dockerArgs...)
	stdoutPipe, err := cmd.StdoutPipe()
	if err != nil {
		return types.TaskResult{}, fmt.Errorf("create docker stdout pipe: %w", err)
	}
	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		return types.TaskResult{}, fmt.Errorf("create docker stderr pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return types.TaskResult{}, fmt.Errorf("start docker command: %w", err)
	}

	var stdoutChunks []string
	var stderrChunks []string
	var wg sync.WaitGroup
	wg.Add(2)
	readStream := func(scanner *bufio.Scanner, eventType types.EventType, acc *[]string) {
		defer wg.Done()
		buf := make([]byte, 0, 64*1024)
		scanner.Buffer(buf, 1024*1024)
		for scanner.Scan() {
			chunk := scanner.Text()
			*acc = append(*acc, chunk)
			if !req.Stream {
				continue
			}
			_ = sink.Emit(types.TaskEvent{
				TaskID:    req.TaskID,
				SessionID: req.SessionID,
				StepID:    req.StepID,
				Type:      eventType,
				Timestamp: time.Now(),
				RunnerID:  e.id,
				Chunk:     chunk,
			})
		}
	}

	go readStream(bufio.NewScanner(stdoutPipe), types.EventStdout, &stdoutChunks)
	go readStream(bufio.NewScanner(stderrPipe), types.EventStderr, &stderrChunks)

	waitErr := cmd.Wait()
	wg.Wait()

	exitCode := int32(0)
	if waitErr != nil {
		var exitErr *exec.ExitError
		if errors.As(waitErr, &exitErr) {
			exitCode = int32(exitErr.ExitCode())
		} else {
			exitCode = -1
		}
	}

	resultPayload, marshalErr := json.Marshal(map[string]any{
		"engine":     types.EngineDocker,
		"image":      spec.Image,
		"dockerArgs": dockerArgs,
		"command":    req.Command,
		"args":       req.Args,
		"stdout":     stdoutChunks,
		"stderr":     stderrChunks,
		"success":    waitErr == nil,
	})
	if marshalErr != nil {
		return types.TaskResult{}, fmt.Errorf("marshal docker result: %w", marshalErr)
	}

	result := types.TaskResult{
		ExitCode: exitCode,
		Output:   resultPayload,
		Duration: time.Since(start),
	}

	if err := sink.Emit(types.TaskEvent{
		TaskID:    req.TaskID,
		SessionID: req.SessionID,
		StepID:    req.StepID,
		Type:      types.EventResult,
		Timestamp: time.Now(),
		RunnerID:  e.id,
		ExitCode:  result.ExitCode,
		Output:    result.Output,
	}); err != nil {
		return types.TaskResult{}, err
	}

	if waitErr != nil {
		if emitErr := sink.Emit(types.TaskEvent{
			TaskID:    req.TaskID,
			SessionID: req.SessionID,
			StepID:    req.StepID,
			Type:      types.EventError,
			Timestamp: time.Now(),
			RunnerID:  e.id,
			Message:   waitErr.Error(),
			Retryable: false,
		}); emitErr != nil {
			return types.TaskResult{}, emitErr
		}
	}

	if err := sink.Emit(types.TaskEvent{
		TaskID:    req.TaskID,
		SessionID: req.SessionID,
		StepID:    req.StepID,
		Type:      types.EventCompleted,
		Timestamp: time.Now(),
		RunnerID:  e.id,
		ExitCode:  result.ExitCode,
		Duration:  result.Duration,
	}); err != nil {
		return types.TaskResult{}, err
	}

	if waitErr != nil {
		return result, waitErr
	}
	return result, nil
}

func buildDockerArgs(req types.TaskRequest) ([]string, error) {
	spec := req.Docker
	args := []string{"run", "--rm"}

	name := containerName(req.TaskID)
	if name != "" {
		args = append(args, "--name", name)
	}

	workDir := strings.TrimSpace(spec.WorkDir)
	if workDir == "" {
		workDir = strings.TrimSpace(req.WorkingDir)
	}
	if workDir != "" {
		args = append(args, "--workdir", workDir)
	}

	user := strings.TrimSpace(spec.User)
	if user != "" {
		args = append(args, "--user", user)
	}

	networkDisabled := spec.NetworkDisabled
	if req.Sandbox.Enabled && !req.Sandbox.AllowNetwork {
		networkDisabled = true
	}
	if networkDisabled {
		args = append(args, "--network", "none")
	}

	readOnlyRootFS := spec.ReadOnlyRootFS
	if req.Sandbox.Enabled && req.Sandbox.ReadOnly {
		readOnlyRootFS = true
	}
	if readOnlyRootFS {
		args = append(args, "--read-only")
	}

	for _, mount := range spec.Mounts {
		if strings.TrimSpace(mount.Source) == "" || strings.TrimSpace(mount.Target) == "" {
			return nil, fmt.Errorf("invalid docker mount: source and target are required")
		}
		volume := fmt.Sprintf("%s:%s", mount.Source, mount.Target)
		if mount.ReadOnly {
			volume += ":ro"
		}
		args = append(args, "-v", volume)
	}

	for key, value := range req.Env {
		if strings.TrimSpace(key) == "" {
			continue
		}
		args = append(args, "-e", fmt.Sprintf("%s=%s", key, value))
	}

	args = append(args, spec.Image)
	if strings.TrimSpace(req.Command) != "" {
		args = append(args, req.Command)
	}
	args = append(args, req.Args...)
	return args, nil
}

var nonNameCharPattern = regexp.MustCompile(`[^a-zA-Z0-9_.-]+`)

func containerName(taskID string) string {
	clean := nonNameCharPattern.ReplaceAllString(taskID, "-")
	clean = strings.Trim(clean, "-")
	if clean == "" {
		return ""
	}
	if len(clean) > 48 {
		clean = clean[:48]
	}
	return "af-" + clean
}
