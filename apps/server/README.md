# @agent-flow/server

`@agent-flow/server` 是 Agent Flow 的 HTTP 服务端，基于 **Hono** 构建，提供：

- 统一 REST API（health / chat / sessions / tasks / compact / model）
- `/api/chat` 的 SSE 流式输出
- 可选静态资源托管（用于生产环境托管 playground）

## 架构分层

- `src/http/*`: 路由、请求校验、中间件、错误映射
- `src/services/*`: 领域服务（chat / task / session / compact / model）
- `src/transport/sse.ts`: 高可用 SSE 传输封装（心跳、断连感知、安全写入）
- `src/runtime.ts`: 运行时依赖容器（gateway、session、checkpoint、tool registry）
- `src/server.ts`: Node 启停封装（Hono Node server）

## API

- `GET /api/health`
- `POST /api/chat`
- `GET /api/sessions`
- `POST /api/sessions`
- `DELETE /api/sessions/:id`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/compact`
- `POST /api/model`

`POST /api/chat` 支持：

- `stream: false`（默认）返回 `{"messages":[...]}` JSON
- `stream: true` 返回 `text/event-stream`，每个消息一帧，结束帧为 `[DONE]`

## 启动

```bash
pnpm --filter @agent-flow/server dev
```

可选参数：

```bash
pnpm --filter @agent-flow/server dev -- --port 3001 --static-dir ./apps/playground/dist
```

