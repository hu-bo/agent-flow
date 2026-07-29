package runner

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/agent-flow/runner/runner/types"
)

type gitStatusInput struct {
	Pathspec []string `json:"pathspec"`
}

type gitDiffInput struct {
	Cached   bool     `json:"cached"`
	Base     string   `json:"base"`
	Pathspec []string `json:"pathspec"`
}

type gitShowInput struct {
	Revision string `json:"revision"`
	Path     string `json:"path"`
}

type gitApplyInput struct {
	Patch   string `json:"patch"`
	Reverse bool   `json:"reverse"`
}

func (r *ControllerImpl) runGitCommand(ctx context.Context, req types.TaskRequest, sink types.EventSink) error {
	if req.Engine == types.EngineDocker {
		return &types.ExecutionError{Type: types.FailureValidation, Code: "GIT_DOCKER_UNSUPPORTED", Message: "semantic Git operations target the bound host workspace"}
	}
	if req.Sandbox.Enabled {
		if err := r.guard.Validate(req, req.Sandbox); err != nil {
			return &types.ExecutionError{Type: types.FailurePolicy, Code: "GIT_POLICY_REJECTED", Message: err.Error(), Cause: err}
		}
		if req.Sandbox.ReadOnly && req.Command == "git.apply" {
			return &types.ExecutionError{Type: types.FailurePolicy, Code: "GIT_APPLY_READ_ONLY", Message: "git.apply is not allowed in read-only mode"}
		}
	}
	if _, err := resolveReadScopedPath(req, "."); err != nil {
		return err
	}
	if err := sink.Emit(types.TaskEvent{
		TaskID: req.TaskID, SessionID: req.SessionID, StepID: req.StepID, Type: types.EventStarted,
		Timestamp: time.Now(), Message: "semantic Git operation started",
	}); err != nil {
		return err
	}

	args, cleanup, err := buildGitArgs(req)
	if cleanup != nil {
		defer cleanup()
	}
	if err != nil {
		return &types.ExecutionError{Type: types.FailureValidation, Code: "GIT_INPUT_INVALID", Message: err.Error(), Cause: err}
	}
	gitReq := req
	gitReq.Command = "git"
	gitReq.Args = args
	if req.Command == "git.apply" {
		if _, checkErr := r.hostExecutor.Run(ctx, gitReq, types.EventSinkFunc(func(types.TaskEvent) error { return nil })); checkErr != nil {
			return &types.ExecutionError{
				Type: types.FailureValidation, Code: "GIT_APPLY_CHECK_FAILED",
				Message: "git apply precondition check failed", Cause: checkErr,
			}
		}
		gitReq.Args = removeArgument(args, "--check")
	}
	_, runErr := r.hostExecutor.Run(ctx, gitReq, sink)
	return runErr
}

func buildGitArgs(req types.TaskRequest) ([]string, func(), error) {
	switch req.Command {
	case "git.status":
		var input gitStatusInput
		if err := decodeInput(req.InputJSON, &input); err != nil {
			return nil, nil, err
		}
		args := []string{"status", "--porcelain=v2", "--branch", "--untracked-files=all"}
		return appendPathspec(args, input.Pathspec), nil, nil
	case "git.diff":
		var input gitDiffInput
		if err := decodeInput(req.InputJSON, &input); err != nil {
			return nil, nil, err
		}
		args := []string{"diff", "--no-ext-diff", "--patch", "--no-color"}
		if input.Cached {
			args = append(args, "--cached")
		}
		if revision := strings.TrimSpace(input.Base); revision != "" {
			if err := validateGitRevision(revision); err != nil {
				return nil, nil, err
			}
			args = append(args, revision)
		}
		return appendPathspec(args, input.Pathspec), nil, nil
	case "git.show":
		var input gitShowInput
		if err := decodeInput(req.InputJSON, &input); err != nil {
			return nil, nil, err
		}
		revision := strings.TrimSpace(input.Revision)
		if revision == "" {
			revision = "HEAD"
		}
		if err := validateGitRevision(revision); err != nil {
			return nil, nil, err
		}
		args := []string{"show", "--no-ext-diff", "--no-color", revision}
		if path := strings.TrimSpace(input.Path); path != "" {
			args = append(args, "--", path)
		}
		return args, nil, nil
	case "git.apply":
		var input gitApplyInput
		if err := decodeInput(req.InputJSON, &input); err != nil {
			return nil, nil, err
		}
		if strings.TrimSpace(input.Patch) == "" {
			return nil, nil, fmt.Errorf("git.apply requires patch")
		}
		workspace, err := resolveWriteScopedPath(req, ".")
		if err != nil {
			return nil, nil, err
		}
		temp, err := os.CreateTemp(workspace, ".agent-flow-git-*.patch")
		if err != nil {
			return nil, nil, err
		}
		tempPath := temp.Name()
		cleanup := func() { _ = os.Remove(tempPath) }
		if _, err = temp.WriteString(input.Patch); err == nil {
			err = temp.Sync()
		}
		if closeErr := temp.Close(); err == nil {
			err = closeErr
		}
		if err != nil {
			cleanup()
			return nil, nil, err
		}
		relativePatch, err := filepath.Rel(workspace, tempPath)
		if err != nil {
			cleanup()
			return nil, nil, err
		}
		args := []string{"apply", "--check", "--whitespace=nowarn"}
		if input.Reverse {
			args = append(args, "--reverse")
		}
		args = append(args, relativePatch)
		return args, cleanup, nil
	default:
		return nil, nil, fmt.Errorf("unsupported semantic Git command: %s", req.Command)
	}
}

func appendPathspec(args, pathspec []string) []string {
	if len(pathspec) == 0 {
		return args
	}
	args = append(args, "--")
	for _, path := range pathspec {
		if trimmed := strings.TrimSpace(path); trimmed != "" {
			args = append(args, trimmed)
		}
	}
	return args
}

func validateGitRevision(revision string) error {
	if strings.HasPrefix(revision, "-") || strings.ContainsAny(revision, "\r\n\x00") {
		return fmt.Errorf("invalid Git revision")
	}
	return nil
}

func removeArgument(args []string, target string) []string {
	out := make([]string, 0, len(args))
	for _, arg := range args {
		if arg != target {
			out = append(out, arg)
		}
	}
	return out
}
