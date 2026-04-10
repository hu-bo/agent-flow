package service

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

const keyPrefix = "sk-af-"

// GenerateAPIKey creates a new platform API key and returns (fullKey, hash, prefix).
func GenerateAPIKey() (fullKey, hash, prefix string, err error) {
	b := make([]byte, 32)
	if _, err = rand.Read(b); err != nil {
		return "", "", "", fmt.Errorf("generate random bytes: %w", err)
	}
	raw := hex.EncodeToString(b)
	fullKey = keyPrefix + raw
	hash = HashKey(fullKey)
	prefix = fullKey[:12] + "..."
	return fullKey, hash, prefix, nil
}

// HashKey returns SHA-256 hex digest of the key.
func HashKey(key string) string {
	h := sha256.Sum256([]byte(key))
	return hex.EncodeToString(h[:])
}
