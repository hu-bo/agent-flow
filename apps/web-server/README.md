# @agent-flow/web-server

Agent Flow 的 Fastify BFF/API 服务层，为前端应用（web-ui / console）提供统一 HTTP 接口与 SSE 流式输出。

## 技术栈

- Fastify 5 + TypeScript
- Zod（请求参数校验）
- TypeORM + PostgreSQL（数据持久化）
- 依赖 `@agent-flow/core`、`@agent-flow/compact`、`@agent-flow/events`、`@agent-flow/memory`、`@agent-flow/tools-impl`

## 功能

- **会话管理** — 创建 / 查询 / 删除会话
- **聊天** — 支持普通请求与 SSE 流式输出
- **上下文压缩** — 调用 compact 策略压缩长对话
- **模型管理** — 查询 / 切换可用模型
- **任务系统** — 创建任务、执行动作、SSE 事件订阅
- **健康检查** — 服务状态探针

## 项目结构

```
apps/web-server/src/
├─ app.ts                 # Fastify app 装配
├─ server.ts              # 启动监听
├─ index.ts               # 入口
├─ config/env.ts          # 环境变量解析（zod）
├─ contracts/api.ts       # 领域类型与协议约定
├─ db/                    # TypeORM 数据源、实体、迁移
├─ middlewares/            # requestId、JSON 校验
├─ plugins/               # 错误处理、服务容器挂载
├─ schemas/               # 各接口 zod schema
├─ routes/                # 路由注册（按模块拆分）
├─ handlers/              # HTTP handler（薄层）
├─ services/              # 业务逻辑
├─ lib/                   # 错误、校验、消息、SSE 工具
└─ types/fastify.d.ts     # Fastify 扩展声明
```

## 开发

```bash
# 安装依赖（在 monorepo 根目录）
pnpm install

# 本地开发（tsx watch）
pnpm --filter @agent-flow/web-server dev

# 类型检查
pnpm --filter @agent-flow/web-server typecheck

# 构建
pnpm --filter @agent-flow/web-server build

# 启动生产
pnpm --filter @agent-flow/web-server start
```

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `9200` | 服务端口 |
| `HOST` | `0.0.0.0` | 监听地址 |
| `NODE_ENV` | `development` | 运行环境 |
| `AGENT_FLOW_MODEL` | `gpt-4o` | 默认模型 ID |
| `AGENT_FLOW_CORS_ORIGIN` | `*` | CORS 白名单 |

### 主要接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET/POST | `/api/sessions` | 会话管理 |
| POST | `/api/chat` | 聊天（支持 SSE） |
| POST | `/api/compact` | 上下文压缩 |
| GET/POST | `/api/models` | 模型管理 |
| GET/POST | `/api/tasks` | 任务管理 |
| GET | `/api/tasks/:taskId/events` | 任务事件 SSE |

### API 响应约定

普通 JSON 接口统一返回 envelope：

```json
{
  "code": 0,
  "data": {},
  "message": "OK",
  "requestId": "req-xxx"
}
```

错误响应统一格式：

```json
{
  "code": "NOT_FOUND",
  "data": null,
  "message": "Route not found: GET /api/xxx",
  "requestId": "req-xxx",
  "details": {}
}
```

例外约定：
- `SSE` 接口（如 `/api/chat` 的流式模式、`/api/tasks/:taskId/events`）返回事件流，不包 `code/data/message`。
- `204 No Content` 接口（如 delete 场景）不返回 body。

## 提供的能力

- 为 web-ui 和 console 提供统一的后端 API 层
- SSE 流式输出支持实时对话与任务事件推送
- 服务容器模式组织业务逻辑，便于扩展与替换
- 预留 `core/runner` 真实执行链路的接入边界
