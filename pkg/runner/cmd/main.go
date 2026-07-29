package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"io"
	"log/slog"
	"math"
	"net"
	"os"
	osexec "os/exec"
	"os/signal"
	"path/filepath"
	"runtime"
	"strings"
	"syscall"
	"time"

	"github.com/agent-flow/runner/internal/auth"
	"github.com/agent-flow/runner/internal/autostart"
	"github.com/agent-flow/runner/internal/grpcclient"
	"github.com/agent-flow/runner/internal/model"
	"github.com/agent-flow/runner/internal/server"
	runnerpb "github.com/agent-flow/runner/protocol/proto"
	runnercore "github.com/agent-flow/runner/runner"
	"github.com/agent-flow/runner/runner/docker"
	"github.com/agent-flow/runner/runner/exec"
	"github.com/agent-flow/runner/runner/sandbox"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

const (
	defaultAddr       = ":8091"
	defaultRunnerKind = "local"
	defaultGRPCServer = "127.0.0.1:9201"
	defaultCaps       = "shell.exec,fs.roots,fs.read,fs.stat,fs.write,fs.patch,fs.multiPatch,fs.applyPatch,fs.list,fs.glob,fs.search,git.status,git.diff,git.show,git.apply"
	reconnectBaseWait = time.Second
	reconnectMaxWait  = 30 * time.Second
)

var (
	defaultVersion         = "0.1.0"
	buildTargetOS          = ""
	buildTargetArch        = ""
	buildDefaultShell      = ""
	buildPathSeparator     = ""
	buildLineEnding        = ""
	buildAvailableCommands = ""
)

func main() {
	logFile := initLogger()
	if logFile != nil {
		defer logFile.Close()
	}
	if err := run(); err != nil {
		slog.Error("runner exited with error", "err", err)
		os.Exit(1)
	}
}

func initLogger() *os.File {
	writer := io.Writer(os.Stdout)
	logFile, err := openRunnerLogFile()
	if err == nil {
		writer = io.MultiWriter(os.Stdout, logFile)
	}

	slog.SetDefault(slog.New(slog.NewJSONHandler(writer, &slog.HandlerOptions{Level: slog.LevelInfo})))
	if err != nil {
		slog.Warn("failed to open runner log file", "err", err)
		return nil
	}
	return logFile
}

