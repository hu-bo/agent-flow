-- name: CreateUser :exec
INSERT INTO users (id, email, name, default_provider, default_model, rate_limit_rpm, is_admin, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);

-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1;

-- name: UserCount :one
SELECT COUNT(*) FROM users;
