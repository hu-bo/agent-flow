package grpcclient

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"runtime"
	"strings"
	"sync"
	"time"

	runnerpb "github.com/agent-flow/runner/protocol/proto"
	runnercore "github.com/agent-flow/runner/runner"
	"github.com/agent-flow/runner/runner/types"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type StartLoopOptions struct {
	RunnerID           string
	RunnerToken        string
	ServerAddr         string
	Kind               string
	Host               string
	HostName           string
	HostIP             string
	Version            string
	Capabilities       []string
	OS                 string
	Arch               string
	DefaultShell       string
	PathSeparator      string
	LineEnding         string
	WorkspaceRoots     []string
	AvailableCommands  []string
	MaxConcurrentTasks uint32
	OnRegistered       func(result StartLoopResult)
}

type StartLoopResult struct {
	RunnerID            string
	HeartbeatIntervalMs int64
}

func StartLoop(ctx context.Context, controller runnercore.Controller, opts StartLoopOptions) (StartLoopResult, error) {
	if strings.TrimSpace(opts.RunnerToken) == "" {
		return StartLoopResult{}, fmt.Errorf("runner token is required")
	}

	target := normalizeGrpcTarget(opts.ServerAddr)
	conn, err := grpc.DialContext(ctx, target, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return StartLoopResult{}, err
	}
	defer conn.Close()

	client := runnerpb.NewRunnerServiceClient(conn)
	connectionCtx, cancelConnection := context.WithCancel(ctx)
	defer cancelConnection()
	stream, err := client.Connect(connectionCtx)
	if err != nil {
		return StartLoopResult{}, err
	}

	var sendMu sync.Mutex
	send := func(envelope *runnerpb.RunnerEnvelope) error {
		sendMu.Lock()
		defer sendMu.Unlock()
		return stream.Send(envelope)
	}
	registry := defaultExecutionRegistry(opts.MaxConcurrentTasks)
	activeTasks, maxConcurrentTasks := registry.stats()

	register := &runnerpb.RunnerEnvelope{
		Payload: &runnerpb.RunnerEnvelope_Register{
			Register: &runnerpb.ConnectRegister{
				RunnerToken:             opts.RunnerToken,
				RunnerId:                strings.TrimSpace(opts.RunnerID),
				Kind:                    strings.TrimSpace(opts.Kind),
				Host:                    strings.TrimSpace(opts.Host),
				HostName:                strings.TrimSpace(opts.HostName),
				HostIp:                  strings.TrimSpace(opts.HostIP),
				Version:                 strings.TrimSpace(opts.Version),
				Capabilities:            append([]string{}, opts.Capabilities...),
				Os:                      strings.TrimSpace(opts.OS),
				Arch:                    strings.TrimSpace(opts.Arch),
				DefaultShell:            strings.TrimSpace(opts.DefaultShell),
				PathSeparator:           strings.TrimSpace(opts.PathSeparator),
				LineEnding:              strings.TrimSpace(opts.LineEnding),
				WorkspaceRoots:          append([]string{}, opts.WorkspaceRoots...),
				AvailableCommands:       append([]string{}, opts.AvailableCommands...),
				CapabilitySchemaVersion: 1,
				IsolationLevel:          runnerpb.IsolationLevel_ISOLATION_LEVEL_GUARDED_HOST,
				AvailableEngines:        []runnerpb.Engine{runnerpb.Engine_ENGINE_HOST, runnerpb.Engine_ENGINE_DOCKER},
				LogicalCpuCount:         uint32(runtime.NumCPU()),
				MaxConcurrentTasks:      maxConcurrentTasks,
				ActiveTasks:             activeTasks,
			},
		},
	}
	if err := send(register); err != nil {
		return StartLoopResult{}, err
	}

	first, err := stream.Recv()
	if err != nil {
		return StartLoopResult{}, err
	}
	ack := first.GetRegisterAck()
	if ack == nil {
		return StartLoopResult{}, fmt.Errorf("expected register_ack as first server message")
	}
	runnerID := strings.TrimSpace(ack.GetRunnerId())
	if runnerID == "" {
		return StartLoopResult{}, fmt.Errorf("server returned empty runner id")
	}
	heartbeatIntervalMs := ack.GetHeartbeatIntervalMs()
	if heartbeatIntervalMs < 1000 {
		heartbeatIntervalMs = 10_000
	}
	slog.Info(
		"runner connected to web-server grpc",
		"runnerId", runnerID,
		"server", target,
		"heartbeatIntervalMs", heartbeatIntervalMs,
	)
	if opts.OnRegistered != nil {
		opts.OnRegistered(StartLoopResult{
			RunnerID:            runnerID,
			HeartbeatIntervalMs: heartbeatIntervalMs,
		})
	}

	heartbeatTicker := time.NewTicker(time.Duration(heartbeatIntervalMs) * time.Millisecond)
	defer heartbeatTicker.Stop()
	for _, event := range registry.replayAll() {
		if err := sendTaskEvent(send, event); err != nil {
			return StartLoopResult{}, err
		}
	}

	go func() {
		for {
			select {
			case <-connectionCtx.Done():
				return
			case <-heartbeatTicker.C:
				active, limit := registry.stats()
				hb := &runnerpb.RunnerEnvelope{
					Payload: &runnerpb.RunnerEnvelope_Heartbeat{
						Heartbeat: &runnerpb.ConnectHeartbeat{
							RunnerId:           runnerID,
							RunnerToken:        opts.RunnerToken,
							Timestamp:          time.Now().UTC().Format(time.RFC3339Nano),
							ActiveTasks:        active,
							MaxConcurrentTasks: limit,
						},
					},
				}
				if err := send(hb); err != nil {
					slog.Warn("grpc heartbeat send failed", "runnerId", runnerID, "err", err)
				}
				for _, event := range registry.replayAll() {
					if err := sendTaskEvent(send, event); err != nil {
						slog.Warn("grpc pending event replay failed", "runnerId", runnerID, "err", err)
						break
					}
				}
			}
		}
	}()

	for {
		serverEnvelope, recvErr := stream.Recv()
		if recvErr != nil {
			if recvErr == io.EOF {
				return StartLoopResult{
					RunnerID:            runnerID,
					HeartbeatIntervalMs: heartbeatIntervalMs,
				}, nil
			}
			return StartLoopResult{}, recvErr
		}

		runTask := serverEnvelope.GetRunTask()
		if runTask == nil {
			eventAck := serverEnvelope.GetEventAck()
			if eventAck != nil {
				_ = registry.acknowledge(executionKey{id: eventAck.GetExecutionId(), attempt: normalizeAttempt(eventAck.GetAttempt())}, eventAck.GetEventSequence())
				continue
			}
			cancelTask := serverEnvelope.GetCancelTask()
			if cancelTask != nil {
				taskID := strings.TrimSpace(cancelTask.GetTaskId())
				if taskID == "" {
					continue
				}
				record, accepted := registry.cancelExecution(cancelTask.GetExecutionId(), cancelTask.GetAttempt(), taskID)
				state := runnerpb.ExecutionState_EXECUTION_STATE_UNSPECIFIED
				if record != nil {
					state = record.state
				}
				message := "execution is not running"
				if accepted {
					message = "cancel signal delivered to process tree"
					slog.Info(
						"grpc cancel received",
						"runnerId", runnerID,
						"taskId", taskID,
						"reason", strings.TrimSpace(cancelTask.GetReason()),
					)
				} else {
					slog.Info("grpc cancel ignored because task is not running", "runnerId", runnerID, "taskId", taskID)
				}
				_ = send(&runnerpb.RunnerEnvelope{Payload: &runnerpb.RunnerEnvelope_CancelAck{CancelAck: &runnerpb.CancelAck{
					TaskId: taskID, ExecutionId: cancelTask.GetExecutionId(), Attempt: normalizeAttempt(cancelTask.GetAttempt()),
					Accepted: accepted, State: state, Message: message,
				}}})
			}
			continue
		}

		req := toTaskRequest(runTask)
		key := keyForTask(runTask)
		_, isNew, acceptErr := registry.accept(runTask)
		if acceptErr != nil {
			_ = send(&runnerpb.RunnerEnvelope{Payload: &runnerpb.RunnerEnvelope_DispatchAck{DispatchAck: &runnerpb.DispatchAck{
				TaskId: req.TaskID, ExecutionId: req.ExecutionID, Attempt: req.Attempt, Accepted: false,
				State: runnerpb.ExecutionState_EXECUTION_STATE_TERMINAL, Message: acceptErr.Error(),
			}}})
			continue
		}
		state, lastSequence := registry.snapshot(key)
		if err := send(&runnerpb.RunnerEnvelope{Payload: &runnerpb.RunnerEnvelope_DispatchAck{DispatchAck: &runnerpb.DispatchAck{
			TaskId: req.TaskID, ExecutionId: req.ExecutionID, Attempt: req.Attempt, Accepted: true, State: state,
			Message:           map[bool]string{true: "execution accepted", false: "duplicate execution resumed"}[isNew],
			LastEventSequence: lastSequence,
		}}}); err != nil {
			return StartLoopResult{}, err
		}
		if !isNew {
			for _, event := range registry.replay(key, runTask.GetResumeFromEventSequence()) {
				if err := sendTaskEvent(send, event); err != nil {
					return StartLoopResult{}, err
				}
			}
			continue
		}
		slog.Info(
			"grpc run_task received",
			"runnerId", runnerID,
			"taskId", req.TaskID,
			"sessionId", req.SessionID,
			"stepId", req.StepID,
			"command", req.Command,
			"workingDir", req.WorkingDir,
			"engine", req.Engine,
		)
		taskCtx, cancelTask := context.WithCancel(ctx)
		_ = registry.setRunning(key, cancelTask)

		go func(taskReq types.TaskRequest, runCtx context.Context, taskCancel context.CancelFunc) {
			defer func() {
				taskCancel()
			}()
			runErr := controller.Run(runCtx, taskReq, types.EventSinkFunc(func(event types.TaskEvent) error {
				pbEvent := toPBTaskEvent(event)
				if err := registry.recordEvent(key, pbEvent); err != nil {
					return err
				}
				if err := sendTaskEvent(send, pbEvent); err != nil {
					slog.Warn("task event buffered for reconnect", "executionId", taskReq.ExecutionID, "sequence", event.Sequence, "err", err)
				}
				return nil
			}))
			if runErr != nil {
				slog.Warn("grpc runner task terminal event persistence failed", "runnerId", runnerID, "taskId", taskReq.TaskID, "err", runErr)
			}
		}(req, taskCtx, cancelTask)
	}
}

