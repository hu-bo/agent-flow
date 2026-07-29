package runner

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"sync"
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
	if sink == nil {
		return errors.New("event sink is required")
	}

	req = normalizeRequest(req)
	sequenced := &sequencedSink{next: sink, req: req}
	start := time.Now()
	if err := validateRequest(req); err != nil {
		return sequenced.emitTerminal(types.TerminalRejected, types.FailureValidation, err.Error(), -1, time.Since(start))
	}

	if !req.Deadline.IsZero() {
		var cancel context.CancelFunc
		ctx, cancel = context.WithDeadline(ctx, req.Deadline)
		defer cancel()
	} else if req.Timeout > 0 {
		var cancel context.CancelFunc
		ctx, cancel = context.WithTimeout(ctx, req.Timeout)
		defer cancel()
	}

	var runErr error
	if handled, err := r.runSemanticCommand(ctx, req, sequenced); handled {
		runErr = err
	} else {
		executor, err := r.pickExecutor(req)
		if err != nil {
			runErr = err
		} else {
			if req.Sandbox.Enabled {
				executor = r.guard.Wrap(executor, req.Sandbox)
			}
			_, runErr = executor.Run(ctx, req, sequenced)
		}
	}

	status, failureType, message := classifyTerminal(ctx, runErr)
	exitCode := sequenced.exitCode
	if runErr != nil && exitCode == 0 {
		exitCode = -1
	}
	return sequenced.emitTerminal(status, failureType, message, exitCode, time.Since(start))
}

func validateRequest(req types.TaskRequest) error {
	if strings.TrimSpace(req.TaskID) == "" {
		return errors.New("task id is required")
	}
	if strings.TrimSpace(req.ExecutionID) == "" {
		return errors.New("execution id is required")
	}
	if req.Attempt == 0 {
		return errors.New("attempt must be greater than zero")
	}
	if strings.TrimSpace(req.Command) == "" && req.Engine != types.EngineDocker {
		return errors.New("command is required")
	}
	if req.Engine == types.EngineDocker && strings.TrimSpace(req.Docker.Image) == "" {
		return errors.New("docker image is required when engine=docker")
	}
	if !req.Deadline.IsZero() && time.Now().After(req.Deadline) {
		return errors.New("task deadline has already elapsed")
	}
	return nil
}

func classifyTerminal(ctx context.Context, runErr error) (types.TerminalStatus, types.FailureType, string) {
	if runErr == nil {
		return types.TerminalSucceeded, types.FailureNone, ""
	}
	if errors.Is(ctx.Err(), context.DeadlineExceeded) || errors.Is(runErr, context.DeadlineExceeded) {
		return types.TerminalTimedOut, types.FailureTimeout, runErr.Error()
	}
	if errors.Is(ctx.Err(), context.Canceled) || errors.Is(runErr, context.Canceled) {
		return types.TerminalCancelled, types.FailureCancelled, runErr.Error()
	}
	var executionErr *types.ExecutionError
	if errors.As(runErr, &executionErr) {
		if executionErr.Type == types.FailureValidation || executionErr.Type == types.FailurePolicy {
			return types.TerminalRejected, executionErr.Type, executionErr.Error()
		}
		return types.TerminalFailed, executionErr.Type, executionErr.Error()
	}
	return types.TerminalFailed, types.FailureInternal, runErr.Error()
}

type sequencedSink struct {
	mu              sync.Mutex
	next            types.EventSink
	req             types.TaskRequest
	sequence        uint64
	exitCode        int32
	stdoutBytes     uint64
	stderrBytes     uint64
	outputTruncated bool
}

func (s *sequencedSink) Emit(event types.TaskEvent) error {
	if event.Type == types.EventCompleted || event.Type == types.EventError {
		return nil
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.sequence++
	event.ExecutionID = s.req.ExecutionID
	event.Attempt = s.req.Attempt
	event.Sequence = s.sequence
	if event.Type == types.EventResult {
		s.exitCode = event.ExitCode
		s.stdoutBytes = event.StdoutBytes
		s.stderrBytes = event.StderrBytes
		s.outputTruncated = event.OutputTruncated
	}
	return s.next.Emit(event)
}

func (s *sequencedSink) emitTerminal(
	status types.TerminalStatus,
	failureType types.FailureType,
	message string,
	exitCode int32,
	duration time.Duration,
) error {
	return s.EmitTerminal(types.TaskEvent{
		TaskID: s.req.TaskID, SessionID: s.req.SessionID, StepID: s.req.StepID,
		Type: types.EventCompleted, Timestamp: time.Now(), ExitCode: exitCode, Duration: duration,
		TerminalStatus: status, FailureType: failureType, Message: message,
		StdoutBytes: s.stdoutBytes, StderrBytes: s.stderrBytes, OutputTruncated: s.outputTruncated,
	})
}

func (s *sequencedSink) EmitTerminal(event types.TaskEvent) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.sequence++
	event.ExecutionID = s.req.ExecutionID
	event.Attempt = s.req.Attempt
	event.Sequence = s.sequence
	return s.next.Emit(event)
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
	if strings.TrimSpace(req.ExecutionID) == "" {
		req.ExecutionID = req.TaskID
	}
	if req.Attempt == 0 {
		req.Attempt = 1
	}
	if req.MaxOutputBytes == 0 {
		req.MaxOutputBytes = 4 * 1024 * 1024
	}
	return req
}
