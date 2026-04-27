package exec

import (
	"context"

	"github.com/agent-flow/runner/runner/types"
)

type Executor = types.Executor
type TaskRequest = types.TaskRequest
type TaskResult = types.TaskResult
type EventSink = types.EventSink
type Engine = types.Engine

type Factory interface {
	New(id string) Executor
}

type RunnerFunc func(ctx context.Context, req TaskRequest, sink EventSink) (TaskResult, error)
