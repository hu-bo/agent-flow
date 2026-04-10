-- name: CreateAPIKey :exec
INSERT INTO api_keys (id, user_id, name, key_hash, key_prefix, is_active, created_at)
VALUES ($1, $2, $3, $4, $5, $6, $7);

-- name: GetAPIKeyByHash :one
SELECT * FROM api_keys WHERE key_hash = $1 AND is_active = TRUE;

-- name: ListAPIKeysByUser :many
SELECT * FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC;

-- name: DeactivateAPIKey :exec
UPDATE api_keys SET is_active = FALSE WHERE id = $1 AND user_id = $2;

-- name: TouchAPIKey :exec
UPDATE api_keys SET last_used_at = $1 WHERE id = $2;
