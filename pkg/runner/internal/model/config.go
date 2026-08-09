package model

import (
	"bytes"
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strings"
)

const (
	configDirName  = ".aflow-runner"
	configFileName = "config.json"
)

type ConfigSource string

const (
	ConfigSourceExecutable ConfigSource = "executable"
	ConfigSourceWorkspace  ConfigSource = "workspace"
	ConfigSourceHome       ConfigSource = "home"
)

type ResolvedConfig struct {
	Config LocalConfig
	Path   string
	Source ConfigSource
}

type LocalConfig struct {
	RunnerID           string           `json:"runnerId"`
	RunnerToken        string           `json:"runnerToken"`
	ServerAddr         string           `json:"serverAddr"`
	GRPCServerAddr     string           `json:"grpcServerAddr"`
	HTTPServerAddr     string           `json:"httpServerAddr"`
	MaxConcurrentTasks uint32           `json:"maxConcurrentTasks"`
	Platform           *PlatformProfile `json:"platform,omitempty"`
}

type PlatformProfile struct {
	OS                string   `json:"os"`
	Arch              string   `json:"arch"`
	DefaultShell      string   `json:"defaultShell"`
	PathSeparator     string   `json:"pathSeparator"`
	LineEnding        string   `json:"lineEnding"`
	WorkspaceRoots    []string `json:"workspaceRoots"`
	AvailableCommands []string `json:"availableCommands"`
}

func LoadLocalConfig() (LocalConfig, error) {
	path, err := resolveConfigFilePath()
	if err != nil {
		return LocalConfig{}, err
	}
	return loadConfigFile(path)
}

func LoadExecutableDirConfig() (LocalConfig, error) {
	path, err := resolveExecutableConfigFilePath()
	if err != nil {
		return LocalConfig{}, err
	}
	return loadConfigFile(path)
}

func LoadStartConfig() (ResolvedConfig, error) {
	if path, cfg, ok, err := loadUsableConfig(resolveExecutableConfigFilePath); err != nil {
		return ResolvedConfig{}, err
	} else if ok {
		return ResolvedConfig{Config: cfg, Path: path, Source: ConfigSourceExecutable}, nil
	}

	if path, cfg, ok, err := loadUsableConfig(resolveWorkspaceConfigFilePath); err != nil {
		return ResolvedConfig{}, err
	} else if ok {
		return ResolvedConfig{Config: cfg, Path: path, Source: ConfigSourceWorkspace}, nil
	}

	path, err := resolveConfigFilePath()
	if err != nil {
		return ResolvedConfig{}, err
	}
	cfg, err := loadConfigFile(path)
	if err != nil {
		return ResolvedConfig{}, err
	}
	return ResolvedConfig{Config: cfg, Path: path, Source: ConfigSourceHome}, nil
}

func SaveLocalConfig(cfg LocalConfig) error {
	path, err := resolveConfigFilePath()
	if err != nil {
		return err
	}
	return SaveConfigFile(path, cfg)
}

func SaveConfigFile(path string, cfg LocalConfig) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}

	raw, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, raw, 0o600)
}

func resolveConfigFilePath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, configDirName, configFileName), nil
}

func resolveExecutableConfigFilePath() (string, error) {
	executablePath, err := os.Executable()
	if err != nil {
		return "", err
	}
	return filepath.Join(filepath.Dir(executablePath), configFileName), nil
}

func resolveWorkspaceConfigFilePath() (string, error) {
	cwd, err := os.Getwd()
	if err != nil {
		return "", err
	}

	for _, dir := range candidateWorkspaceDirs(cwd) {
		if !isRunnerWorkspaceDir(dir) {
			continue
		}
		path := filepath.Join(dir, configFileName)
		if fileExists(path) {
			return path, nil
		}
	}

	return "", os.ErrNotExist
}

func loadConfigFile(path string) (LocalConfig, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return LocalConfig{}, nil
		}
		return LocalConfig{}, err
	}
	raw = bytes.TrimPrefix(raw, []byte{0xEF, 0xBB, 0xBF})

	var cfg LocalConfig
	if err := json.Unmarshal(raw, &cfg); err != nil {
		return LocalConfig{}, err
	}
	return cfg, nil
}

func loadUsableConfig(resolvePath func() (string, error)) (string, LocalConfig, bool, error) {
	path, err := resolvePath()
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return "", LocalConfig{}, false, nil
		}
		return "", LocalConfig{}, false, err
	}

	cfg, err := loadConfigFile(path)
	if err != nil {
		return "", LocalConfig{}, false, err
	}
	if strings.TrimSpace(cfg.RunnerToken) == "" {
		return path, cfg, false, nil
	}
	return path, cfg, true, nil
}

func candidateWorkspaceDirs(cwd string) []string {
	seen := map[string]struct{}{}
	dirs := make([]string, 0, 8)

	appendDir := func(dir string) {
		if dir == "" {
			return
		}
		cleaned := filepath.Clean(dir)
		if _, exists := seen[cleaned]; exists {
			return
		}
		seen[cleaned] = struct{}{}
		dirs = append(dirs, cleaned)
	}

	for dir := filepath.Clean(cwd); ; dir = filepath.Dir(dir) {
		appendDir(dir)
		appendDir(filepath.Join(dir, "pkg", "runner"))
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
	}

	return dirs
}

func isRunnerWorkspaceDir(dir string) bool {
	if !fileExists(filepath.Join(dir, configFileName)) {
		return false
	}

	goModPath := filepath.Join(dir, "go.mod")
	raw, err := os.ReadFile(goModPath)
	if err != nil {
		return false
	}

	return strings.Contains(string(raw), "module github.com/agent-flow/runner")
}

func fileExists(path string) bool {
	info, err := os.Stat(path)
	return err == nil && !info.IsDir()
}
