package sandbox

import (
	"context"
	"fmt"
	"path/filepath"
	"slices"
	"strings"

	"github.com/agent-flow/runner/runner/types"
)

type Guard interface {
	Validate(req types.TaskRequest, policy types.SandboxPolicy) error
	Wrap(next types.Executor, policy types.SandboxPolicy) types.Executor
}

type StaticGuard struct{}

func NewStaticGuard() *StaticGuard {
	return &StaticGuard{}
}

func (g *StaticGuard) Validate(req types.TaskRequest, policy types.SandboxPolicy) error {
	policy = normalizePolicy(policy)
	if !policy.Enabled {
		return nil
	}

	for _, fragment := range policy.BlockedCommandFragments {
		if matchesBlockedFragment(req.Command, req.Args, fragment) {
			return fmt.Errorf("command blocked by sandbox policy: %s", strings.TrimSpace(fragment))
		}
	}

	if req.WorkingDir != "" && len(policy.AllowedWorkingDirs) > 0 {
		ok, err := isPathAllowed(req.WorkingDir, policy.AllowedWorkingDirs)
		if err != nil {
			return err
		}
		if !ok {
			return fmt.Errorf("working dir %q is not allowed by sandbox policy", req.WorkingDir)
		}
	}

	for key := range req.Env {
		if len(policy.AllowedEnvKeys) > 0 && !slices.Contains(policy.AllowedEnvKeys, key) {
			return fmt.Errorf("env key %q is not allowed by sandbox policy", key)
		}
		if slices.Contains(policy.DeniedEnvKeys, key) {
			return fmt.Errorf("env key %q is denied by sandbox policy", key)
		}
	}

	if policy.ReadOnly {
		commandLine := " " + strings.ToLower(strings.TrimSpace(req.Command+" "+strings.Join(req.Args, " "))) + " "
		lowered := strings.ToLower(commandLine)
		if strings.Contains(lowered, " > ") || strings.Contains(lowered, " >> ") {
			return fmt.Errorf("write redirection is not allowed in read-only sandbox")
		}
	}

	return nil
}

func (g *StaticGuard) Wrap(next types.Executor, policy types.SandboxPolicy) types.Executor {
	return &guardedExecutor{
		next:   next,
		policy: normalizePolicy(policy),
		guard:  g,
	}
}

type guardedExecutor struct {
	next   types.Executor
	policy types.SandboxPolicy
	guard  *StaticGuard
}

func (e *guardedExecutor) ID() string {
	return e.next.ID() + ":sandbox"
}

func (e *guardedExecutor) Engine() types.Engine {
	return e.next.Engine()
}

func (e *guardedExecutor) Run(ctx context.Context, req types.TaskRequest, sink types.EventSink) (types.TaskResult, error) {
	if err := e.guard.Validate(req, e.policy); err != nil {
		return types.TaskResult{}, err
	}

	req.Sandbox = e.policy
	if req.Env == nil {
		req.Env = map[string]string{}
	}
	if !e.policy.AllowNetwork {
		// Host execution cannot strictly enforce offline mode without OS-level sandboxing.
		// This marker allows downstream tooling to react accordingly.
		req.Env["AGENT_FLOW_SANDBOX_NETWORK"] = "disabled"
	}
	if e.policy.ReadOnly {
		req.Env["AGENT_FLOW_SANDBOX_FS"] = "readonly"
	}

	return e.next.Run(ctx, req, sink)
}

func isPathAllowed(path string, allowlist []string) (bool, error) {
	targetAbs, err := filepath.Abs(path)
	if err != nil {
		return false, fmt.Errorf("resolve path %q: %w", path, err)
	}
	targetAbs = filepath.Clean(targetAbs)

	for _, allowedRoot := range allowlist {
		rootAbs, err := filepath.Abs(allowedRoot)
		if err != nil {
			continue
		}
		rootAbs = filepath.Clean(rootAbs)
		rel, err := filepath.Rel(rootAbs, targetAbs)
		if err != nil {
			continue
		}
		if rel == "." || (!strings.HasPrefix(rel, "..") && rel != "..") {
			return true, nil
		}
	}
	return false, nil
}
