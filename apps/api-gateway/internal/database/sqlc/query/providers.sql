-- name: CreateProviderConfig :exec
INSERT INTO provider_configs (id, user_id, provider_id, display_name, api_key_enc, base_url, is_active, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);

-- name: GetProviderConfig :one
SELECT * FROM provider_configs WHERE user_id = $1 AND provider_id = $2 AND is_active = TRUE;

-- name: ListProviderConfigs :many
SELECT * FROM provider_configs WHERE user_id = $1 ORDER BY created_at DESC;

-- name: UpdateProviderConfig :exec
UPDATE provider_configs
SET display_name = $3, api_key_enc = $4, base_url = $5, updated_at = $6
WHERE id = $1 AND user_id = $2;

-- name: DeleteProviderConfig :exec
DELETE FROM provider_configs WHERE id = $1 AND user_id = $2;
