package exec

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"sync"
	"time"

	"github.com/agent-flow/runner/runner/types"
)

type HostExecutor struct {
	id string
}

func NewHostExecutor(id string) *HostExecutor {
	return &HostExecutor{id: id}
}

func (e *HostExecutor) ID() string {
	return e.id
}

func (e *HostExecutor) Engine() types.Engine {
	return types.EngineHost
}

func (e *HostExecutor) Run(ctx context.Context, req types.TaskRequest, sink types.EventSink) (types.TaskResult, error) {
	start := time.Now()
	if strings.TrimSpace(req.Command) == "" {
		return types.TaskResult{}, errors.New("command is required")
	}

	cmd := exec.CommandContext(ctx, req.Command, req.Args...)
	if req.WorkingDir != "" {
		cmd.Dir = req.WorkingDir
	}
	cmd.Env = mergeEnv(req.Env)

	stdoutPipe, err := cmd.StdoutPipe()
	if err != nil {
		return types.TaskResult{}, fmt.Errorf("create stdout pipe: %w", err)
	}
	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		return types.TaskResult{}, fmt.Errorf("create stderr pipe: %w", err)
	}

	if err := sink.Emit(types.TaskEvent{
		TaskID:    req.TaskID,
		SessionID: req.SessionID,
		StepID:    req.StepID,
		Type:      types.EventStarted,
		Timestamp: time.Now(),
		RunnerID:  e.id,
		Message:   "host execution started",
	}); err != nil {
		return types.TaskResult{}, err
	}

	if err := cmd.Start(); err != nil {
		return types.TaskResult{}, fmt.Errorf("start command: %w", err)
	}

	if err := sink.Emit(types.TaskEvent{
		TaskID:    req.TaskID,
		SessionID: req.SessionID,
		StepID:    req.StepID,
		Type:      types.EventProgress,
		Timestamp: time.Now(),
		RunnerID:  e.id,
		Message:   "command started",
		Percent:   15,
	}); err != nil {
		return types.TaskResult{}, err
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

	output, marshalErr := json.Marshal(map[string]any{
		"engine":  types.EngineHost,
		"command": req.Command,
		"args":    req.Args,
		"stdout":  stdoutChunks,
		"stderr":  stderrChunks,
		"success": waitErr == nil,
	})
	if marshalErr != nil {
		return types.TaskResult{}, fmt.Errorf("marshal result: %w", marshalErr)
	}

	result := types.TaskResult{
		ExitCode: exitCode,
		Output:   output,
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

func mergeEnv(extra map[string]string) []string {
	env := os.Environ()
	for key, value := range extra {
		if strings.TrimSpace(key) == "" {
			continue
		}
		env = append(env, fmt.Sprintf("%s=%s", key, value))
	}
	return env
}
