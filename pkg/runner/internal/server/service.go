package server

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"sync"
	"time"

	"github.com/agent-flow/runner/internal/auth"
	runnerpb "github.com/agent-flow/runner/protocol/proto"
	runnercore "github.com/agent-flow/runner/runner"
	"github.com/agent-flow/runner/runner/types"
)

type RunnerService struct {
	runnerpb.UnimplementedRunnerServiceServer

	controller runnercore.Controller
	auth       auth.Verifier
	version    string

	taskCancels sync.Map
}

func NewRunnerService(controller runnercore.Controller, authVerifier auth.Verifier, version string) *RunnerService {
	return &RunnerService{
		controller: controller,
		auth:       authVerifier,
		version:    version,
	}
}

func (s *RunnerService) HealthCheck(_ context.Context, _ *runnerpb.HealthCheckRequest) (*runnerpb.HealthCheckResponse, error) {
	return &runnerpb.HealthCheckResponse{
		Status:   "ok",
		Version:  s.version,
		UnixTime: time.Now().Unix(),
	}, nil
}

func (s *RunnerService) CancelTask(_ context.Context, req *runnerpb.CancelTaskRequest) (*runnerpb.CancelTaskResponse, error) {
	if req.GetTaskId() == "" {
		return &runnerpb.CancelTaskResponse{
			Accepted: false,
			Message:  "task_id is required",
		}, nil
	}

	cancelRaw, ok := s.taskCancels.Load(req.GetTaskId())
	if !ok {
		return &runnerpb.CancelTaskResponse{
			Accepted: false,
			Message:  "task not found or already finished",
		}, nil
	}

	cancelFn, typeOK := cancelRaw.(context.CancelFunc)
	if !typeOK {
		return &runnerpb.CancelTaskResponse{
			Accepted: false,
			Message:  "task cancel handle invalid",
		}, nil
	}

	cancelFn()
	return &runnerpb.CancelTaskResponse{
		Accepted: true,
		Message:  "cancel signal delivered",
	}, nil
}

func (s *RunnerService) RunTask(req *runnerpb.TaskRequest, stream runnerpb.RunnerService_RunTaskServer) error {
	if err := s.auth.Verify(req.GetAuthToken()); err != nil {
		return fmt.Errorf("auth verify failed: %w", err)
	}

	normalized, err := s.normalizeRequest(req)
	if err != nil {
		return err
	}

	taskCtx := stream.Context()
	if normalized.Timeout > 0 {
		var timeoutCancel context.CancelFunc
		taskCtx, timeoutCancel = context.WithTimeout(taskCtx, normalized.Timeout)
		defer timeoutCancel()
	}
	taskCtx, cancel := context.WithCancel(taskCtx)
	defer cancel()

	s.taskCancels.Store(normalized.TaskID, cancel)
	defer s.taskCancels.Delete(normalized.TaskID)

	runErr := s.controller.Run(taskCtx, normalized, types.EventSinkFunc(func(event types.TaskEvent) error {
		return stream.Send(toPBEvent(event))
	}))
	if runErr != nil {
		slog.Warn("runner task failed", "taskId", normalized.TaskID, "err", runErr)
		return runErr
	}
	return nil
}

func (s *RunnerService) normalizeRequest(req *runnerpb.TaskRequest) (types.TaskRequest, error) {
	if req.GetTaskId() == "" {
		return types.TaskRequest{}, errors.New("task_id is required")
	}
	if req.GetSessionId() == "" {
		return types.TaskRequest{}, errors.New("session_id is required")
	}
	if req.GetStepId() == "" {
		return types.TaskRequest{}, errors.New("step_id is required")
	}
	engine := toEngine(req.GetEngine())
	sandboxPolicy := toSandboxPolicy(req.GetSandboxPolicy())
	dockerSpec := toDockerSpec(req.GetDocker())

	normalized := types.TaskRequest{
		TaskID:     req.GetTaskId(),
		SessionID:  req.GetSessionId(),
		StepID:     req.GetStepId(),
		Command:    req.GetCommand(),
		Args:       req.GetArgs(),
		Env:        req.GetEnv(),
		WorkingDir: req.GetWorkingDir(),
		Timeout:    time.Duration(req.GetTimeoutMs()) * time.Millisecond,
		Stream:     req.GetStream(),
		InputJSON:  req.GetInputJson(),
		Engine:     engine,
		Sandbox:    sandboxPolicy,
		Docker:     dockerSpec,
	}

	if normalized.Engine != types.EngineDocker && strings.TrimSpace(normalized.Command) == "" {
		return types.TaskRequest{}, errors.New("command is required for non-docker engine")
	}
	if normalized.Engine == types.EngineDocker && strings.TrimSpace(normalized.Docker.Image) == "" {
		return types.TaskRequest{}, errors.New("docker.image is required for docker engine")
	}
	return normalized, nil
}

func toEngine(engine runnerpb.Engine) types.Engine {
	switch engine {
	case runnerpb.Engine_ENGINE_UNSPECIFIED, runnerpb.Engine_ENGINE_HOST:
		return types.EngineHost
	case runnerpb.Engine_ENGINE_DOCKER:
		return types.EngineDocker
	default:
		return types.EngineHost
	}
}

