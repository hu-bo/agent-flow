//go:build linux

package main

import (
	"os"
	"strings"
)

func readMachineID() string {
	candidates := []string{
		"/etc/machine-id",
		"/var/lib/dbus/machine-id",
	}

	for _, path := range candidates {
		raw, err := os.ReadFile(path)
		if err != nil {
			continue
		}
		if id := strings.TrimSpace(string(raw)); id != "" {
			return id
		}
	}
	return ""
}
