package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port          int
	DatabaseURL   string
	EncryptionKey string // 32 bytes hex for AES-256-GCM
}

func Load() *Config {
	port := 8080
	if v := os.Getenv("PORT"); v != "" {
		if p, err := strconv.Atoi(v); err == nil {
			port = p
		}
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:dev@localhost:5432/api_gateway?sslmode=disable"
	}

	encKey := os.Getenv("ENCRYPTION_KEY")

	return &Config{
		Port:          port,
		DatabaseURL:   dbURL,
		EncryptionKey: encKey,
	}
}
