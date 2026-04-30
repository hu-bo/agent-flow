package model

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
)

const (
	configDirName  = "agent-flow"
	configFileName = "runner.json"
)

type LocalConfig struct {
	RunnerID    string `json:"runnerId"`
	RunnerToken string `json:"runnerToken"`
	ServerAddr  string `json:"serverAddr"`
}

func LoadLocalConfig() (LocalConfig, error) {
	path, err := resolveConfigFilePath()
	if err != nil {
		return LocalConfig{}, err
	}

	raw, err := os.ReadFile(path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return LocalConfig{}, nil
		}
		return LocalConfig{}, err
	}

	var cfg LocalConfig
	if err := json.Unmarshal(raw, &cfg); err != nil {
		return LocalConfig{}, err
	}
	return cfg, nil
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
	base, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(base, configDirName, configFileName), nil
}
