package grpcclient

import (
	"context"
	"fmt"
	"io"
	"log/slog"
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
	RunnerID     string
	RunnerToken  string
	ServerAddr   string
	Kind         string
	Host         string
	Version      string
	Capabilities []string
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
	stream, err := client.Connect(ctx)
	if err != nil {
		return StartLoopResult{}, err
	}

	var sendMu sync.Mutex
	send := func(envelope *runnerpb.RunnerEnvelope) error {
		sendMu.Lock()
		defer sendMu.Unlock()
		return stream.Send(envelope)
	}

	register := &runnerpb.RunnerEnvelope{
		Payload: &runnerpb.RunnerEnvelope_Register{
			Register: &runnerpb.ConnectRegister{
				RunnerToken:  opts.RunnerToken,
				RunnerId:     strings.TrimSpace(opts.RunnerID),
				Kind:         strings.TrimSpace(opts.Kind),
				Host:         strings.TrimSpace(opts.Host),
				Version:      strings.TrimSpace(opts.Version),
				Capabilities: append([]string{}, opts.Capabilities...),
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

	heartbeatTicker := time.NewTicker(time.Duration(heartbeatIntervalMs) * time.Millisecond)
	defer heartbeatTicker.Stop()
	runningTasks := make(map[string]context.CancelFunc)
	var runningMu sync.Mutex

	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case <-heartbeatTicker.C:
				hb := &runnerpb.RunnerEnvelope{
					Payload: &runnerpb.RunnerEnvelope_Heartbeat{
						Heartbeat: &runnerpb.ConnectHeartbeat{
							RunnerId:    runnerID,
							RunnerToken: opts.RunnerToken,
							Timestamp:   time.Now().UTC().Format(time.RFC3339Nano),
						},
					},
				}
				if err := send(hb); err != nil {
					slog.Warn("grpc heartbeat send failed", "runnerId", runnerID, "err", err)
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
			cancelTask := serverEnvelope.GetCancelTask()
			if cancelTask != nil {
				taskID := strings.TrimSpace(cancelTask.GetTaskId())
				if taskID == "" {
					continue
				}
				runningMu.Lock()
				cancel := runningTasks[taskID]
				runningMu.Unlock()
				if cancel != nil {
					slog.Info(
						"grpc cancel received",
						"runnerId", runnerID,
						"taskId", taskID,
						"reason", strings.TrimSpace(cancelTask.GetReason()),
					)
					cancel()
				} else {
					slog.Info("grpc cancel ignored because task is not running", "runnerId", runnerID, "taskId", taskID)
				}
			}
			continue
		}

		req := toTaskRequest(runTask)
		taskCtx, cancelTask := context.WithCancel(ctx)
		runningMu.Lock()
		runningTasks[req.TaskID] = cancelTask
		runningMu.Unlock()

		go func(taskReq types.TaskRequest, runCtx context.Context, taskCancel context.CancelFunc) {
			taskStart := time.Now()
			defer func() {
				taskCancel()
				runningMu.Lock()
				delete(runningTasks, taskReq.TaskID)
				runningMu.Unlock()
			}()
			runErr := controller.Run(runCtx, taskReq, types.EventSinkFunc(func(event types.TaskEvent) error {
				return sendTaskEvent(send, toPBTaskEvent(event))
			}))
			if runErr != nil {
				slog.Warn("grpc runner task failed", "runnerId", runnerID, "taskId", taskReq.TaskID, "err", runErr)
				_ = sendTaskEvent(send, &runnerpb.TaskEvent{
					TaskId:    taskReq.TaskID,
					SessionId: taskReq.SessionID,
					StepId:    taskReq.StepID,
					Type:      runnerpb.TaskEventType_TASK_EVENT_TYPE_ERROR,
					Timestamp: time.Now().UTC().Format(time.RFC3339Nano),
					RunnerId:  runnerID,
					Payload: &runnerpb.TaskEvent_Error{
						Error: &runnerpb.ErrorPayload{
							Message:   runErr.Error(),
							Retryable: false,
						},
					},
				})
				_ = sendTaskEvent(send, &runnerpb.TaskEvent{
					TaskId:    taskReq.TaskID,
					SessionId: taskReq.SessionID,
					StepId:    taskReq.StepID,
					Type:      runnerpb.TaskEventType_TASK_EVENT_TYPE_COMPLETED,
					Timestamp: time.Now().UTC().Format(time.RFC3339Nano),
					RunnerId:  runnerID,
					Payload: &runnerpb.TaskEvent_Completed{
						Completed: &runnerpb.CompletedPayload{
							ExitCode:   1,
							DurationMs: uint64(time.Since(taskStart).Milliseconds()),
						},
					},
				})
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
	return types.TaskRequest{
		TaskID:     task.GetTaskId(),
		SessionID:  task.GetSessionId(),
		StepID:     task.GetStepId(),
		Command:    task.GetCommand(),
		Args:       append([]string{}, task.GetArgs()...),
		Env:        cloneMap(task.GetEnv()),
		WorkingDir: strings.TrimSpace(task.GetWorkingDir()),
		Timeout:    time.Duration(task.GetTimeoutMs()) * time.Millisecond,
		Stream:     task.GetStream(),
		InputJSON:  inputJSON,
		Engine:     toEngine(task.GetEngine()),
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
			Started: &runnerpb.StartedPayload{Message: event.Message},
		}
	case types.EventStdout:
		base.Payload = &runnerpb.TaskEvent_Stdout{
			Stdout: &runnerpb.StreamPayload{Chunk: event.Chunk},
		}
	case types.EventStderr:
		base.Payload = &runnerpb.TaskEvent_Stderr{
			Stderr: &runnerpb.StreamPayload{Chunk: event.Chunk},
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
