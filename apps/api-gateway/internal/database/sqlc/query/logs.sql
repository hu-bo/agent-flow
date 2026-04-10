-- name: ListRequestLogs :many
SELECT id, user_id, conversation_id, provider_id, model, status_code, duration_ms, created_at
FROM request_logs
WHERE user_id = $1
  AND ($2::text = '' OR conversation_id = $2)
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;

-- name: GetRequestLog :one
SELECT * FROM request_logs WHERE id = $1 AND user_id = $2;

-- name: InsertRequestLog :exec
INSERT INTO request_logs (id, user_id, conversation_id, provider_id, model, request_body, response_body, status_code, duration_ms, created_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);

-- name: InsertUsageLog :exec
INSERT INTO usage_logs (id, user_id, api_key_id, provider_id, model, request_bytes, response_bytes, duration_ms, status_code, created_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
