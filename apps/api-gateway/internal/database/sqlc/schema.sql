CREATE TABLE IF NOT EXISTS users (
    id              VARCHAR(21) PRIMARY KEY,
    email           VARCHAR(255) UNIQUE NOT NULL,
    name            VARCHAR(255) DEFAULT '',
    default_provider VARCHAR(50) DEFAULT '',
    default_model   VARCHAR(100) DEFAULT '',
    rate_limit_rpm  INTEGER DEFAULT 60,
    is_admin        BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_keys (
    id              VARCHAR(21) PRIMARY KEY,
    user_id         VARCHAR(21) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    key_hash        VARCHAR(64) UNIQUE NOT NULL,
    key_prefix      VARCHAR(12) NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    last_used_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS provider_configs (
    id              VARCHAR(21) PRIMARY KEY,
    user_id         VARCHAR(21) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id     VARCHAR(50) NOT NULL,
    display_name    VARCHAR(255) NOT NULL,
    api_key_enc     VARCHAR(512) NOT NULL,
    base_url        VARCHAR(500) DEFAULT '',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider_id, base_url)
);

-- request_logs is partitioned, sqlc needs the definition but partitioning is managed at runtime
CREATE TABLE IF NOT EXISTS request_logs (
    id              VARCHAR(21) NOT NULL,
    user_id         VARCHAR(21) NOT NULL,
    conversation_id VARCHAR(100) DEFAULT '',
    provider_id     VARCHAR(50) NOT NULL,
    model           VARCHAR(100) DEFAULT '',
    request_body    JSONB,
    response_body   JSONB,
    status_code     SMALLINT DEFAULT 0,
    duration_ms     INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

CREATE TABLE IF NOT EXISTS usage_logs (
    id              VARCHAR(21) PRIMARY KEY,
    user_id         VARCHAR(21) NOT NULL,
    api_key_id      VARCHAR(21) NOT NULL,
    provider_id     VARCHAR(50) NOT NULL,
    model           VARCHAR(100) NOT NULL,
    request_bytes   INTEGER DEFAULT 0,
    response_bytes  INTEGER DEFAULT 0,
    duration_ms     INTEGER DEFAULT 0,
    status_code     SMALLINT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_request_logs_conv ON request_logs(user_id, conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_time ON usage_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash) WHERE is_active = TRUE;
