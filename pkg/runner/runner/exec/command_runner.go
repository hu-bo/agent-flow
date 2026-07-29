package exec

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	osexec "os/exec"
	"sync"
	"time"

	"github.com/agent-flow/runner/runner/types"
)

type ProcessMetadata map[string]any

func RunProcess(
	ctx context.Context,
	req types.TaskRequest,
	sink types.EventSink,
	runnerID string,
	command string,
	args []string,
	metadata ProcessMetadata,
) (types.TaskResult, error) {
	start := time.Now()
	managed := newManagedCommand(ctx, command, args...)
	if req.WorkingDir != "" {
		managed.Cmd.Dir = req.WorkingDir
	}
	managed.Cmd.Env = mergeEnv(req.Env)

	stdoutPipe, err := managed.Cmd.StdoutPipe()
	if err != nil {
		return types.TaskResult{}, processStartError("create stdout pipe", err)
	}
	stderrPipe, err := managed.Cmd.StderrPipe()
	if err != nil {
		return types.TaskResult{}, processStartError("create stderr pipe", err)
	}
	if err := managed.Start(); err != nil {
		return types.TaskResult{}, processStartError("start command", err)
	}

	collector := newOutputCollector(req.MaxOutputBytes)
	var wg sync.WaitGroup
	var stdoutErr, stderrErr error
	wg.Add(2)
	read := func(reader io.Reader, stream outputStream, eventType types.EventType, target *error) {
		defer wg.Done()
		*target = collector.read(reader, stream, func(chunk outputChunk) error {
			if !req.Stream {
				return nil
			}
			return sink.Emit(types.TaskEvent{
				TaskID: req.TaskID, SessionID: req.SessionID, StepID: req.StepID,
				Type: eventType, Timestamp: time.Now(), RunnerID: runnerID, Chunk: chunk.text,
				ChunkSequence: chunk.sequence, ByteOffset: chunk.byteOffset, Truncated: chunk.truncated,
			})
		})
	}
	go read(stdoutPipe, outputStdout, types.EventStdout, &stdoutErr)
	go read(stderrPipe, outputStderr, types.EventStderr, &stderrErr)
	waitErr := managed.Wait()
	wg.Wait()
	if ctx.Err() != nil {
		return types.TaskResult{}, ctx.Err()
	}
	if streamErr := errors.Join(stdoutErr, stderrErr); streamErr != nil {
		return types.TaskResult{}, &types.ExecutionError{
			Type: types.FailureInternal, Code: "OUTPUT_STREAM_FAILED", Message: "read command output failed", Cause: streamErr,
		}
	}

	exitCode := int32(0)
	if waitErr != nil {
		var exitErr *osexec.ExitError
		if errors.As(waitErr, &exitErr) {
			exitCode = int32(exitErr.ExitCode())
		} else {
			exitCode = -1
		}
	}
	summary := collector.summary()
	payload := ProcessMetadata{
		"command": command, "args": args, "stdout": summary.stdout, "stderr": summary.stderr,
		"stdoutBytes": summary.stdoutBytes, "stderrBytes": summary.stderrBytes,
		"outputTruncated": summary.truncated, "success": waitErr == nil,
	}
	for key, value := range metadata {
		payload[key] = value
	}
	output, err := json.Marshal(payload)
	if err != nil {
		return types.TaskResult{}, &types.ExecutionError{Type: types.FailureInternal, Code: "RESULT_ENCODE_FAILED", Cause: err}
	}
	result := types.TaskResult{
		ExitCode: exitCode, Output: output, Duration: time.Since(start),
		StdoutBytes: summary.stdoutBytes, StderrBytes: summary.stderrBytes, OutputTruncated: summary.truncated,
	}
	if err := sink.Emit(types.TaskEvent{
		TaskID: req.TaskID, SessionID: req.SessionID, StepID: req.StepID, Type: types.EventResult,
		Timestamp: time.Now(), RunnerID: runnerID, ExitCode: result.ExitCode, Output: result.Output,
		StdoutBytes: result.StdoutBytes, StderrBytes: result.StderrBytes, OutputTruncated: result.OutputTruncated,
	}); err != nil {
		return types.TaskResult{}, err
	}
	if waitErr != nil {
		return result, &types.ExecutionError{
			Type: types.FailureProcessExit, Code: "PROCESS_EXIT_NON_ZERO", Message: waitErr.Error(), Cause: waitErr,
		}
	}
	return result, nil
}

func processStartError(action string, err error) error {
	return &types.ExecutionError{
		Type: types.FailureProcessStart, Code: "PROCESS_START_FAILED", Message: fmt.Sprintf("%s: %v", action, err), Cause: err,
	}
}
