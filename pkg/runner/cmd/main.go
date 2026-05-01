package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log/slog"
	"net"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/agent-flow/runner/internal/auth"
	"github.com/agent-flow/runner/internal/grpcclient"
	"github.com/agent-flow/runner/internal/model"
	"github.com/agent-flow/runner/internal/server"
	runnerpb "github.com/agent-flow/runner/protocol/proto"
	runnercore "github.com/agent-flow/runner/runner"
	"github.com/agent-flow/runner/runner/docker"
	"github.com/agent-flow/runner/runner/exec"
	"github.com/agent-flow/runner/runner/sandbox"
	"google.golang.org/grpc"
)

const (
	defaultAddr       = ":8091"
	defaultVersion    = "0.1.0"
	defaultRunnerKind = "local"
	defaultGRPCServer = "127.0.0.1:9201"
	defaultCaps       = "shell.exec,fs.read,fs.write,fs.patch,fs.list,fs.search"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo})))
	if err := run(); err != nil {
		slog.Error("runner exited with error", "err", err)
		os.Exit(1)
	}
}

func run() error {
	args := os.Args[1:]
	if len(args) == 0 {
		return runStart(nil)
	}

	switch args[0] {
	case "start":
		return runStart(args[1:])
	case "serve":
		return runServe(args[1:])
	case "-h", "--help", "help":
		printUsage()
		return nil
	default:
		// Compatibility: if user passes flags without subcommand, treat as start mode.
		if strings.HasPrefix(args[0], "-") {
			return runStart(args)
		}
		return fmt.Errorf("unknown command: %s", args[0])
	}
}

