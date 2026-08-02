package model

import (
	"bytes"
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
)

const (
	configDirName  = ".aflow-runner"
	configFileName = "config.json"
)

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

func SaveLocalConfig(cfg LocalConfig) error {
	path, err := resolveConfigFilePath()
	if err != nil {
		return err
	}
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
