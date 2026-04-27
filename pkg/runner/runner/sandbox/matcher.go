package sandbox

import "strings"

func matchesBlockedFragment(command string, args []string, fragment string) bool {
	line := " " + strings.ToLower(strings.TrimSpace(command+" "+strings.Join(args, " "))) + " "
	return strings.Contains(line, strings.ToLower(fragment))
}
