package autostart

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
)

const (
	labelPrefix = "com.agentflow.runner"
)

type Options struct {
	RPCHost      string
	RPCToken     string
	RunnerID     string
	Kind         string
	Host         string
	HostName     string
	HostIP       string
	Version      string
	Capabilities []string
	DockerBinary string
}

func Install(opts Options) (string, error) {
	executablePath, err := os.Executable()
	if err != nil {
		return "", fmt.Errorf("resolve executable: %w", err)
	}
	executablePath, err = filepath.Abs(executablePath)
	if err != nil {
		return "", fmt.Errorf("resolve executable path: %w", err)
	}

	switch runtime.GOOS {
	case "windows":
		return installWindows(executablePath, opts)
	case "darwin":
		return installDarwin(executablePath, opts)
	default:
		return "", fmt.Errorf("autostart is not supported on %s", runtime.GOOS)
	}
}

func Uninstall() (string, error) {
	switch runtime.GOOS {
	case "windows":
		return uninstallWindows()
	case "darwin":
		return uninstallDarwin()
	default:
		return "", fmt.Errorf("autostart is not supported on %s", runtime.GOOS)
	}
}

func Describe(opts Options) (string, error) {
	executablePath, err := os.Executable()
	if err != nil {
		return "", fmt.Errorf("resolve executable: %w", err)
	}
	executablePath, err = filepath.Abs(executablePath)
	if err != nil {
		return "", fmt.Errorf("resolve executable path: %w", err)
	}

	switch runtime.GOOS {
	case "windows":
		return windowsScript(executablePath, opts), nil
	case "darwin":
		return darwinPlist(executablePath, opts)
	default:
		return "", fmt.Errorf("autostart is not supported on %s", runtime.GOOS)
	}
}

func buildStartArgs(opts Options) []string {
	args := []string{"start"}
	appendFlag := func(name string, value string) {
		value = strings.TrimSpace(value)
		if value == "" {
			return
		}
		args = append(args, name, value)
	}

	appendFlag("--rpc_host", opts.RPCHost)
	appendFlag("--rpc_token", opts.RPCToken)
	appendFlag("--runner_id", opts.RunnerID)
	appendFlag("--kind", opts.Kind)
	appendFlag("--host", opts.Host)
	appendFlag("--host_name", opts.HostName)
	appendFlag("--host_ip", opts.HostIP)
	appendFlag("--version", opts.Version)
	if len(opts.Capabilities) > 0 {
		appendFlag("--capabilities", strings.Join(normalizeCapabilities(opts.Capabilities), ","))
	}
	appendFlag("--docker_bin", opts.DockerBinary)
	return args
}

func normalizeCapabilities(values []string) []string {
	seen := map[string]struct{}{}
	out := make([]string, 0, len(values))
	for _, value := range values {
		value = strings.TrimSpace(value)
		if value == "" {
			continue
		}
		if _, ok := seen[value]; ok {
			continue
		}
		seen[value] = struct{}{}
		out = append(out, value)
	}
	sort.Strings(out)
	return out
}

func xmlEscape(value string) string {
	replacer := strings.NewReplacer(
		"&", "&amp;",
		"<", "&lt;",
		">", "&gt;",
		`"`, "&quot;",
		"'", "&apos;",
	)
	return replacer.Replace(value)
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func ensureParentDir(path string) error {
	return os.MkdirAll(filepath.Dir(path), 0o755)
}

func launchctlBinary() string {
	path, err := exec.LookPath("launchctl")
	if err == nil {
		return path
	}
	return "/bin/launchctl"
}

func unsupportedError() error {
	return errors.New("autostart is only supported on Windows and macOS")
}
