.PHONY: proto proto-types proto-all tidy test run package

proto:
	protoc --proto_path=../.. \
	  --go_out=. --go_opt=paths=source_relative \
	  --go-grpc_out=. --go-grpc_opt=paths=source_relative \
	  protocol/proto/runner.proto

proto-types:
	cd ../.. && pnpm --filter @agent-flow/runner-protocol generate

proto-all: proto proto-types

tidy:
	go mod tidy

test:
	go test ./...

run:
	go run ./cmd

package:
	powershell -ExecutionPolicy Bypass -File ./scripts/package.ps1