func runStart(args []string) error {
	fs := flag.NewFlagSet("start", flag.ContinueOnError)
	fs.SetOutput(os.Stdout)

	cfg, _ := model.LoadLocalConfig()
	defaultToken := strings.TrimSpace(cfg.RunnerToken)
	defaultHost := strings.TrimSpace(cfg.ServerAddr)
	if defaultHost == "" {
		defaultHost = defaultGRPCServer
	}

	rpcHost := fs.String("rpc_host", defaultHost, "web-server grpc host:port")
	rpcToken := fs.String("rpc_token", defaultToken, "runner token issued by web-server")
	runnerID := fs.String("runner_id", strings.TrimSpace(cfg.RunnerID), "runner id for reconnect")
	kind := fs.String("kind", defaultRunnerKind, "runner kind: local|remote|sandbox")
	defaultHostName := localHostname()
	defaultHostIP := localHostIP()
	hostLabel := fs.String("host", defaultHostName, "runner host label")
	hostName := fs.String("host_name", defaultHostName, "runner host name used for per-host identity")
	hostIP := fs.String("host_ip", defaultHostIP, "runner host ip address")
	version := fs.String("version", resolveVersion(), "runner version")
	capabilities := fs.String("capabilities", defaultCaps, "comma-separated capability list")
	dockerBinary := fs.String("docker_bin", os.Getenv("RUNNER_DOCKER_BIN"), "docker binary path")

	if err := fs.Parse(args); err != nil {
		return err
	}

	if strings.TrimSpace(*rpcToken) == "" {
		return errors.New("rpc_token is required")
	}

	controller, err := newController(*dockerBinary)
	if err != nil {
		return err
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	runnerTokenValue := strings.TrimSpace(*rpcToken)
	rpcHostValue := strings.TrimSpace(*rpcHost)
	var registeredRunnerID string
	persistRegistration := func(result grpcclient.StartLoopResult) {
		resultRunnerID := strings.TrimSpace(result.RunnerID)
		if resultRunnerID == "" {
			return
		}
		registeredRunnerID = resultRunnerID
		saveErr := model.SaveLocalConfig(model.LocalConfig{
			RunnerID:    resultRunnerID,
			RunnerToken: runnerTokenValue,
			ServerAddr:  rpcHostValue,
		})
		if saveErr != nil {
			slog.Warn("failed to persist local runner config", "err", saveErr)
			return
		}
		slog.Info("local runner config persisted", "runnerId", resultRunnerID)
	}

	result, err := grpcclient.StartLoop(ctx, controller, grpcclient.StartLoopOptions{
		RunnerID:     strings.TrimSpace(*runnerID),
		RunnerToken:  runnerTokenValue,
		ServerAddr:   rpcHostValue,
		Kind:         strings.TrimSpace(*kind),
		Host:         strings.TrimSpace(*hostLabel),
		HostName:     strings.TrimSpace(*hostName),
		HostIP:       strings.TrimSpace(*hostIP),
		Version:      strings.TrimSpace(*version),
		Capabilities: parseCSV(*capabilities),
		OnRegistered: persistRegistration,
	})
	if err != nil && !errors.Is(err, context.Canceled) {
		return err
	}
	resultRunnerID := strings.TrimSpace(result.RunnerID)
	if resultRunnerID == "" {
		resultRunnerID = strings.TrimSpace(registeredRunnerID)
	}

	slog.Info("runner stopped", "runnerId", resultRunnerID, "transport", "grpc")
	return nil
}

func runServe(args []string) error {
	fs := flag.NewFlagSet("serve", flag.ContinueOnError)
	fs.SetOutput(os.Stdout)

	addr := fs.String("addr", envOrDefault("RUNNER_ADDR", defaultAddr), "grpc listen address")
	authToken := fs.String("auth_token", strings.TrimSpace(os.Getenv("RUNNER_AUTH_TOKEN")), "static auth token")
	version := fs.String("version", resolveVersion(), "runner version")
	dockerBinary := fs.String("docker_bin", os.Getenv("RUNNER_DOCKER_BIN"), "docker binary path")
	if err := fs.Parse(args); err != nil {
		return err
	}

	controller, err := newController(*dockerBinary)
	if err != nil {
		return err
	}

	authVerifier := auth.NewStaticTokenVerifier(strings.TrimSpace(*authToken))
	service := server.NewRunnerService(controller, authVerifier, strings.TrimSpace(*version))
	grpcServer := grpc.NewServer()
	runnerpb.RegisterRunnerServiceServer(grpcServer, service)

	listener, err := net.Listen("tcp", strings.TrimSpace(*addr))
	if err != nil {
		return err
	}

	slog.Info("runner grpc serve mode started", "addr", *addr, "version", *version)
	return grpcServer.Serve(listener)
}

func newController(dockerBinary string) (runnercore.Controller, error) {
	hostExec := exec.NewHostExecutor("host-default")
	dockerExec := docker.NewExecutor("docker-default", dockerBinary)
	sandboxGuard := sandbox.NewStaticGuard()
	return runnercore.New(runnercore.Config{
		HostExecutor:   hostExec,
		DockerExecutor: dockerExec,
		Guard:          sandboxGuard,
	})
}

func resolveVersion() string {
	raw := strings.TrimSpace(os.Getenv("RUNNER_VERSION"))
	if raw == "" {
		return defaultVersion
	}
	return raw
}

func parseCSV(raw string) []string {
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		value := strings.TrimSpace(part)
		if value == "" {
			continue
		}
		out = append(out, value)
	}
	return out
}

func localHostname() string {
	name, err := os.Hostname()
	if err != nil {
		return "unknown-host"
	}
	name = strings.TrimSpace(name)
	if name == "" {
		return "unknown-host"
	}
	return name
}

func localHostIP() string {
	interfaces, err := net.Interfaces()
	if err != nil {
		return ""
	}
	for _, iface := range interfaces {
		if iface.Flags&net.FlagUp == 0 || iface.Flags&net.FlagLoopback != 0 {
			continue
		}
		addrs, err := iface.Addrs()
		if err != nil {
			continue
		}
		for _, addr := range addrs {
			ip := ipFromAddr(addr)
			if ip == nil || ip.IsLoopback() {
				continue
			}
			if ipv4 := ip.To4(); ipv4 != nil {
				return ipv4.String()
			}
		}
	}
	return ""
}

func ipFromAddr(addr net.Addr) net.IP {
	switch value := addr.(type) {
	case *net.IPNet:
		return value.IP
	case *net.IPAddr:
		return value.IP
	default:
		return nil
	}
}

func envOrDefault(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func printUsage() {
	fmt.Print(`agent-flow runner

Usage:
  runner start --rpc_host 127.0.0.1:9201 --rpc_token <token>
  runner serve --addr :8091 --auth_token <token>

Commands:
  start   Connect to web-server and execute tasks over gRPC Connect stream.
  serve   Legacy gRPC server mode.
`)
}
