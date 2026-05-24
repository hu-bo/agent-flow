# @agent-flow/web-server

`@agent-flow/web-server` 是 Agent Flow 的 Fastify BFF/API 服务层，为 `web-ui` / `console` 提供统一 HTTP 接口与 SSE 流式能力。

## 技术栈

- Fastify 5 + TypeScript (ESM)
- Zod（请求校验）
- TypeORM + PostgreSQL
- `@agent-flow/core` / `@agent-flow/memory` / `@agent-flow/events` / `@agent-flow/compact` / `@agent-flow/tools-impl`

## 重构后的分层

本次重构后，聊天主链路拆成了更清晰的两层引擎：

1. `chat/turn/*`：负责 turn 级业务编排（prepare、落库、memory、spec 协调、retry）。
2. `runtime/*`：负责运行时模式路由（`chat` / `autonomous` / `runner`）、core runtime 调用与事件映射。

`services/chat-service.ts` 现在是薄封装，核心逻辑在 `ChatTurnEngine` 与 `RuntimeTurnEngine`。

## 项目结构（关键路径）

```text
apps/web-server/src/
├─ app.ts                         # Fastify app 装配
├─ server.ts                      # 启动监听
├─ index.ts                       # 入口
├─ config/env.ts                  # 环境变量解析
├─ contracts/api.ts               # 后端 API 契约类型
├─ db/                            # TypeORM 数据源、实体、迁移
├─ middlewares/                   # auth / request-context / require-json
├─ plugins/                       # db/http/services 挂载
├─ routes/                        # 路由注册
├─ handlers/                      # HTTP handler（薄层）
├─ services/                      # 业务服务和容器装配
├─ chat/
│  └─ turn/
│     ├─ chat-turn-engine.ts      # turn 编排核心
│     ├─ turn-preparer.ts         # session/history/user message 准备
│     ├─ spec-stream-coordinator.ts
│     ├─ memory-recorder.ts
│     └─ retry-policy.ts
├─ runtime/
│  ├─ runtime-turn-engine.ts      # runtime 总引擎
│  ├─ runtime-router.ts           # chat/autonomous/runner 模式路由
│  ├─ runtime-request-builder.ts  # RuntimeChatInput -> AgentRunRequest
│  ├─ model-chat-driver.ts        # 模型聊天流式驱动
│  ├─ model-tool-runner.ts        # 模型工具调用执行
│  ├─ message-mappers.ts          # 事件/消息映射
│  ├─ core-runtime-factory.ts     # core runtime 装配
│  └─ llm-step-executor.ts        # core llm step 的模型执行器
├─ lib/                           # 错误、校验、SSE、消息工具
├─ prompts/                       # 系统 prompt
└─ types/fastify.d.ts             # Fastify 扩展声明
```

## 聊天主链路（简版）

1. `POST /api/chat` 进入 `handlers/chat-handlers.ts`。
2. `ChatService.streamTurn()` 委托给 `chat/turn/chat-turn-engine.ts`。
3. `ChatTurnEngine` 处理 session/history/message/spec/memory，然后调用 `RuntimeGateway`。
4. `CoreRuntimeGateway` 进入 `runtime/runtime-turn-engine.ts`。
5. `RuntimeTurnEngine` 按消息语义选择：
   - `chat`：模型直接对话。
   - `autonomous`：走 `@agent-flow/core` 的 plan/executor。
   - `runner`：`/run ...` 指令走 runner 计划。
6. 输出统一为 `ChatStreamEvent`（`msg` / `msg_delta` / `spec_doc_update` / `approval_req` / `error`）。

## 本地开发

```bash
# 在 monorepo 根目录执行
pnpm install

# 启动 web-server（watch）
pnpm --filter @agent-flow/web-server dev

# 类型检查
pnpm --filter @agent-flow/web-server typecheck

# 构建
pnpm --filter @agent-flow/web-server build

# 生产启动
pnpm --filter @agent-flow/web-server start
```

## 环境变量

以 `src/config/env.ts` 为准：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT` | `9200` | HTTP 端口 |
| `HOST` | `0.0.0.0` | 监听地址 |
| `NODE_ENV` | `development` | 运行环境 |
| `AGENT_FLOW_MODEL` | `gpt-4o` | 默认模型名 |
| `AGENT_FLOW_CORS_ORIGIN` | `*` | CORS 白名单（可逗号分隔） |
| `DATABASE_URL` | `postgres://aflow_user:...` | PostgreSQL 连接串 |
| `AUTH_API_BASE_URL` | `http://auth.8and1.cn` | Auth 服务地址 |
| `AUTH_APP_NAME` | `aflow` | Auth 应用名 |
| `RUNNER_SERVER_ADDR` | `127.0.0.1:9200` | Runner 反向连接地址 |
| `RUNNER_GRPC_HOST` | `0.0.0.0` | Runner gRPC 监听 host |
| `RUNNER_GRPC_PORT` | `9201` | Runner gRPC 监听端口 |
| `RUNNER_GRPC_SERVER_ADDR` | `127.0.0.1:9201` | Runner gRPC 公网/可达地址 |
| `RUNNER_DOWNLOAD_BASE_URL` | `https://downloads.8and1.cn/agent-flow` | Runner 下载基地址 |

## 主要 API（节选）

所有业务接口都在 `/api/*` 下。`/api/health` 与 `/api/auth/*` 之外的接口默认需要 Bearer Token。

### Health / Auth

- `GET /api/health`
- `POST /api/apps/:appName/oauth/authorize-url`
- `POST /api/apps/:appName/oauth/signup-url`
- `POST /api/apps/:appName/oauth/token`
- `POST /api/apps/:appName/oauth/token/refresh`
- `GET /api/me`
- `GET /api/auth/me`

### Sessions / Chat / Spec

- `GET /api/sessions`
- `GET /api/sessions/:sessionId`
- `POST /api/sessions`
- `DELETE /api/sessions/:sessionId`
- `POST /api/chat`
- `POST /api/chat/:session_id/retry`
- `DELETE /api/chat/:session_id/messages/:msg_id`
- `GET /api/spec/:session_id/state`
- `POST /api/spec/:session_id/confirm`

### Models / Projects / Runners / Tasks

- `GET /api/models`
- `POST /api/model`
- `GET /api/projects`
- `POST /api/projects`
- `PATCH /api/projects/:projectId`
- `DELETE /api/projects/:projectId`
- `GET /api/projects/:projectId/sessions`
- `GET /api/runners`
- `GET /api/runners/events`（SSE）
- `POST /api/runners/approval-ticket`
- `POST /api/sessions/:session_id/runner-binding`
- `GET /api/tasks`
- `GET /api/tasks/:taskId`
- `GET /api/tasks/:taskId/events`（SSE）
- `POST /api/tasks`

## 响应约定

普通 JSON 接口统一 envelope：

```json
{
  "code": 0,
  "data": {},
  "message": "OK",
  "requestId": "req-xxx"
}
```

异常响应：

```json
{
  "code": "NOT_FOUND",
  "data": null,
  "message": "Route not found: GET /api/xxx",
  "requestId": "req-xxx",
  "details": {}
}
```

例外：

1. SSE 接口（如 `/api/chat` 流式模式、`/api/runners/events`、`/api/tasks/:taskId/events`）返回事件流，不使用 envelope。
2. `204 No Content` 接口（如部分删除场景）不返回 body。
