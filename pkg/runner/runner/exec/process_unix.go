//go:build !windows

package exec

import (
	osexec "os/exec"
	"syscall"
)

type treeHandle struct{}

func configureProcessTree(cmd *osexec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
}

func attachProcessTree(_ *osexec.Cmd) (treeHandle, error) { return treeHandle{}, nil }

func killProcessTree(cmd *osexec.Cmd, _ treeHandle) error {
	if cmd.Process == nil {
		return nil
	}
	return syscall.Kill(-cmd.Process.Pid, syscall.SIGKILL)
}

func releaseProcessTree(_ treeHandle) error { return nil }
