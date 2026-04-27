package sandbox

import "github.com/agent-flow/runner/runner/types"

var defaultBlockedCommandFragments = []string{
	" rm ",
	" rmdir ",
	" del ",
	" mkfs ",
	" format ",
	" shutdown ",
	" reboot ",
}

func normalizePolicy(policy types.SandboxPolicy) types.SandboxPolicy {
	if len(policy.BlockedCommandFragments) == 0 {
		policy.BlockedCommandFragments = append([]string{}, defaultBlockedCommandFragments...)
	}
	// Default to deny network when sandbox is enabled and the caller did not specify it.
	if policy.Enabled && !policy.AllowNetwork {
		policy.AllowNetwork = false
	}
	return policy
}
