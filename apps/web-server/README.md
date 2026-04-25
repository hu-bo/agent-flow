# @agent-flow/web-server

`@agent-flow/web-server` 是 `agent-flow` 的 Fastify BFF/API 服务层，负责：

- 提供统一 HTTP 接口（会话、任务、模型、压缩、聊天）
- 承接 Web UI / Console 的请求与 SSE 流式输出
- 对请求做中间件处理与 `zod` 参数校验
- 通过 service 容器组织业务逻辑，预留后续接入 `core/runner` 的边界

当前实现为“可运行骨架 + 可扩展接口层”，适合先联调前端，再逐步替换为真实执行链路。

## 项目结构

```text
apps/web-server/
├─ src/
│  ├─ app.ts                      # Fastify app 装配（cors/plugins/routes）
│  ├─ server.ts                   # 启动监听逻辑
│  ├─ index.ts                    # 入口
│  ├─ config/
│  │  └─ env.ts                   # 环境变量解析（zod）
│  ├─ contracts/
│  │  └─ api.ts                   # 领域类型与协议约定
│  ├─ middlewares/
│  │  ├─ request-context.ts       # requestId/来源等上下文
│  │  └─ require-json.ts          # JSON Content-Type 校验
│  ├─ plugins/
│  │  ├─ http.ts                  # 错误处理、not-found、通用 hook
│  │  └─ services.ts              # 服务容器挂载
│  ├─ schemas/                    # 各接口 zod schema
│  ├─ routes/                     # 路由注册（按模块拆分）
│  ├─ handlers/                   # HTTP handler（薄层）
│  ├─ services/                   # 业务逻辑（会话/任务/模型/聊天/压缩）
│  ├─ lib/                        # 错误、校验、消息、SSE 工具
│  └─ types/
│     └─ fastify.d.ts             # Fastify 实例与请求扩展声明
├─ package.json
└─ tsconfig.json
```

## 使用说明

### 1. 安装依赖

在仓库根目录执行：

```bash
pnpm install
```

### 2. 本地开发

```bash
pnpm --filter @agent-flow/web-server dev
```

默认监听：

- `HOST=0.0.0.0`
- `PORT=9200`

### 3. 构建与启动

```bash
# Type check
pnpm --filter @agent-flow/web-server typecheck

# Build
pnpm --filter @agent-flow/web-server build

# Run dist
pnpm --filter @agent-flow/web-server start
```

### 4. 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT` | `9200` | 服务端口（`0` 也允许，用于测试随机端口） |
| `HOST` | `0.0.0.0` | 监听地址 |
| `NODE_ENV` | `development` | 运行环境 |
| `AGENT_FLOW_MODEL` | `gpt-4o` | 默认模型 ID |
| `AGENT_FLOW_CORS_ORIGIN` | `*` | CORS 白名单，支持逗号分隔 |

### 5. 主要接口

基础与配置：

- `GET /api/health`
- `GET /api/models`
- `POST /api/model`

会话：

- `GET /api/sessions`
- `GET /api/sessions/:sessionId`
- `POST /api/sessions`
- `DELETE /api/sessions/:sessionId`

聊天与上下文：

- `POST /api/chat`（支持 `stream: true` 的 SSE）
- `POST /api/compact`

任务：

- `GET /api/tasks`
- `GET /api/tasks/:taskId`
- `POST /api/tasks`
- `POST /api/tasks/:taskId/actions/:action`
- `GET /api/tasks/:taskId/events`（SSE）

### 6. 快速调用示例

健康检查：

```bash
curl http://localhost:9200/api/health
```

创建会话：

```bash
curl -X POST http://localhost:9200/api/sessions \
  -H "Content-Type: application/json" \
  -d "{\"modelId\":\"gpt-4o\"}"
```

发起聊天（SSE）：

```bash
curl -N -X POST http://localhost:9200/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"<session-id>\",\"message\":\"hello\",\"stream\":true}"
```

创建任务：

```bash
curl -X POST http://localhost:9200/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"prompt\":\"帮我总结这个会话\"}"
```

订阅任务事件（SSE）：

```bash
curl -N http://localhost:9200/api/tasks/<task-id>/events
```

## 后续扩展建议

- 将 `services/runtime-gateway.ts` 的 mock 实现替换为真实 `core/runner` 执行链路
- 将任务状态与事件流从内存实现升级到持久化存储（Redis/Postgres 等）
- 为关键路由补充集成测试（Fastify `inject` + fixture）
