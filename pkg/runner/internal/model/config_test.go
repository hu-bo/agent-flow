package model

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func TestLoadStartConfigPrefersWorkspaceConfig(t *testing.T) {
	homeDir := t.TempDir()
	setTestHome(t, homeDir)

	workspaceDir := t.TempDir()
	writeRunnerWorkspace(t, workspaceDir)
	writeConfigFile(t, filepath.Join(workspaceDir, configFileName), LocalConfig{
		RunnerToken: "workspace-token",
		ServerAddr:  "127.0.0.1:9201",
	})
	writeConfigFile(t, filepath.Join(homeDir, configDirName, configFileName), LocalConfig{
		RunnerToken: "home-token",
		ServerAddr:  "aflow-grpc.8and1.cn:80",
	})

	originalWD, err := os.Getwd()
	if err != nil {
		t.Fatalf("get working directory: %v", err)
	}
	t.Cleanup(func() {
		_ = os.Chdir(originalWD)
	})
	if err := os.Chdir(workspaceDir); err != nil {
		t.Fatalf("change working directory: %v", err)
	}

	resolved, err := LoadStartConfig()
	if err != nil {
		t.Fatalf("load start config: %v", err)
	}

	if resolved.Source != ConfigSourceWorkspace {
		t.Fatalf("expected workspace source, got %q", resolved.Source)
	}
	if resolved.Path != filepath.Join(workspaceDir, configFileName) {
		t.Fatalf("expected workspace config path, got %q", resolved.Path)
	}
	if resolved.Config.RunnerToken != "workspace-token" {
		t.Fatalf("expected workspace token, got %q", resolved.Config.RunnerToken)
	}
}

func TestLoadStartConfigFindsWorkspaceConfigFromMonorepoRoot(t *testing.T) {
	homeDir := t.TempDir()
	setTestHome(t, homeDir)

	repoRoot := t.TempDir()
	workspaceDir := filepath.Join(repoRoot, "pkg", "runner")
	writeRunnerWorkspace(t, workspaceDir)
	writeConfigFile(t, filepath.Join(workspaceDir, configFileName), LocalConfig{
		RunnerToken: "repo-token",
		ServerAddr:  "127.0.0.1:9201",
	})
	writeConfigFile(t, filepath.Join(homeDir, configDirName, configFileName), LocalConfig{
		RunnerToken: "home-token",
		ServerAddr:  "aflow-grpc.8and1.cn:80",
	})

	originalWD, err := os.Getwd()
	if err != nil {
		t.Fatalf("get working directory: %v", err)
	}
	t.Cleanup(func() {
		_ = os.Chdir(originalWD)
	})
	if err := os.Chdir(repoRoot); err != nil {
		t.Fatalf("change working directory: %v", err)
	}

	resolved, err := LoadStartConfig()
	if err != nil {
		t.Fatalf("load start config: %v", err)
	}

	if resolved.Source != ConfigSourceWorkspace {
		t.Fatalf("expected workspace source, got %q", resolved.Source)
	}
	if resolved.Path != filepath.Join(workspaceDir, configFileName) {
		t.Fatalf("expected workspace config path, got %q", resolved.Path)
	}
	if resolved.Config.RunnerToken != "repo-token" {
		t.Fatalf("expected repo token, got %q", resolved.Config.RunnerToken)
	}
}

func setTestHome(t *testing.T, homeDir string) {
	t.Helper()
	t.Setenv("HOME", homeDir)
	t.Setenv("USERPROFILE", homeDir)
}

func writeRunnerWorkspace(t *testing.T, dir string) {
	t.Helper()
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatalf("create workspace dir: %v", err)
	}
	if err := os.WriteFile(filepath.Join(dir, "go.mod"), []byte("module github.com/agent-flow/runner\n\ngo 1.23.0\n"), 0o644); err != nil {
		t.Fatalf("write go.mod: %v", err)
	}
}

func writeConfigFile(t *testing.T, path string, cfg LocalConfig) {
	t.Helper()
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatalf("create config dir: %v", err)
	}
	raw, err := json.Marshal(cfg)
	if err != nil {
		t.Fatalf("marshal config: %v", err)
	}
	if err := os.WriteFile(path, raw, 0o644); err != nil {
		t.Fatalf("write config: %v", err)
	}
}
