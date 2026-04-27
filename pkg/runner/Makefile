.PHONY: proto proto-types proto-all tidy test run

proto:
	protoc --proto_path=../.. \
	  --go_out=. --go_opt=paths=source_relative \
	  --go-grpc_out=. --go-grpc_opt=paths=source_relative \
	  protocol/proto/runner.proto

proto-types:
	node ../../protocol/types/generate-runner-types.mjs

proto-all: proto proto-types

tidy:
	go mod tidy

test:
	go test ./...

run:
	go run ./cmd/runnerd
