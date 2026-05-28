//go:build darwin

package main

import (
	"os/exec"
	"regexp"
	"strings"
)

var ioPlatformUUIDPattern = regexp.MustCompile(`"IOPlatformUUID"\s*=\s*"([^"]+)"`)

func readMachineID() string {
	commands := [][]string{
		{"/usr/sbin/ioreg", "-rd1", "-c", "IOPlatformExpertDevice"},
		{"ioreg", "-rd1", "-c", "IOPlatformExpertDevice"},
	}
	for _, command := range commands {
		out, err := exec.Command(command[0], command[1:]...).Output()
		if err != nil {
			continue
		}
		match := ioPlatformUUIDPattern.FindStringSubmatch(string(out))
		if len(match) != 2 {
			continue
		}
		return strings.TrimSpace(match[1])
	}
	return ""
}
