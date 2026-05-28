package main

import (
	"crypto/sha256"
	"encoding/hex"
	"net"
	"runtime"
	"sort"
	"strings"
)

const (
	deviceRunnerIDPrefix = "runner_dev_"
	deviceRunnerIDSalt   = "aflow-runner-device-v1"
)

func resolveRunnerID(configRunnerID string, hostName string) string {
	if id := strings.TrimSpace(configRunnerID); id != "" {
		return id
	}
	return buildDeviceRunnerID(hostName)
}

func buildDeviceRunnerID(hostName string) string {
	parts := []string{
		deviceRunnerIDSalt,
		runtime.GOOS,
		runtime.GOARCH,
	}

	if machineID := normalizeDeviceToken(readMachineID()); machineID != "" {
		parts = append(parts, "machine="+machineID)
	}

	macs := readHardwareAddresses()
	if len(macs) > 0 {
		parts = append(parts, "mac="+strings.Join(macs, ","))
	}

	if normalizedHost := normalizeDeviceToken(hostName); normalizedHost != "" {
		parts = append(parts, "host="+normalizedHost)
	}

	digest := sha256.Sum256([]byte(strings.Join(parts, "|")))
	// 16 bytes => 32 hex chars. Full id length stays far below varchar(128).
	return deviceRunnerIDPrefix + hex.EncodeToString(digest[:16])
}

func readHardwareAddresses() []string {
	interfaces, err := net.Interfaces()
	if err != nil {
		return nil
	}

	out := make([]string, 0, len(interfaces))
	seen := map[string]struct{}{}

	for _, iface := range interfaces {
		if iface.Flags&net.FlagLoopback != 0 {
			continue
		}
		mac := strings.TrimSpace(strings.ToLower(iface.HardwareAddr.String()))
		if mac == "" {
			continue
		}
		if _, exists := seen[mac]; exists {
			continue
		}
		seen[mac] = struct{}{}
		out = append(out, mac)
	}

	sort.Strings(out)
	return out
}

func normalizeDeviceToken(value string) string {
	value = strings.TrimSpace(strings.ToLower(value))
	value = strings.ReplaceAll(value, "\r", "")
	value = strings.ReplaceAll(value, "\n", "")
	return value
}
