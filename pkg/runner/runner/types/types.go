package types

import (
	"context"
	"time"
)

type Engine string

const (
	EngineHost   Engine = "host"
	EngineDocker Engine = "docker"
)

type EventType string

const (
	EventStarted   EventType = "started"
	EventStdout    EventType = "stdout"
	EventStderr    EventType = "stderr"
	EventProgress  EventType = "progress"
	EventResult    EventType = "result"
	EventError     EventType = "error"
	EventCompleted EventType = "completed"
	EventHeartbeat EventType = "heartbeat"
)

type ExecutionState string

const (
	ExecutionAccepted ExecutionState = "accepted"
	ExecutionRunning  ExecutionState = "running"
	ExecutionTerminal ExecutionState = "terminal"
)

type TerminalStatus string

const (
	TerminalSucceeded TerminalStatus = "succeeded"
	TerminalFailed    TerminalStatus = "failed"
	TerminalCancelled TerminalStatus = "cancelled"
	TerminalTimedOut  TerminalStatus = "timed_out"
	TerminalRejected  TerminalStatus = "rejected"
)

type FailureType string

const (
	FailureNone              FailureType = ""
	FailureValidation        FailureType = "validation"
	FailurePolicy            FailureType = "policy"
	FailureProcessStart      FailureType = "process_start"
	FailureProcessExit       FailureType = "process_exit"
	FailureTimeout           FailureType = "timeout"
	FailureCancelled         FailureType = "cancelled"
	FailureOutputLimit       FailureType = "output_limit"
	FailureResourceExhausted FailureType = "resource_exhausted"
	FailureInternal          FailureType = "internal"
)

type Mount struct {
	Source   string `json:"source"`
	Target   string `json:"target"`
	ReadOnly bool   `json:"readOnly"`
}

type DockerSpec struct {
	Image           string  `json:"image"`
	WorkDir         string  `json:"workDir"`
	User            string  `json:"user"`
	NetworkDisabled bool    `json:"networkDisabled"`
	ReadOnlyRootFS  bool    `json:"readOnlyRootFs"`
	Mounts          []Mount `json:"mounts"`
	CPULimitMillis  uint64  `json:"cpuLimitMillis"`
	MemoryLimit     uint64  `json:"memoryLimitBytes"`
	PIDsLimit       uint32  `json:"pidsLimit"`
	DiskLimit       uint64  `json:"diskLimitBytes"`
}

type SandboxPolicy struct {
	Enabled                 bool     `json:"enabled"`
	ReadOnly                bool     `json:"readOnly"`
	AllowNetwork            bool     `json:"allowNetwork"`
	AllowedWorkingDirs      []string `json:"allowedWorkingDirs"`
	AllowedReadPaths        []string `json:"allowedReadPaths"`
	AllowedWritePaths       []string `json:"allowedWritePaths"`
	BlockedCommandFragments []string `json:"blockedCommandFragments"`
	AllowedEnvKeys          []string `json:"allowedEnvKeys"`
	DeniedEnvKeys           []string `json:"deniedEnvKeys"`
}

type TaskRequest struct {
	TaskID                  string
	SessionID               string
	StepID                  string
	Command                 string
	Args                    []string
	Env                     map[string]string
	WorkingDir              string
	Timeout                 time.Duration
	Stream                  bool
	InputJSON               []byte
	ExecutionID             string
	Attempt                 uint32
	Deadline                time.Time
	MaxOutputBytes          uint64
	ResumeFromEventSequence uint64

	Engine  Engine
	Sandbox SandboxPolicy
	Docker  DockerSpec
}

type TaskResult struct {
	ExitCode        int32
	Output          []byte
	Duration        time.Duration
	StdoutBytes     uint64
	StderrBytes     uint64
	OutputTruncated bool
}

type TaskEvent struct {
	TaskID      string
	SessionID   string
	StepID      string
	Type        EventType
	Timestamp   time.Time
	RunnerID    string
	ExecutionID string
	Attempt     uint32
	Sequence    uint64

	Message         string
	Chunk           string
	Percent         uint32
	ExitCode        int32
	Output          []byte
	Retryable       bool
	Duration        time.Duration
	ChunkSequence   uint64
	ByteOffset      uint64
	Truncated       bool
	FailureType     FailureType
	Code            string
	TerminalStatus  TerminalStatus
	StdoutBytes     uint64
	StderrBytes     uint64
	OutputTruncated bool
}

type ExecutionError struct {
	Type      FailureType
	Code      string
	Message   string
	Retryable bool
	Cause     error
}

func (e *ExecutionError) Error() string {
	if e == nil {
		return ""
	}
	if e.Message != "" {
		return e.Message
	}
	if e.Cause != nil {
		return e.Cause.Error()
	}
	return string(e.Type)
}

func (e *ExecutionError) Unwrap() error {
	if e == nil {
		return nil
	}
	return e.Cause
}

type EventSink interface {
	Emit(event TaskEvent) error
}

type EventSinkFunc func(event TaskEvent) error

func (f EventSinkFunc) Emit(event TaskEvent) error {
	return f(event)
}

type Executor interface {
	ID() string
	Engine() Engine
	Run(ctx context.Context, req TaskRequest, sink EventSink) (TaskResult, error)
}
