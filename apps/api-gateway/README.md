# API Gateway

LLM API 纯透传代理服务。不做消息格式适配，用户请求什么格式就原样转发给对应供应商，响应也原样回传。

平台负责：认证、路由分发、用量记录、对话日志、密钥托管。

## 技术栈

- Go 1.23 + Echo v4
- PostgreSQL（pgx/v5）
- httputil.ReverseProxy（流式透传）
- sqlc（SQL → Go 代码生成）
- AES-256-GCM（供应商密钥加密）

## 快速开始

### 1. 准备环境

```bash
# PostgreSQL
docker run -d --name pg -p 5432:5432 -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=api_gateway postgres:16

# 配置
cp .env.example .env
```

编辑 `.env`：

```
PORT=8080
DATABASE_URL=postgres://postgres:dev@localhost:5432/api_gateway?sslmode=disable
ENCRYPTION_KEY=<生成的64位hex>
```

生成加密密钥：

```bash
make gen-key
# 或
openssl rand -hex 32
```

### 2. 启动

```bash
make dev
# 或
go run ./cmd/server
```

启动时自动执行 schema migration 和分区创建。

### 3. 初始化

```bash
# 创建 admin 用户（仅首次，无需认证）
curl -X POST http://localhost:8080/v1/admin/init \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "name": "Admin"}'
```

返回的 `api_key` 只显示一次，妥善保存。

### 4. 绑定供应商

```bash
curl -X POST http://localhost:8080/v1/providers \
  -H "Authorization: Bearer <your-api-key>" \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "openai", "api_key": "sk-xxx"}'
```

支持的 provider_id 及默认 upstream：

| provider_id | 默认 Base URL |
|-------------|--------------|
| `openai` | `https://api.openai.com` |
| `anthropic` | `https://api.anthropic.com` |
| `google` | `https://generativelanguage.googleapis.com` |
| `deepseek` | `https://api.deepseek.com` |
| 自定义 | 需传 `base_url` 字段 |

### 5. 透传调用

请求路径格式：`/v1/{provider_id}/{原始API路径}`

```bash
# OpenAI
curl http://localhost:8080/v1/openai/v1/chat/completions \
  -H "Authorization: Bearer <your-api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "hello"}]}'

# Anthropic
curl http://localhost:8080/v1/anthropic/v1/messages \
  -H "Authorization: Bearer <your-api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model": "claude-sonnet-4-20250514", "max_tokens": 1024, "messages": [{"role": "user", "content": "hello"}]}'

# 流式（SSE 自动透传）
curl http://localhost:8080/v1/openai/v1/chat/completions \
  -H "Authorization: Bearer <your-api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "hello"}], "stream": true}'
```

可通过 `X-Conversation-ID` header 关联同一对话的多次请求。

### 6. 查看日志

```bash
# 列表
curl http://localhost:8080/v1/logs?page=1&size=20 \
  -H "Authorization: Bearer <your-api-key>"

# 按对话过滤
curl "http://localhost:8080/v1/logs?conversation_id=conv-123" \
  -H "Authorization: Bearer <your-api-key>"

# 详情（含完整 request/response body）
curl http://localhost:8080/v1/logs/<log-id> \
  -H "Authorization: Bearer <your-api-key>"
```

## API 一览

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/health` | 无 | 健康检查 |
| POST | `/v1/admin/init` | 无 | 首次初始化 admin |
| POST | `/v1/admin/users` | Admin | 创建用户 |
| GET | `/v1/providers` | Bearer | 列出供应商配置 |
| POST | `/v1/providers` | Bearer | 绑定供应商 |
| PUT | `/v1/providers/:id` | Bearer | 更新供应商配置 |
| DELETE | `/v1/providers/:id` | Bearer | 删除供应商配置 |
| GET | `/v1/api-keys` | Bearer | 列出 API Key |
| POST | `/v1/api-keys` | Bearer | 创建 API Key |
| DELETE | `/v1/api-keys/:id` | Bearer | 停用 API Key |
| GET | `/v1/logs` | Bearer | 查询请求日志 |
| GET | `/v1/logs/:id` | Bearer | 日志详情 |
| ANY | `/v1/:provider/*` | Bearer | 代理透传 |

## 开发

### 项目结构

```
apps/api-gateway/
├── cmd/server/main.go              # 入口
├── sqlc.yaml                       # sqlc 配置
├── internal/
│   ├── config/                     # 环境变量
│   ├── database/
│   │   ├── postgres.go             # 连接池 + migration（embed schema.sql）
│   │   ├── partition.go            # request_logs 分区管理
│   │   ├── db/                     # ← sqlc 生成，勿手动修改
│   │   │   ├── db.go
│   │   │   ├── models.go
│   │   │   ├── users.sql.go
│   │   │   ├── api_keys.sql.go
│   │   │   ├── providers.sql.go
│   │   │   └── logs.sql.go
│   │   └── sqlc/
│   │       ├── schema.sql          # 表结构定义（migration + codegen 共用）
│   │       └── query/              # SQL 查询文件
│   │           ├── users.sql
│   │           ├── api_keys.sql
│   │           ├── providers.sql
│   │           └── logs.sql
│   ├── middleware/                  # auth, accesslog, ratelimit
│   ├── handler/                    # admin, providers, apikeys, logs
│   ├── proxy/                      # ReverseProxy, upstream 路由, 认证注入
│   ├── service/                    # crypto, keymanager, logwriter
│   └── router/                     # Echo 路由注册
```

### sqlc 工作流

sqlc 从 SQL 文件生成类型安全的 Go 代码，不需要手写 `rows.Scan`。

**配置文件** `sqlc.yaml`：

```yaml
version: "2"
sql:
  - engine: "postgresql"
    queries: "internal/database/sqlc/query/"
    schema: "internal/database/sqlc/schema.sql"
    gen:
      go:
        package: "db"
        out: "internal/database/db"
        sql_package: "pgx/v5"
        emit_json_tags: true
        emit_empty_slices: true
```

**添加新查询的步骤：**

1. 在 `internal/database/sqlc/query/` 下编写 SQL：

```sql
-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1;
```

注释格式：`-- name: <函数名> :<返回类型>`
- `:one` — 返回单条记录
- `:many` — 返回切片
- `:exec` — 不返回数据

2. 生成 Go 代码：

```bash
sqlc generate
```

3. 在业务代码中直接调用：

```go
user, err := q.GetUserByEmail(ctx, "admin@example.com")
```

**修改表结构的步骤：**

1. 编辑 `internal/database/sqlc/schema.sql`
2. 运行 `sqlc generate` 重新生成 models
3. 服务启动时自动执行 schema migration（`CREATE TABLE IF NOT EXISTS`）

> `internal/database/db/` 目录下的文件全部由 sqlc 生成，不要手动修改。

### 构建

```bash
make build    # 编译到 bin/api-gateway
make run      # 编译并运行
make dev      # go run 直接运行
make gen-key  # 生成 ENCRYPTION_KEY
```

### 安装 sqlc

```bash
# macOS
brew install sqlc

# 或 Go install
go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
```
