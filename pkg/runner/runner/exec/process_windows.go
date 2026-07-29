//go:build windows

package exec

import (
	"fmt"
	osexec "os/exec"
	"unsafe"

	"golang.org/x/sys/windows"
)

type treeHandle windows.Handle

func configureProcessTree(cmd *osexec.Cmd) {
	cmd.SysProcAttr = &windows.SysProcAttr{CreationFlags: windows.CREATE_NEW_PROCESS_GROUP}
}

func attachProcessTree(cmd *osexec.Cmd) (treeHandle, error) {
	job, err := windows.CreateJobObject(nil, nil)
	if err != nil {
		return 0, fmt.Errorf("create job object: %w", err)
	}
	info := windows.JOBOBJECT_EXTENDED_LIMIT_INFORMATION{}
	info.BasicLimitInformation.LimitFlags = windows.JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
	if _, err = windows.SetInformationJobObject(
		job, windows.JobObjectExtendedLimitInformation, uintptr(unsafe.Pointer(&info)), uint32(unsafe.Sizeof(info)),
	); err != nil {
		windows.CloseHandle(job)
		return 0, fmt.Errorf("configure job object: %w", err)
	}
	process, err := windows.OpenProcess(windows.PROCESS_SET_QUOTA|windows.PROCESS_TERMINATE, false, uint32(cmd.Process.Pid))
	if err != nil {
		windows.CloseHandle(job)
		return 0, fmt.Errorf("open child process: %w", err)
	}
	defer windows.CloseHandle(process)
	if err = windows.AssignProcessToJobObject(job, process); err != nil {
		windows.CloseHandle(job)
		return 0, fmt.Errorf("assign child to job object: %w", err)
	}
	return treeHandle(job), nil
}

func killProcessTree(_ *osexec.Cmd, handle treeHandle) error {
	if handle == 0 {
		return nil
	}
	return windows.TerminateJobObject(windows.Handle(handle), 1)
}

func releaseProcessTree(handle treeHandle) error {
	if handle == 0 {
		return nil
	}
	return windows.CloseHandle(windows.Handle(handle))
}
