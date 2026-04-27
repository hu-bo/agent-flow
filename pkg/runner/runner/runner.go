package runner

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/agent-flow/runner/runner/sandbox"
	"github.com/agent-flow/runner/runner/types"
)

type Controller interface {
	Run(ctx context.Context, req types.TaskRequest, sink types.EventSink) error
}

type Config struct {
	HostExecutor   types.Executor
	DockerExecutor types.Executor
	Guard          sandbox.Guard
}

type ControllerImpl struct {
	hostExecutor   types.Executor
	dockerExecutor types.Executor
	guard          sandbox.Guard
}

func New(config Config) (*ControllerImpl, error) {
	if config.HostExecutor == nil {
		return nil, errors.New("host executor is required")
	}
	if config.DockerExecutor == nil {
		return nil, errors.New("docker executor is required")
	}
	if config.Guard == nil {
		return nil, errors.New("sandbox guard is required")
	}

	return &ControllerImpl{
		hostExecutor:   config.HostExecutor,
		dockerExecutor: config.DockerExecutor,
		guard:          config.Guard,
	}, nil
}

func (r *ControllerImpl) Run(ctx context.Context, req types.TaskRequest, sink types.EventSink) error {
	if strings.TrimSpace(req.TaskID) == "" {
		return errors.New("task id is required")
	}
	if strings.TrimSpace(req.Command) == "" && req.Engine != types.EngineDocker {
		return errors.New("command is required")
	}
	if sink == nil {
		return errors.New("event sink is required")
	}

	req = normalizeRequest(req)
	if req.Timeout > 0 {
		var cancel context.CancelFunc
		ctx, cancel = context.WithTimeout(ctx, req.Timeout)
		defer cancel()
	}

	executor, err := r.pickExecutor(req)
	if err != nil {
		return err
	}

	if req.Sandbox.Enabled {
		executor = r.guard.Wrap(executor, req.Sandbox)
	}

	_, runErr := executor.Run(ctx, req, sink)
	return runErr
}

func (r *ControllerImpl) pickExecutor(req types.TaskRequest) (types.Executor, error) {
	switch req.Engine {
	case types.EngineHost:
		return r.hostExecutor, nil
	case types.EngineDocker:
		return r.dockerExecutor, nil
	default:
		return nil, fmt.Errorf("unsupported engine: %s", req.Engine)
	}
}

func normalizeRequest(req types.TaskRequest) types.TaskRequest {
	if req.Env == nil {
		req.Env = map[string]string{}
	}
	if req.Engine == "" {
		req.Engine = types.EngineHost
	}
	if req.Timeout < 0 {
		req.Timeout = 0
	}
	if req.Timeout == 0 {
		req.Timeout = 30 * time.Second
	}
	return req
}