func toSandboxPolicy(policy *runnerpb.SandboxPolicy) types.SandboxPolicy {
	if policy == nil {
		return types.SandboxPolicy{}
	}

	return types.SandboxPolicy{
		Enabled:                 policy.GetEnabled(),
		ReadOnly:                policy.GetReadOnly(),
		AllowNetwork:            policy.GetAllowNetwork(),
		AllowedWorkingDirs:      append([]string{}, policy.GetAllowedWorkingDirs()...),
		AllowedReadPaths:        append([]string{}, policy.GetAllowedReadPaths()...),
		AllowedWritePaths:       append([]string{}, policy.GetAllowedWritePaths()...),
		BlockedCommandFragments: append([]string{}, policy.GetBlockedCommandFragments()...),
		AllowedEnvKeys:          append([]string{}, policy.GetAllowedEnvKeys()...),
		DeniedEnvKeys:           append([]string{}, policy.GetDeniedEnvKeys()...),
	}
}

func toDockerSpec(spec *runnerpb.DockerSpec) types.DockerSpec {
	if spec == nil {
		return types.DockerSpec{}
	}

	mounts := make([]types.Mount, 0, len(spec.GetMounts()))
	for _, mount := range spec.GetMounts() {
		if mount == nil {
			continue
		}
		mounts = append(mounts, types.Mount{
			Source:   mount.GetSource(),
			Target:   mount.GetTarget(),
			ReadOnly: mount.GetReadOnly(),
		})
	}

	return types.DockerSpec{
		Image:           spec.GetImage(),
		WorkDir:         spec.GetWorkDir(),
		User:            spec.GetUser(),
		NetworkDisabled: spec.GetNetworkDisabled(),
		ReadOnlyRootFS:  spec.GetReadOnlyRootFs(),
		Mounts:          mounts,
	}
}

func toPBEvent(event types.TaskEvent) *runnerpb.TaskEvent {
	base := &runnerpb.TaskEvent{
		TaskId:    event.TaskID,
		SessionId: event.SessionID,
		StepId:    event.StepID,
		Type:      toPBEventType(event.Type),
		Timestamp: event.Timestamp.UTC().Format(time.RFC3339Nano),
		RunnerId:  event.RunnerID,
	}

	switch event.Type {
	case types.EventStarted:
		base.Payload = &runnerpb.TaskEvent_Started{
			Started: &runnerpb.StartedPayload{
				Message: event.Message,
			},
		}
	case types.EventStdout:
		base.Payload = &runnerpb.TaskEvent_Stdout{
			Stdout: &runnerpb.StreamPayload{
				Chunk: event.Chunk,
			},
		}
	case types.EventStderr:
		base.Payload = &runnerpb.TaskEvent_Stderr{
			Stderr: &runnerpb.StreamPayload{
				Chunk: event.Chunk,
			},
		}
	case types.EventProgress:
		base.Payload = &runnerpb.TaskEvent_Progress{
			Progress: &runnerpb.ProgressPayload{
				Message: event.Message,
				Percent: event.Percent,
			},
		}
	case types.EventResult:
		base.Payload = &runnerpb.TaskEvent_Result{
			Result: &runnerpb.ResultPayload{
				ExitCode:   event.ExitCode,
				OutputJson: event.Output,
			},
		}
	case types.EventError:
		base.Payload = &runnerpb.TaskEvent_Error{
			Error: &runnerpb.ErrorPayload{
				Message:   event.Message,
				Retryable: event.Retryable,
			},
		}
	case types.EventCompleted:
		base.Payload = &runnerpb.TaskEvent_Completed{
			Completed: &runnerpb.CompletedPayload{
				ExitCode:   event.ExitCode,
				DurationMs: uint64(event.Duration.Milliseconds()),
			},
		}
	case types.EventHeartbeat:
		base.Payload = &runnerpb.TaskEvent_Heartbeat{
			Heartbeat: &runnerpb.HeartbeatPayload{
				Message: event.Message,
			},
		}
	}

	return base
}

func toPBEventType(kind types.EventType) runnerpb.TaskEventType {
	switch kind {
	case types.EventStarted:
		return runnerpb.TaskEventType_TASK_EVENT_TYPE_STARTED
	case types.EventStdout:
		return runnerpb.TaskEventType_TASK_EVENT_TYPE_STDOUT
	case types.EventStderr:
		return runnerpb.TaskEventType_TASK_EVENT_TYPE_STDERR
	case types.EventProgress:
		return runnerpb.TaskEventType_TASK_EVENT_TYPE_PROGRESS
	case types.EventResult:
		return runnerpb.TaskEventType_TASK_EVENT_TYPE_RESULT
	case types.EventError:
		return runnerpb.TaskEventType_TASK_EVENT_TYPE_ERROR
	case types.EventCompleted:
		return runnerpb.TaskEventType_TASK_EVENT_TYPE_COMPLETED
	case types.EventHeartbeat:
		return runnerpb.TaskEventType_TASK_EVENT_TYPE_HEARTBEAT
	default:
		return runnerpb.TaskEventType_TASK_EVENT_TYPE_UNSPECIFIED
	}
}