func sendTaskEvent(send func(*runnerpb.RunnerEnvelope) error, event *runnerpb.TaskEvent) error {
	return send(&runnerpb.RunnerEnvelope{
		Payload: &runnerpb.RunnerEnvelope_TaskEvent{
			TaskEvent: event,
		},
	})
}

func normalizeGrpcTarget(raw string) string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return "127.0.0.1:9201"
	}
	trimmed = strings.TrimPrefix(trimmed, "http://")
	trimmed = strings.TrimPrefix(trimmed, "https://")
	trimmed = strings.TrimSuffix(trimmed, "/api")
	trimmed = strings.TrimRight(trimmed, "/")
	return trimmed
}

func toTaskRequest(task *runnerpb.TaskRequest) types.TaskRequest {
	var inputJSON []byte
	if raw := task.GetInputJson(); len(raw) > 0 {
		inputJSON = append([]byte{}, raw...)
	}
	var deadline time.Time
	if raw := strings.TrimSpace(task.GetDeadline()); raw != "" {
		deadline, _ = time.Parse(time.RFC3339Nano, raw)
	}
	return types.TaskRequest{
		TaskID:                  task.GetTaskId(),
		SessionID:               task.GetSessionId(),
		StepID:                  task.GetStepId(),
		Command:                 task.GetCommand(),
		Args:                    append([]string{}, task.GetArgs()...),
		Env:                     cloneMap(task.GetEnv()),
		WorkingDir:              strings.TrimSpace(task.GetWorkingDir()),
		Timeout:                 time.Duration(task.GetTimeoutMs()) * time.Millisecond,
		Stream:                  task.GetStream(),
		InputJSON:               inputJSON,
		ExecutionID:             strings.TrimSpace(task.GetExecutionId()),
		Attempt:                 normalizeAttempt(task.GetAttempt()),
		Deadline:                deadline,
		MaxOutputBytes:          task.GetMaxOutputBytes(),
		ResumeFromEventSequence: task.GetResumeFromEventSequence(),
		Engine:                  toEngine(task.GetEngine()),
		Sandbox: types.SandboxPolicy{
			Enabled:                 task.GetSandboxPolicy().GetEnabled(),
			ReadOnly:                task.GetSandboxPolicy().GetReadOnly(),
			AllowNetwork:            task.GetSandboxPolicy().GetAllowNetwork(),
			AllowedWorkingDirs:      append([]string{}, task.GetSandboxPolicy().GetAllowedWorkingDirs()...),
			AllowedReadPaths:        append([]string{}, task.GetSandboxPolicy().GetAllowedReadPaths()...),
			AllowedWritePaths:       append([]string{}, task.GetSandboxPolicy().GetAllowedWritePaths()...),
			BlockedCommandFragments: append([]string{}, task.GetSandboxPolicy().GetBlockedCommandFragments()...),
			AllowedEnvKeys:          append([]string{}, task.GetSandboxPolicy().GetAllowedEnvKeys()...),
			DeniedEnvKeys:           append([]string{}, task.GetSandboxPolicy().GetDeniedEnvKeys()...),
		},
		Docker: toDockerSpec(task.GetDocker()),
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
		mounts = append(mounts, types.Mount{Source: mount.GetSource(), Target: mount.GetTarget(), ReadOnly: mount.GetReadOnly()})
	}
	return types.DockerSpec{
		Image: spec.GetImage(), WorkDir: spec.GetWorkDir(), User: spec.GetUser(),
		NetworkDisabled: spec.GetNetworkDisabled(), ReadOnlyRootFS: spec.GetReadOnlyRootFs(), Mounts: mounts,
		CPULimitMillis: spec.GetCpuLimitMillis(), MemoryLimit: spec.GetMemoryLimitBytes(),
		PIDsLimit: spec.GetPidsLimit(), DiskLimit: spec.GetDiskLimitBytes(),
	}
}

