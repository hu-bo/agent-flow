.PHONY: build run dev

build:
	go build -o bin/api-gateway ./cmd/server

run: build
	./bin/api-gateway

dev:
	go run ./cmd/server

gen-key:
	@openssl rand -hex 32
