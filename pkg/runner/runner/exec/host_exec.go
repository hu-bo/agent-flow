package exec

import (
	"context"
	"errors"
	"os"
	"strings"
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
	if strings.TrimSpace(req.Command) == "" {
		return types.TaskResult{}, errors.New("command is required")
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
	return RunProcess(ctx, req, sink, e.id, req.Command, req.Args, ProcessMetadata{"engine": types.EngineHost})
}

func mergeEnv(extra map[string]string) []string {
	env := os.Environ()
	for key, value := range extra {
		if strings.TrimSpace(key) == "" {
			continue
		}
		env = append(env, key+"="+value)
	}
	return env
}
