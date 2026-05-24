package autostart

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const windowsScriptName = "agent-flow-runner-autostart.cmd"

func installWindows(executablePath string, opts Options) (string, error) {
	scriptPath, err := windowsStartupScriptPath()
	if err != nil {
		return "", err
	}
	if err := ensureParentDir(scriptPath); err != nil {
		return "", fmt.Errorf("create startup directory: %w", err)
	}
	content := windowsScript(executablePath, opts)
	if err := os.WriteFile(scriptPath, []byte(content), 0o644); err != nil {
		return "", fmt.Errorf("write startup script: %w", err)
	}
	return scriptPath, nil
}

func uninstallWindows() (string, error) {
	scriptPath, err := windowsStartupScriptPath()
	if err != nil {
		return "", err
	}
	err = os.Remove(scriptPath)
	if err != nil && !os.IsNotExist(err) {
		return "", fmt.Errorf("remove startup script: %w", err)
	}
	return scriptPath, nil
}

func windowsStartupScriptPath() (string, error) {
	base := strings.TrimSpace(os.Getenv("APPDATA"))
	if base == "" {
		return "", fmt.Errorf("APPDATA is empty")
	}
	return filepath.Join(base, "Microsoft", "Windows", "Start Menu", "Programs", "Startup", windowsScriptName), nil
}

func windowsScript(executablePath string, opts Options) string {
	var b strings.Builder
	b.WriteString("@echo off\r\n")
	b.WriteString("setlocal\r\n")
	b.WriteString("cd /d \"")
	b.WriteString(strings.ReplaceAll(filepath.Dir(executablePath), `"`, `""`))
	b.WriteString("\"\r\n")
	b.WriteString("start \"agent-flow-runner\" /min \"")
	b.WriteString(strings.ReplaceAll(executablePath, `"`, `""`))
	b.WriteString("\"")
	for _, arg := range buildStartArgs(opts) {
		b.WriteString(" ")
		b.WriteString(windowsQuote(arg))
	}
	b.WriteString("\r\n")
	return b.String()
}

func windowsQuote(value string) string {
	value = strings.ReplaceAll(value, `"`, `""`)
	return `"` + value + `"`
}
