package main

import (
	"log/slog"
	"net"
	"os"

	"github.com/agent-flow/runner/internal/auth"
	"github.com/agent-flow/runner/internal/server"
	"github.com/agent-flow/runner/protocol/proto"
	"github.com/agent-flow/runner/runner"
	"github.com/agent-flow/runner/runner/docker"
	"github.com/agent-flow/runner/runner/exec"
	"github.com/agent-flow/runner/runner/sandbox"
	"google.golang.org/grpc"
)

const (
	defaultAddr    = ":8091"
	defaultVersion = "0.1.0"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo})))

	addr := os.Getenv("RUNNER_ADDR")
	if addr == "" {
		addr = defaultAddr
	}

	authToken := os.Getenv("RUNNER_AUTH_TOKEN")
	version := os.Getenv("RUNNER_VERSION")
	if version == "" {
		version = defaultVersion
	}

	dockerBinary := os.Getenv("RUNNER_DOCKER_BIN")
	hostExec := exec.NewHostExecutor("host-default")
	dockerExec := docker.NewExecutor("docker-default", dockerBinary)
	sandboxGuard := sandbox.NewStaticGuard()
	controller, err := runner.New(runner.Config{
		HostExecutor:   hostExec,
		DockerExecutor: dockerExec,
		Guard:          sandboxGuard,
	})
	if err != nil {
		slog.Error("failed to initialize runner controller", "err", err)
		os.Exit(1)
	}

	authVerifier := auth.NewStaticTokenVerifier(authToken)

	service := server.NewRunnerService(controller, authVerifier, version)

	grpcServer := grpc.NewServer()
	runnerpb.RegisterRunnerServiceServer(grpcServer, service)

	listener, err := net.Listen("tcp", addr)
	if err != nil {
		slog.Error("failed to listen", "addr", addr, "err", err)
		os.Exit(1)
	}

	slog.Info("runnerd started", "addr", addr, "version", version)
	if err := grpcServer.Serve(listener); err != nil {
		slog.Error("runnerd stopped with error", "err", err)
		os.Exit(1)
	}
}
