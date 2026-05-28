//go:build !linux && !darwin && !windows

package main

func readMachineID() string {
	return ""
}
