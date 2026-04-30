# runner

`pkg/runner` is the Go execution layer for agent-flow.

## Scope

- unified runner node execution (no local/remote split in runtime semantics)
- semantic command router (`fs.read`, `fs.write`, `fs.patch`, `fs.list`, `fs.search`, `shell.exec`)
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

Optional legacy runner serve mode:

```bash
go run ./cmd serve --addr :8091 --auth_token <token>
```

## Runtime options

Engine and sandbox/docker options are first-class protobuf fields in `TaskRequest`:

- `engine`: `ENGINE_HOST` or `ENGINE_DOCKER`
- `sandbox_policy`: sandbox guard settings (`enabled`, `read_only`, path/env allow/deny lists)
- `docker`: docker execution spec (`image`, `work_dir`, `network_disabled`, mounts)

`input_json` remains available for domain payloads, but runner execution controls no longer live under `_runner`.
