package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"github.com/agent-flow/runner/internal/model"
)

func TestSaveResolvedRunnerConfigWritesWorkspaceConfig(t *testing.T) {
	homeDir := t.TempDir()
	setCmdTestHome(t, homeDir)

	workspaceDir := t.TempDir()
	workspaceConfigPath := filepath.Join(workspaceDir, "config.json")
	resolved := model.ResolvedConfig{
		Path:   workspaceConfigPath,
		Source: model.ConfigSourceWorkspace,
	}

	cfg := model.LocalConfig{
		RunnerID:    "runner-dev",
		RunnerToken: "workspace-token",
		ServerAddr:  "127.0.0.1:9201",
	}
	if err := saveResolvedRunnerConfig(resolved, cfg); err != nil {
		t.Fatalf("save resolved runner config: %v", err)
	}

	savedWorkspace := readSavedConfig(t, workspaceConfigPath)
	if savedWorkspace.RunnerID != "runner-dev" {
		t.Fatalf("expected workspace config runner id to be saved, got %q", savedWorkspace.RunnerID)
	}

	homeConfigPath := filepath.Join(homeDir, ".aflow-runner", "config.json")
	if _, err := os.Stat(homeConfigPath); !os.IsNotExist(err) {
		t.Fatalf("expected home config to remain untouched, stat err=%v", err)
	}
}

func TestSaveResolvedRunnerConfigKeepsHomeWritesForExecutableSource(t *testing.T) {
	homeDir := t.TempDir()
	setCmdTestHome(t, homeDir)

	resolved := model.ResolvedConfig{
		Path:   filepath.Join(t.TempDir(), "config.json"),
		Source: model.ConfigSourceExecutable,
	}

	cfg := model.LocalConfig{
		RunnerID:    "runner-prod",
		RunnerToken: "home-token",
		ServerAddr:  "aflow-grpc.8and1.cn:80",
	}
	if err := saveResolvedRunnerConfig(resolved, cfg); err != nil {
		t.Fatalf("save resolved runner config: %v", err)
	}

	homeConfigPath := filepath.Join(homeDir, ".aflow-runner", "config.json")
	savedHome := readSavedConfig(t, homeConfigPath)
	if savedHome.RunnerID != "runner-prod" {
		t.Fatalf("expected home config runner id to be saved, got %q", savedHome.RunnerID)
	}
	if _, err := os.Stat(resolved.Path); !os.IsNotExist(err) {
		t.Fatalf("expected executable-side config to remain untouched, stat err=%v", err)
	}
}

func setCmdTestHome(t *testing.T, homeDir string) {
	t.Helper()
	t.Setenv("HOME", homeDir)
	t.Setenv("USERPROFILE", homeDir)
}

func readSavedConfig(t *testing.T, path string) model.LocalConfig {
	t.Helper()
	raw, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("read config %s: %v", path, err)
	}

	var cfg model.LocalConfig
	if err := json.Unmarshal(raw, &cfg); err != nil {
		t.Fatalf("unmarshal config %s: %v", path, err)
	}
	return cfg
}