func toEngine(engine runnerpb.Engine) types.Engine {
	switch engine {
	case runnerpb.Engine_ENGINE_DOCKER:
		return types.EngineDocker
	case runnerpb.Engine_ENGINE_HOST, runnerpb.Engine_ENGINE_UNSPECIFIED:
		return types.EngineHost
	default:
		return types.EngineHost
	}
}

func toPBTaskEvent(event types.TaskEvent) *runnerpb.TaskEvent {
	base := &runnerpb.TaskEvent{
		TaskId:        event.TaskID,
		SessionId:     event.SessionID,
		StepId:        event.StepID,
		Type:          toPBEventType(event.Type),
		Timestamp:     event.Timestamp.UTC().Format(time.RFC3339Nano),
		RunnerId:      event.RunnerID,
		ExecutionId:   event.ExecutionID,
		Attempt:       event.Attempt,
		EventSequence: event.Sequence,
	}

	switch event.Type {
	case types.EventStarted:
		base.Payload = &runnerpb.TaskEvent_Started{
			Started: &runnerpb.StartedPayload{Message: event.Message},
		}
	case types.EventStdout:
		base.Payload = &runnerpb.TaskEvent_Stdout{
			Stdout: &runnerpb.StreamPayload{Chunk: event.Chunk, ChunkSequence: event.ChunkSequence, ByteOffset: event.ByteOffset, Truncated: event.Truncated},
		}
	case types.EventStderr:
		base.Payload = &runnerpb.TaskEvent_Stderr{
			Stderr: &runnerpb.StreamPayload{Chunk: event.Chunk, ChunkSequence: event.ChunkSequence, ByteOffset: event.ByteOffset, Truncated: event.Truncated},
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
				ExitCode:    event.ExitCode,
				OutputJson:  event.Output,
				StdoutBytes: event.StdoutBytes, StderrBytes: event.StderrBytes, OutputTruncated: event.OutputTruncated,
			},
		}
	case types.EventError:
		base.Payload = &runnerpb.TaskEvent_Error{
			Error: &runnerpb.ErrorPayload{
				Message:     event.Message,
				Retryable:   event.Retryable,
				FailureType: toPBFailureType(event.FailureType), Code: event.Code,
			},
		}
	case types.EventCompleted:
		base.Payload = &runnerpb.TaskEvent_Completed{
			Completed: &runnerpb.CompletedPayload{
				ExitCode:   event.ExitCode,
				DurationMs: uint64(event.Duration.Milliseconds()),
				Status:     toPBTerminalStatus(event.TerminalStatus), FailureType: toPBFailureType(event.FailureType),
				Message: event.Message, StdoutBytes: event.StdoutBytes, StderrBytes: event.StderrBytes,
				OutputTruncated: event.OutputTruncated,
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

func toPBTerminalStatus(status types.TerminalStatus) runnerpb.TerminalStatus {
	switch status {
	case types.TerminalSucceeded:
		return runnerpb.TerminalStatus_TERMINAL_STATUS_SUCCEEDED
	case types.TerminalFailed:
		return runnerpb.TerminalStatus_TERMINAL_STATUS_FAILED
	case types.TerminalCancelled:
		return runnerpb.TerminalStatus_TERMINAL_STATUS_CANCELLED
	case types.TerminalTimedOut:
		return runnerpb.TerminalStatus_TERMINAL_STATUS_TIMED_OUT
	case types.TerminalRejected:
		return runnerpb.TerminalStatus_TERMINAL_STATUS_REJECTED
	default:
		return runnerpb.TerminalStatus_TERMINAL_STATUS_UNSPECIFIED
	}
}

func toPBFailureType(kind types.FailureType) runnerpb.FailureType {
	switch kind {
	case types.FailureValidation:
		return runnerpb.FailureType_FAILURE_TYPE_VALIDATION
	case types.FailurePolicy:
		return runnerpb.FailureType_FAILURE_TYPE_POLICY
	case types.FailureProcessStart:
		return runnerpb.FailureType_FAILURE_TYPE_PROCESS_START
	case types.FailureProcessExit:
		return runnerpb.FailureType_FAILURE_TYPE_PROCESS_EXIT
	case types.FailureTimeout:
		return runnerpb.FailureType_FAILURE_TYPE_TIMEOUT
	case types.FailureCancelled:
		return runnerpb.FailureType_FAILURE_TYPE_CANCELLED
	case types.FailureOutputLimit:
		return runnerpb.FailureType_FAILURE_TYPE_OUTPUT_LIMIT
	case types.FailureResourceExhausted:
		return runnerpb.FailureType_FAILURE_TYPE_RESOURCE_EXHAUSTED
	case types.FailureInternal:
		return runnerpb.FailureType_FAILURE_TYPE_INTERNAL
	default:
		return runnerpb.FailureType_FAILURE_TYPE_UNSPECIFIED
	}
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

func cloneMap(input map[string]string) map[string]string {
	if len(input) == 0 {
		return map[string]string{}
	}
	out := make(map[string]string, len(input))
	for key, value := range input {
		out[key] = value
	}
	return out
}
