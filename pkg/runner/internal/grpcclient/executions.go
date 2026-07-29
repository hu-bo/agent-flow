package grpcclient

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"

	runnerpb "github.com/agent-flow/runner/protocol/proto"
	"google.golang.org/protobuf/encoding/protojson"
)

type executionKey struct {
	id      string
	attempt uint32
}

type executionRecord struct {
	taskID  string
	state   runnerpb.ExecutionState
	events  []*runnerpb.TaskEvent
	lastAck uint64
	cancel  func()
}

type executionRegistry struct {
	mu            sync.Mutex
	path          string
	maxConcurrent uint32
	records       map[executionKey]*executionRecord
}

type persistedRegistry struct {
	Executions []persistedExecution `json:"executions"`
}

type persistedExecution struct {
	ExecutionID string            `json:"executionId"`
	Attempt     uint32            `json:"attempt"`
	TaskID      string            `json:"taskId"`
	State       int32             `json:"state"`
	LastAck     uint64            `json:"lastAck"`
	Events      []json.RawMessage `json:"events"`
}

var (
	registryOnce  sync.Once
	registryValue *executionRegistry
)

func defaultExecutionRegistry(maxConcurrent uint32) *executionRegistry {
	registryOnce.Do(func() {
		registryValue = newExecutionRegistry(defaultExecutionStatePath(), maxConcurrent)
		_ = registryValue.load()
	})
	registryValue.mu.Lock()
	if maxConcurrent > 0 {
		registryValue.maxConcurrent = maxConcurrent
	}
	registryValue.mu.Unlock()
	return registryValue
}

func newExecutionRegistry(path string, maxConcurrent uint32) *executionRegistry {
	if maxConcurrent == 0 {
		maxConcurrent = 1
	}
	return &executionRegistry{path: path, maxConcurrent: maxConcurrent, records: make(map[executionKey]*executionRecord)}
}

func (r *executionRegistry) accept(task *runnerpb.TaskRequest) (*executionRecord, bool, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	key := keyForTask(task)
	if record := r.records[key]; record != nil {
		return record, false, nil
	}
	var active uint32
	for _, record := range r.records {
		if record.state != runnerpb.ExecutionState_EXECUTION_STATE_TERMINAL {
			active++
		}
	}
	if active >= r.maxConcurrent {
		return nil, false, &resourceExhaustedError{active: active, limit: r.maxConcurrent}
	}
	record := &executionRecord{taskID: task.GetTaskId(), state: runnerpb.ExecutionState_EXECUTION_STATE_ACCEPTED}
	r.records[key] = record
	return record, true, r.persistLocked()
}

func (r *executionRegistry) setRunning(key executionKey, cancel func()) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	record := r.records[key]
	if record == nil {
		return errors.New("execution record not found")
	}
	record.state = runnerpb.ExecutionState_EXECUTION_STATE_RUNNING
	record.cancel = cancel
	return r.persistLocked()
}

func (r *executionRegistry) recordEvent(key executionKey, event *runnerpb.TaskEvent) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	record := r.records[key]
	if record == nil {
		return errors.New("execution record not found")
	}
	for _, existing := range record.events {
		if existing.GetEventSequence() == event.GetEventSequence() {
			return nil
		}
	}
	record.events = append(record.events, event)
	if event.GetCompleted() != nil {
		record.state = runnerpb.ExecutionState_EXECUTION_STATE_TERMINAL
		record.cancel = nil
	}
	return r.persistLocked()
}

func (r *executionRegistry) acknowledge(key executionKey, sequence uint64) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	record := r.records[key]
	if record == nil || sequence <= record.lastAck {
		return nil
	}
	record.lastAck = sequence
	firstPending := 0
	for firstPending < len(record.events) && record.events[firstPending].GetEventSequence() <= sequence {
		firstPending++
	}
	if firstPending > 0 {
		record.events = append([]*runnerpb.TaskEvent{}, record.events[firstPending:]...)
	}
	return r.persistLocked()
}

func (r *executionRegistry) cancelExecution(executionID string, attempt uint32, taskID string) (*executionRecord, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	var record *executionRecord
	if strings.TrimSpace(executionID) != "" {
		record = r.records[executionKey{id: executionID, attempt: normalizeAttempt(attempt)}]
	} else {
		for _, candidate := range r.records {
			if candidate.taskID == taskID && candidate.state != runnerpb.ExecutionState_EXECUTION_STATE_TERMINAL {
				record = candidate
				break
			}
		}
	}
	if record == nil || record.state == runnerpb.ExecutionState_EXECUTION_STATE_TERMINAL || record.cancel == nil {
		return record, false
	}
	record.cancel()
	return record, true
}

func (r *executionRegistry) replay(key executionKey, after uint64) []*runnerpb.TaskEvent {
	r.mu.Lock()
	defer r.mu.Unlock()
	record := r.records[key]
	if record == nil {
		return nil
	}
	if after < record.lastAck {
		after = record.lastAck
	}
	out := make([]*runnerpb.TaskEvent, 0)
	for _, event := range record.events {
		if event.GetEventSequence() > after {
			out = append(out, event)
		}
	}
	return out
}

