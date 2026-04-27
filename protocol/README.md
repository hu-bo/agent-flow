# protocol

Shared communication contracts for core/runner integration.

- `proto/runner.proto`: gRPC contract (`TaskRequest`, `TaskEvent`, `RunnerService`)
  - includes execution controls as typed fields: `engine`, `sandbox_policy`, `docker`
- `types/runner.ts`: TypeScript mirror for Node side integration (generated)
- `types/generate-runner-types.mjs`: generation script for `types/runner.ts`

Go stubs are generated into `pkg/runner/protocol/proto`.

## Generate contracts

From repository root:

```bash
# Go stubs (runner)
protoc --proto_path=. \
  --go_out=./pkg/runner --go_opt=paths=source_relative \
  --go-grpc_out=./pkg/runner --go-grpc_opt=paths=source_relative \
  protocol/proto/runner.proto

# TypeScript mirror
node protocol/types/generate-runner-types.mjs
```
