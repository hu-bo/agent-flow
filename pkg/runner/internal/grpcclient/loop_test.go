package grpcclient

import (
	"testing"
	"unicode/utf8"

	runnerpb "github.com/agent-flow/runner/protocol/proto"
	"github.com/agent-flow/runner/runner/types"
	"google.golang.org/protobuf/proto"
)

func TestSanitizeTaskEventForSendReplacesInvalidUTF8Strings(t *testing.T) {
	t.Parallel()

	invalid := string([]byte{'o', 'k', 0xff, 'n', 'o'})
	event := &runnerpb.TaskEvent{
		TaskId:        invalid,
		SessionId:     "session",
		StepId:        invalid,
		Type:          runnerpb.TaskEventType_TASK_EVENT_TYPE_STDERR,
		Timestamp:     "2026-08-09T00:00:00Z",
		RunnerId:      invalid,
		ExecutionId:   "execution",
		Attempt:       1,
		EventSequence: 2,
		Payload: &runnerpb.TaskEvent_Stderr{
			Stderr: &runnerpb.StreamPayload{Chunk: invalid, ChunkSequence: 1},
		},
	}

	safe := sanitizeTaskEventForSend(event)
	if !utf8.ValidString(safe.GetTaskId()) || !utf8.ValidString(safe.GetStepId()) || !utf8.ValidString(safe.GetRunnerId()) {
		t.Fatalf("expected top-level strings to be valid UTF-8")
	}
	if !utf8.ValidString(safe.GetStderr().GetChunk()) {
		t.Fatalf("expected stderr chunk to be valid UTF-8")
	}
	if _, err := proto.Marshal(safe); err != nil {
		t.Fatalf("marshal sanitized event: %v", err)
	}
}

func TestToPBTaskEventProducesUTF8SafeStrings(t *testing.T) {
	t.Parallel()

	invalid := string([]byte{0xff, 'b', 'a', 'd'})
	event := toPBTaskEvent(types.TaskEvent{
		TaskID:  invalid,
		StepID:  invalid,
		Type:    types.EventStdout,
		Message: invalid,
		Chunk:   invalid,
	})

	if !utf8.ValidString(event.GetTaskId()) || !utf8.ValidString(event.GetStepId()) {
		t.Fatalf("expected top-level strings to be valid UTF-8")
	}
	if !utf8.ValidString(event.GetStdout().GetChunk()) {
		t.Fatalf("expected stdout chunk to be valid UTF-8")
	}
	if _, err := proto.Marshal(event); err != nil {
		t.Fatalf("marshal generated event: %v", err)
	}
}
