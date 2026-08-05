# runner

`pkg/runner` is the Go execution layer for agent-flow.

## Scope

- unified runner node execution (no local/remote split in runtime semantics)
- semantic command router (`fs.roots`, `fs.read`, `fs.write`, `fs.patch`, `fs.list`, `fs.search`, `shell.exec`)
- host execution engine (`runner/exec`)
- docker execution engine (`runner/docker`)
- sandbox policy guard (`runner/sandbox`)
- web-server connect mode (`poll -> execute -> task-event`) for runner task dispatch
- legacy gRPC serve mode for compatibility

## Layout

- `cmd`: runner daemon entrypoint
- `internal/grpcclient`: web-server connect stream client loop
- `internal/model`: local runner config persistence
- `internal/server`: legacy gRPC service implementation
- `runner/runner.go`: unified execution controller
- `runner/semantic_commands.go`: semantic fs/shell command execution
- `runner/types`: shared runner contracts
- `runner/exec`: host execution engine
- `runner/docker`: docker execution engine
- `runner/sandbox`: sandbox policy validation/wrapper

## Generate protobuf (Go)

From repository root:

```bash
protoc --proto_path=. \
  --go_out=./pkg/runner --go_opt=paths=source_relative \
  --go-grpc_out=./pkg/runner --go-grpc_opt=paths=source_relative \
  protocol/proto/runner.proto
```

## Run

```bash
cd pkg/runner
go run ./cmd start --rpc_host 127.0.0.1:9201 --rpc_token <runner_token>
```

If `--rpc_host` / `--rpc_token` are omitted, the runner loads config from:

- Windows: `%USERPROFILE%\.aflow-runner\config.json`
- macOS: `~/.aflow-runner/config.json`

`runnerId` can be omitted. When missing, runner computes a stable device fingerprint
and generates `runner_dev_<hash>` automatically (still overrideable with `--runner_id`).

Example config file:

```json
{
  "runnerToken": "rtk_xxxxxxxxxxxxxxxxxxxx",
  "serverAddr": "127.0.0.1:9201",
  "maxConcurrentTasks": 4
}
```

With the config file present, users can start the runner with:

```bash
cd pkg/runner
go run ./cmd start
```

## Task concurrency

The runner executes one task concurrently by default. Set `maxConcurrentTasks` in
`config.json`, or override it at startup with `--max_concurrent_tasks`:

```bash
go run ./cmd start --max_concurrent_tasks 4
```

The startup flag takes precedence over `config.json`. `install-autostart` accepts
the same flag and writes it into the generated startup entry. Increase this value
gradually, using the runner host's CPU, memory, and the workload's process and
network usage as the capacity limit.

Optional legacy runner serve mode:

```bash
go run ./cmd serve --addr :8091 --auth_token <token>
```

## Autostart

The runner can install a per-user autostart entry for login startup:

```bash
cd pkg/runner
go run ./cmd install-autostart --rpc_host 127.0.0.1:9201 --rpc_token <runner_token>
```

- Windows 11: writes `agent-flow-runner-autostart.cmd` into the current user's Startup folder.
- macOS: writes `~/Library/LaunchAgents/com.agentflow.runner.plist` and loads it with `launchctl`.

Other helper commands:

```bash
go run ./cmd print-autostart --rpc_host 127.0.0.1:9201 --rpc_token <runner_token>
go run ./cmd uninstall-autostart
```

`install-autostart` reuses the same flags as `start`, so you can also pin `--runner_id`, `--host_name`, `--capabilities`, or `--docker_bin` into the generated startup entry.

When the config file already exists at `~/.aflow-runner/config.json`, a minimal install is enough:

```bash
go run ./cmd install-autostart
```

## Build And Package

Build from `pkg/runner`:


For release packaging, use the provided script:

```shell
cd e:\Project\my-project\agent-flow\pkg\runner

powershell -ExecutionPolicy Bypass -File .\scripts\package.ps1 `
  -Version 0.1.0 `
  -ServerAddr 127.0.0.1:9201 `
  -maxConcurrentTasks 5
```

Or via Makefile:

```bash
make package
```

The packaging script builds:

- `agent-flow-runner-windows-amd64.zip`
- `agent-flow-runner-windows-arm64.zip`
- `agent-flow-runner-darwin-amd64.zip`
- `agent-flow-runner-darwin-arm64.zip`

Each package contains:

- runner binary
- pre-filled `config.json`
- `README.txt`
- `start.cmd` / `start.command`
- `install-autostart.cmd` / `install-autostart.command`

Recommended downloadable package layout:

```text
agent-flow-runner-windows-amd64/
  agent-flow-runner.exe
  config.json
  README.txt
  start.cmd
  install-autostart.cmd

agent-flow-runner-darwin-arm64/
  agent-flow-runner
  config.json
  README.txt
  start.command
  install-autostart.command
```

Recommended first-run install flow for users:

1. Copy the binary to any local directory.
2. Copy `config.json` to `~/.aflow-runner/config.json`.
3. Start the runner with `agent-flow-runner start`.
4. Optional: install login autostart with `agent-flow-runner install-autostart`.

If you want a user-downloadable package with token pre-filled, generate a per-user `config.json` during release packaging rather than hard-coding the token into the binary.

## Runtime options

Engine and sandbox/docker options are first-class protobuf fields in `TaskRequest`:

- `engine`: `ENGINE_HOST` or `ENGINE_DOCKER`
- `sandbox_policy`: sandbox guard settings (`enabled`, `read_only`, path/env allow/deny lists)
- `docker`: docker execution spec (`image`, `work_dir`, `network_disabled`, mounts)

`input_json` remains available for domain payloads, but runner execution controls no longer live under `_runner`.
