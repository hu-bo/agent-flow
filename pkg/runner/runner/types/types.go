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
	TaskID     string
	SessionID  string
	StepID     string
	Command    string
	Args       []string
	Env        map[string]string
	WorkingDir string
	Timeout    time.Duration
	Stream     bool
	InputJSON  []byte

	Engine  Engine
	Sandbox SandboxPolicy
	Docker  DockerSpec
}

type TaskResult struct {
	ExitCode int32
	Output   []byte
	Duration time.Duration
}

type TaskEvent struct {
	TaskID    string
	SessionID string
	StepID    string
	Type      EventType
	Timestamp time.Time
	RunnerID  string

	Message   string
	Chunk     string
	Percent   uint32
	ExitCode  int32
	Output    []byte
	Retryable bool
	Duration  time.Duration
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
