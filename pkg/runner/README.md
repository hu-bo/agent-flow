# runner

`pkg/runner` is the Go execution layer for agent-flow.

## Scope

- unified runner node execution (no local/remote split in runtime semantics)
- host execution engine (`runner/exec`)
- docker execution engine (`runner/docker`)
- sandbox policy guard (`runner/sandbox`)
- gRPC service streaming task events (`stdout/stderr/progress/result`)

## Layout

- `cmd/runnerd`: runner daemon entrypoint
- `internal/server`: gRPC service implementation
- `runner/runner.go`: unified execution controller
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
go run ./cmd/runnerd
```

## Runtime options

Engine and sandbox/docker options are first-class protobuf fields in `TaskRequest`:

- `engine`: `ENGINE_HOST` or `ENGINE_DOCKER`
- `sandbox_policy`: sandbox guard settings (`enabled`, `read_only`, path/env allow/deny lists)
- `docker`: docker execution spec (`image`, `work_dir`, `network_disabled`, mounts)

`input_json` remains available for domain payloads, but runner execution controls no longer live under `_runner`.
