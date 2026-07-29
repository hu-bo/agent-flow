package docker

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"

	runnerexec "github.com/agent-flow/runner/runner/exec"
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

	processReq := req
	processReq.WorkingDir = ""
	processReq.Env = nil
	return runnerexec.RunProcess(ctx, processReq, sink, e.id, e.binary, dockerArgs, runnerexec.ProcessMetadata{
		"engine": types.EngineDocker, "image": spec.Image, "dockerArgs": dockerArgs,
		"requestedCommand": req.Command, "requestedArgs": req.Args,
	})
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

	cpuLimit := spec.CPULimitMillis
	if cpuLimit == 0 {
		cpuLimit = 2_000
	}
	args = append(args, "--cpus", strconv.FormatFloat(float64(cpuLimit)/1000, 'f', 3, 64))
	memoryLimit := spec.MemoryLimit
	if memoryLimit == 0 {
		memoryLimit = 2 * 1024 * 1024 * 1024
	}
	args = append(args, "--memory", strconv.FormatUint(memoryLimit, 10))
	pidsLimit := spec.PIDsLimit
	if pidsLimit == 0 {
		pidsLimit = 256
	}
	args = append(args, "--pids-limit", strconv.FormatUint(uint64(pidsLimit), 10))
	if spec.DiskLimit > 0 {
		args = append(args, "--storage-opt", "size="+strconv.FormatUint(spec.DiskLimit, 10))
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
