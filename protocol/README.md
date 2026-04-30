# protocol

Shared communication contracts for core/runner integration.

- `proto/runner.proto`: gRPC contract (`TaskRequest`, `TaskEvent`, `RunnerService`)
  - includes execution controls as typed fields: `engine`, `sandbox_policy`, `docker`
- `../packages/runner-protocol/src/generated/protocol/proto/runner.ts`: TypeScript contract generated directly from `runner.proto`
- `../packages/runner-protocol/package.json`: package scripts for TypeScript generation/build

Go stubs are generated into `pkg/runner/protocol/proto`.

## Generate contracts

From repository root:

```bash
# Go stubs (runner)
protoc --proto_path=. \
  --go_out=./pkg/runner --go_opt=paths=source_relative \
  --go-grpc_out=./pkg/runner --go-grpc_opt=paths=source_relative \
  protocol/proto/runner.proto

# TypeScript package
pnpm --filter @agent-flow/runner-protocol generate
```