func openRunnerLogFile() (*os.File, error) {
	home := strings.TrimSpace(os.Getenv("USERPROFILE"))
	if home == "" {
		var err error
		home, err = os.UserHomeDir()
		if err != nil {
			return nil, err
		}
	}
	logDir := filepath.Join(home, ".aflow-runner")
	if err := os.MkdirAll(logDir, 0o755); err != nil {
		return nil, err
	}
	return os.OpenFile(filepath.Join(logDir, "runner.log"), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o600)
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
	case "install-autostart":
		return runInstallAutostart(args[1:])
	case "uninstall-autostart":
		return runUninstallAutostart()
	case "print-autostart":
		return runPrintAutostart(args[1:])
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

	cfg, err := loadRunnerConfig()
	if err != nil {
		return err
	}
	defaultToken := strings.TrimSpace(cfg.RunnerToken)
	defaultHost := strings.TrimSpace(firstNonEmpty(cfg.GRPCServerAddr, cfg.ServerAddr))
	if defaultHost == "" {
		defaultHost = defaultGRPCServer
	}

	rpcHost := fs.String("rpc_host", defaultHost, "web-server grpc host:port")
	rpcToken := fs.String("rpc_token", defaultToken, "runner token issued by web-server")
	kind := fs.String("kind", defaultRunnerKind, "runner kind: local|remote|sandbox")
	defaultHostName := localHostname()
	defaultHostIP := localHostIP()
	defaultRunnerID := resolveRunnerID(strings.TrimSpace(cfg.RunnerID), defaultHostName)
	runnerID := fs.String("runner_id", defaultRunnerID, "runner id for reconnect")
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
	resolvedRunnerID := resolveRunnerID(strings.TrimSpace(*runnerID), strings.TrimSpace(*hostName))
	platform := detectPlatformProfile(cfg.Platform)
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

	connectOptions := grpcclient.StartLoopOptions{
		RunnerID:          resolvedRunnerID,
		RunnerToken:       runnerTokenValue,
		ServerAddr:        rpcHostValue,
		Kind:              strings.TrimSpace(*kind),
		Host:              strings.TrimSpace(*hostLabel),
		HostName:          strings.TrimSpace(*hostName),
		HostIP:            strings.TrimSpace(*hostIP),
		Version:           strings.TrimSpace(*version),
		Capabilities:      normalizeCapabilities(parseCSV(*capabilities)),
		OS:                platform.OS,
		Arch:              platform.Arch,
		DefaultShell:      platform.DefaultShell,
		PathSeparator:     platform.PathSeparator,
		LineEnding:        platform.LineEnding,
		WorkspaceRoots:    platform.WorkspaceRoots,
		AvailableCommands: platform.AvailableCommands,
		OnRegistered:      persistRegistration,
	}

	reconnectAttempt := 0
	for {
		result, err := grpcclient.StartLoop(ctx, controller, connectOptions)
		resultRunnerID := strings.TrimSpace(result.RunnerID)
		if resultRunnerID == "" {
			resultRunnerID = strings.TrimSpace(registeredRunnerID)
		}

		// Exit cleanly on local shutdown signals.
		if err == nil && ctx.Err() != nil {
			slog.Info("runner stopped", "runnerId", resultRunnerID, "transport", "grpc")
			return nil
		}
		if err != nil && (errors.Is(err, context.Canceled) || ctx.Err() != nil) {
			slog.Info("runner stopped", "runnerId", resultRunnerID, "transport", "grpc")
			return nil
		}

		if err != nil && !isRetryableRunnerError(err) {
			return err
		}

		waitFor := reconnectDelay(reconnectAttempt)
		reconnectAttempt++
		if err != nil {
			slog.Warn(
				"runner grpc stream disconnected, reconnecting",
				"runnerId", resultRunnerID,
				"attempt", reconnectAttempt,
				"wait", waitFor.String(),
				"err", err,
			)
		} else {
			slog.Warn(
				"runner grpc stream ended, reconnecting",
				"runnerId", resultRunnerID,
				"attempt", reconnectAttempt,
				"wait", waitFor.String(),
			)
		}

		timer := time.NewTimer(waitFor)
		select {
		case <-ctx.Done():
			timer.Stop()
			slog.Info("runner stopped", "runnerId", resultRunnerID, "transport", "grpc")
			return nil
		case <-timer.C:
		}
	}

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

func runInstallAutostart(args []string) error {
	opts, err := parseStartOptions(args)
	if err != nil {
		return err
	}
	if strings.TrimSpace(opts.RPCToken) == "" {
		return errors.New("rpc_token is required")
	}
	path, err := autostart.Install(toAutostartOptions(opts))
	if err != nil {
		return err
	}
	slog.Info("runner autostart installed", "path", path)
	fmt.Println(path)
	return nil
}

func runUninstallAutostart() error {
	path, err := autostart.Uninstall()
	if err != nil {
		return err
	}
	slog.Info("runner autostart removed", "path", path)
	fmt.Println(path)
	return nil
}

func runPrintAutostart(args []string) error {
	opts, err := parseStartOptions(args)
	if err != nil {
		return err
	}
	if strings.TrimSpace(opts.RPCToken) == "" {
		return errors.New("rpc_token is required")
	}
	content, err := autostart.Describe(toAutostartOptions(opts))
	if err != nil {
		return err
	}
	fmt.Println(content)
	return nil
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

func loadRunnerConfig() (model.LocalConfig, error) {
	cfg, err := model.LoadExecutableDirConfig()
	if err != nil {
		return cfg, err
	}
	if strings.TrimSpace(cfg.RunnerToken) != "" {
		return cfg, nil
	}
	return model.LoadLocalConfig()
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

func normalizeCapabilities(values []string) []string {
	seen := map[string]bool{}
	out := make([]string, 0, len(values)+1)
	for _, value := range values {
		value = strings.TrimSpace(value)
		if value == "" || seen[value] {
			continue
		}
		seen[value] = true
		out = append(out, value)
	}
	if seen["fs.list"] && !seen["fs.roots"] {
		out = append(out, "fs.roots")
	}
	return out
}

type startOptions struct {
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

func parseStartOptions(args []string) (startOptions, error) {
	fs := flag.NewFlagSet("start", flag.ContinueOnError)
	fs.SetOutput(os.Stdout)

	cfg, err := loadRunnerConfig()
	if err != nil {
		return startOptions{}, err
	}
	defaultToken := strings.TrimSpace(cfg.RunnerToken)
	defaultHost := strings.TrimSpace(firstNonEmpty(cfg.GRPCServerAddr, cfg.ServerAddr))
	if defaultHost == "" {
		defaultHost = defaultGRPCServer
	}

	rpcHost := fs.String("rpc_host", defaultHost, "web-server grpc host:port")
	rpcToken := fs.String("rpc_token", defaultToken, "runner token issued by web-server")
	kind := fs.String("kind", defaultRunnerKind, "runner kind: local|remote|sandbox")
	defaultHostName := localHostname()
	defaultHostIP := localHostIP()
	defaultRunnerID := resolveRunnerID(strings.TrimSpace(cfg.RunnerID), defaultHostName)
	runnerID := fs.String("runner_id", defaultRunnerID, "runner id for reconnect")
	hostLabel := fs.String("host", defaultHostName, "runner host label")
	hostName := fs.String("host_name", defaultHostName, "runner host name used for per-host identity")
	hostIP := fs.String("host_ip", defaultHostIP, "runner host ip address")
	version := fs.String("version", resolveVersion(), "runner version")
	capabilities := fs.String("capabilities", defaultCaps, "comma-separated capability list")
	dockerBinary := fs.String("docker_bin", os.Getenv("RUNNER_DOCKER_BIN"), "docker binary path")

	if err := fs.Parse(args); err != nil {
		return startOptions{}, err
	}

	resolvedRunnerID := resolveRunnerID(strings.TrimSpace(*runnerID), strings.TrimSpace(*hostName))

	return startOptions{
		RPCHost:      strings.TrimSpace(*rpcHost),
		RPCToken:     strings.TrimSpace(*rpcToken),
		RunnerID:     resolvedRunnerID,
		Kind:         strings.TrimSpace(*kind),
		Host:         strings.TrimSpace(*hostLabel),
		HostName:     strings.TrimSpace(*hostName),
		HostIP:       strings.TrimSpace(*hostIP),
		Version:      strings.TrimSpace(*version),
		Capabilities: normalizeCapabilities(parseCSV(*capabilities)),
		DockerBinary: strings.TrimSpace(*dockerBinary),
	}, nil
}

func toAutostartOptions(opts startOptions) autostart.Options {
	return autostart.Options{
		RPCHost:      opts.RPCHost,
		RPCToken:     opts.RPCToken,
		RunnerID:     opts.RunnerID,
		Kind:         opts.Kind,
		Host:         opts.Host,
		HostName:     opts.HostName,
		HostIP:       opts.HostIP,
		Version:      opts.Version,
		Capabilities: opts.Capabilities,
		DockerBinary: opts.DockerBinary,
	}
}

type platformProfile struct {
	OS                string
	Arch              string
	DefaultShell      string
	PathSeparator     string
	LineEnding        string
	WorkspaceRoots    []string
	AvailableCommands []string
}

func detectPlatformProfile(configProfile *model.PlatformProfile) platformProfile {
	targetOS := firstNonEmpty(configString(configProfile, func(profile *model.PlatformProfile) string {
		return profile.OS
	}), buildTargetOS, runtime.GOOS)
	targetArch := firstNonEmpty(configString(configProfile, func(profile *model.PlatformProfile) string {
		return profile.Arch
	}), buildTargetArch, runtime.GOARCH)
	return platformProfile{
		OS:   targetOS,
		Arch: targetArch,
		DefaultShell: firstNonEmpty(configString(configProfile, func(profile *model.PlatformProfile) string {
			return profile.DefaultShell
		}), buildDefaultShell, detectDefaultShell(targetOS)),
		PathSeparator: firstNonEmpty(configString(configProfile, func(profile *model.PlatformProfile) string {
			return profile.PathSeparator
		}), buildPathSeparator, detectPathSeparator(targetOS)),
		LineEnding: decodeLineEnding(firstNonEmpty(configString(configProfile, func(profile *model.PlatformProfile) string {
			return profile.LineEnding
		}), buildLineEnding, detectLineEnding(targetOS))),
		WorkspaceRoots: uniqueNonEmpty(append(configStringSlice(configProfile, func(profile *model.PlatformProfile) []string {
			return profile.WorkspaceRoots
		}), detectWorkspaceRoots()...)),
		AvailableCommands: uniqueNonEmpty(append(append(configStringSlice(configProfile, func(profile *model.PlatformProfile) []string {
			return profile.AvailableCommands
		}), parseCSV(buildAvailableCommands)...), detectAvailableCommands(targetOS)...)),
	}
}

func configString(profile *model.PlatformProfile, selectValue func(*model.PlatformProfile) string) string {
	if profile == nil {
		return ""
	}
	return selectValue(profile)
}

func configStringSlice(profile *model.PlatformProfile, selectValue func(*model.PlatformProfile) []string) []string {
	if profile == nil {
		return nil
	}
	return selectValue(profile)
}

func detectDefaultShell(targetOS string) string {
	if targetOS == "windows" {
		for _, candidate := range []string{os.Getenv("ComSpec"), "pwsh.exe", "powershell.exe", "cmd.exe"} {
			if commandAvailable(candidate) {
				return filepath.Base(candidate)
			}
		}
		return "cmd.exe"
	}
	for _, candidate := range []string{os.Getenv("SHELL"), "bash", "zsh", "sh"} {
		if commandAvailable(candidate) {
			return filepath.Base(candidate)
		}
	}
	return "sh"
}

func detectPathSeparator(targetOS string) string {
	if targetOS == "windows" {
		return "\\"
	}
	return "/"
}

func detectLineEnding(targetOS string) string {
	if targetOS == "windows" {
		return "CRLF"
	}
	return "LF"
}

func decodeLineEnding(value string) string {
	switch strings.ToUpper(strings.TrimSpace(value)) {
	case "CRLF", "\\R\\N", "\\r\\n":
		return "\r\n"
	case "LF", "\\N", "\\n":
		return "\n"
	default:
		return value
	}
}

func detectWorkspaceRoots() []string {
	roots := []string{}
	if cwd, err := os.Getwd(); err == nil {
		roots = append(roots, cwd)
	}
	if home, err := os.UserHomeDir(); err == nil {
		roots = append(roots, home)
	}
	return uniqueNonEmpty(roots)
}

func detectAvailableCommands(targetOS string) []string {
	candidates := []string{"git", "node", "npm", "pnpm", "go", "python", "python3"}
	if targetOS == "windows" {
		candidates = append(candidates, "cmd.exe", "powershell.exe", "pwsh.exe", "where.exe")
	} else {
		candidates = append(candidates, "sh", "bash", "zsh", "grep", "find", "rg", "which")
	}

	available := make([]string, 0, len(candidates))
	for _, candidate := range candidates {
		if commandAvailable(candidate) {
			available = append(available, filepath.Base(candidate))
		}
	}
	return uniqueNonEmpty(available)
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		value = strings.TrimSpace(value)
		if value != "" {
			return value
		}
	}
	return ""
}

func commandAvailable(command string) bool {
	command = strings.TrimSpace(command)
	if command == "" {
		return false
	}
	if filepath.IsAbs(command) {
		info, err := os.Stat(command)
		return err == nil && !info.IsDir()
	}
	_, err := osexec.LookPath(command)
	return err == nil
}

func uniqueNonEmpty(values []string) []string {
	seen := map[string]bool{}
	out := make([]string, 0, len(values))
	for _, value := range values {
		value = strings.TrimSpace(value)
		if value == "" || seen[value] {
			continue
		}
		seen[value] = true
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

func reconnectDelay(attempt int) time.Duration {
	if attempt < 0 {
		attempt = 0
	}
	// Exponential backoff capped at 30s keeps retries responsive while avoiding tight loops.
	exp := math.Min(float64(attempt), 5)
	wait := time.Duration(1<<int(exp)) * reconnectBaseWait
	if wait > reconnectMaxWait {
		return reconnectMaxWait
	}
	return wait
}

func isRetryableRunnerError(err error) bool {
	code := status.Code(err)
	switch code {
	case codes.OK:
		return true
	case codes.Unavailable, codes.Unknown, codes.Internal, codes.ResourceExhausted, codes.Aborted, codes.DeadlineExceeded:
		return true
	case codes.Canceled:
		// Context cancellation is handled by caller; other cancellations are usually transient transport churn.
		return !errors.Is(err, context.Canceled)
	case codes.Unauthenticated, codes.PermissionDenied, codes.InvalidArgument, codes.NotFound, codes.FailedPrecondition:
		return false
	default:
		// Fallback to retry: unknown transport errors (for example TCP reset) should not kill daemon mode.
		return true
	}
}

func printUsage() {
	fmt.Print(`agent-flow runner

Usage:
  runner start --rpc_host 127.0.0.1:9201 --rpc_token <token>
  runner serve --addr :8091 --auth_token <token>
  runner install-autostart --rpc_host 127.0.0.1:9201 --rpc_token <token>
  runner uninstall-autostart
  runner print-autostart --rpc_host 127.0.0.1:9201 --rpc_token <token>

Commands:
  start               Connect to web-server and execute tasks over gRPC Connect stream.
  serve               Legacy gRPC server mode.
  install-autostart   Install a per-user login autostart entry on Windows/macOS.
  uninstall-autostart Remove the installed autostart entry.
  print-autostart     Print the generated startup script/plist without installing it.
`)
}
