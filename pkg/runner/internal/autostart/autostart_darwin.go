package autostart

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

const darwinPlistName = labelPrefix + ".plist"

func installDarwin(executablePath string, opts Options) (string, error) {
	plistPath, err := darwinPlistPath()
	if err != nil {
		return "", err
	}
	if err := ensureParentDir(plistPath); err != nil {
		return "", fmt.Errorf("create launch agents directory: %w", err)
	}
	content, err := darwinPlist(executablePath, opts)
	if err != nil {
		return "", err
	}
	if err := os.WriteFile(plistPath, []byte(content), 0o644); err != nil {
		return "", fmt.Errorf("write launch agent plist: %w", err)
	}

	launchctl := launchctlBinary()
	_ = exec.Command(launchctl, "unload", plistPath).Run()
	if err := exec.Command(launchctl, "load", plistPath).Run(); err != nil {
		return "", fmt.Errorf("load launch agent: %w", err)
	}

	return plistPath, nil
}

func uninstallDarwin() (string, error) {
	plistPath, err := darwinPlistPath()
	if err != nil {
		return "", err
	}
	if fileExists(plistPath) {
		_ = exec.Command(launchctlBinary(), "unload", plistPath).Run()
	}
	err = os.Remove(plistPath)
	if err != nil && !os.IsNotExist(err) {
		return "", fmt.Errorf("remove launch agent plist: %w", err)
	}
	return plistPath, nil
}

func darwinPlistPath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("resolve home directory: %w", err)
	}
	return filepath.Join(home, "Library", "LaunchAgents", darwinPlistName), nil
}

func darwinPlist(executablePath string, opts Options) (string, error) {
	logDir, err := os.UserCacheDir()
	if err != nil {
		return "", fmt.Errorf("resolve user cache directory: %w", err)
	}
	logDir = filepath.Join(logDir, "agent-flow", "runner")
	stdoutPath := filepath.Join(logDir, "stdout.log")
	stderrPath := filepath.Join(logDir, "stderr.log")

	entries := []string{
		"<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
		"<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">",
		"<plist version=\"1.0\">",
		"<dict>",
		"  <key>Label</key>",
		"  <string>" + xmlEscape(labelPrefix) + "</string>",
		"  <key>ProgramArguments</key>",
		"  <array>",
	}
	for _, arg := range append([]string{executablePath}, buildStartArgs(opts)...) {
		entries = append(entries, "    <string>"+xmlEscape(arg)+"</string>")
	}
	entries = append(entries,
		"  </array>",
		"  <key>RunAtLoad</key>",
		"  <true/>",
		"  <key>KeepAlive</key>",
		"  <true/>",
		"  <key>WorkingDirectory</key>",
		"  <string>"+xmlEscape(filepath.Dir(executablePath))+"</string>",
		"  <key>StandardOutPath</key>",
		"  <string>"+xmlEscape(stdoutPath)+"</string>",
		"  <key>StandardErrorPath</key>",
		"  <string>"+xmlEscape(stderrPath)+"</string>",
		"</dict>",
		"</plist>",
	)
	return strings.Join(entries, "\n"), nil
}
