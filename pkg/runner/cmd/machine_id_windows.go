//go:build windows

package main

import (
	"strings"

	"golang.org/x/sys/windows/registry"
)

func readMachineID() string {
	accessModes := []uint32{
		registry.QUERY_VALUE | registry.WOW64_64KEY,
		registry.QUERY_VALUE,
	}
	for _, accessMode := range accessModes {
		key, err := registry.OpenKey(registry.LOCAL_MACHINE, `SOFTWARE\Microsoft\Cryptography`, accessMode)
		if err != nil {
			continue
		}
		value, _, valueErr := key.GetStringValue("MachineGuid")
		key.Close()
		if valueErr != nil {
			continue
		}
		return strings.TrimSpace(value)
	}
	return ""
}