func (r *executionRegistry) replayAll() []*runnerpb.TaskEvent {
	r.mu.Lock()
	defer r.mu.Unlock()
	var out []*runnerpb.TaskEvent
	for _, record := range r.records {
		for _, event := range record.events {
			if event.GetEventSequence() > record.lastAck {
				out = append(out, event)
			}
		}
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].GetExecutionId() == out[j].GetExecutionId() {
			return out[i].GetEventSequence() < out[j].GetEventSequence()
		}
		return out[i].GetTimestamp() < out[j].GetTimestamp()
	})
	return out
}

func (r *executionRegistry) stats() (active, limit uint32) {
	r.mu.Lock()
	defer r.mu.Unlock()
	for _, record := range r.records {
		if record.state != runnerpb.ExecutionState_EXECUTION_STATE_TERMINAL {
			active++
		}
	}
	return active, r.maxConcurrent
}

func (r *executionRegistry) snapshot(key executionKey) (runnerpb.ExecutionState, uint64) {
	r.mu.Lock()
	defer r.mu.Unlock()
	record := r.records[key]
	if record == nil {
		return runnerpb.ExecutionState_EXECUTION_STATE_UNSPECIFIED, 0
	}
	lastSequence := record.lastAck
	if count := len(record.events); count > 0 && record.events[count-1].GetEventSequence() > lastSequence {
		lastSequence = record.events[count-1].GetEventSequence()
	}
	return record.state, lastSequence
}

func (r *executionRegistry) load() error {
	if strings.TrimSpace(r.path) == "" {
		return nil
	}
	raw, err := os.ReadFile(r.path)
	if errors.Is(err, os.ErrNotExist) {
		return nil
	}
	if err != nil {
		return err
	}
	var persisted persistedRegistry
	if err := json.Unmarshal(raw, &persisted); err != nil {
		return err
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	for _, saved := range persisted.Executions {
		record := &executionRecord{taskID: saved.TaskID, state: runnerpb.ExecutionState(saved.State), lastAck: saved.LastAck}
		for _, eventJSON := range saved.Events {
			event := &runnerpb.TaskEvent{}
			if err := protojson.Unmarshal(eventJSON, event); err == nil {
				record.events = append(record.events, event)
			}
		}
		if record.state != runnerpb.ExecutionState_EXECUTION_STATE_TERMINAL {
			record.state = runnerpb.ExecutionState_EXECUTION_STATE_TERMINAL
			sequence := uint64(1)
			if len(record.events) > 0 {
				sequence = record.events[len(record.events)-1].GetEventSequence() + 1
			}
			record.events = append(record.events, restartTerminalEvent(saved, sequence))
		}
		r.records[executionKey{id: saved.ExecutionID, attempt: saved.Attempt}] = record
	}
	return r.persistLocked()
}

func (r *executionRegistry) persistLocked() error {
	if strings.TrimSpace(r.path) == "" {
		return nil
	}
	persisted := persistedRegistry{}
	for key, record := range r.records {
		saved := persistedExecution{ExecutionID: key.id, Attempt: key.attempt, TaskID: record.taskID, State: int32(record.state), LastAck: record.lastAck}
		for _, event := range record.events {
			raw, err := protojson.Marshal(event)
			if err != nil {
				return err
			}
			saved.Events = append(saved.Events, raw)
		}
		persisted.Executions = append(persisted.Executions, saved)
	}
	raw, err := json.MarshalIndent(persisted, "", "  ")
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(r.path), 0o700); err != nil {
		return err
	}
	temp, err := os.CreateTemp(filepath.Dir(r.path), "executions-*.tmp")
	if err != nil {
		return err
	}
	tempPath := temp.Name()
	defer os.Remove(tempPath)
	if err := temp.Chmod(0o600); err == nil {
		_, err = temp.Write(raw)
	}
	if closeErr := temp.Close(); err == nil {
		err = closeErr
	}
	if err != nil {
		return err
	}
	return replaceFile(tempPath, r.path)
}

func defaultExecutionStatePath() string {
	home, err := os.UserHomeDir()
	if err != nil {
		return ""
	}
	return filepath.Join(home, ".aflow-runner", "executions.json")
}

func keyForTask(task *runnerpb.TaskRequest) executionKey {
	id := strings.TrimSpace(task.GetExecutionId())
	if id == "" {
		id = strings.TrimSpace(task.GetTaskId())
	}
	return executionKey{id: id, attempt: normalizeAttempt(task.GetAttempt())}
}

func normalizeAttempt(attempt uint32) uint32 {
	if attempt == 0 {
		return 1
	}
	return attempt
}

type resourceExhaustedError struct{ active, limit uint32 }

func (e *resourceExhaustedError) Error() string {
	return fmt.Sprintf("runner concurrency exhausted: active=%d limit=%d", e.active, e.limit)
}

func restartTerminalEvent(saved persistedExecution, sequence uint64) *runnerpb.TaskEvent {
	return &runnerpb.TaskEvent{
		TaskId: saved.TaskID, ExecutionId: saved.ExecutionID, Attempt: saved.Attempt, EventSequence: sequence,
		Type: runnerpb.TaskEventType_TASK_EVENT_TYPE_COMPLETED,
		Payload: &runnerpb.TaskEvent_Completed{Completed: &runnerpb.CompletedPayload{
			ExitCode: -1, Status: runnerpb.TerminalStatus_TERMINAL_STATUS_FAILED,
			FailureType: runnerpb.FailureType_FAILURE_TYPE_INTERNAL, Message: "runner restarted before execution reached a terminal state",
		}},
	}
}
