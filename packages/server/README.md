# @agent-flow/server

Agent Flow HTTP / WebSocket 服务端，为 Playground 和 Console 提供后端 API。

## 技术栈

- Express + WebSocket (`ws`)
- 支持 CORS 和静态文件服务

## API 路由

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 服务健康检查 & 当前模型 |
| `/api/chat` | POST | 发送聊天消息 |
| `/api/sessions` | GET/POST/DELETE | 会话 CRUD |
| `/api/tasks` | GET/POST | 任务管理 |
| `/api/model` | GET/PUT | 查看 / 切换模型 |
| `/api/compact` | POST | 触发上下文压缩 |
| `/ws` | WebSocket | 实时流式对话 |

## 使用

```bash
# 开发模式
pnpm --filter @agent-flow/server dev

# 构建
pnpm --filter @agent-flow/server build
```

默认监听 `http://localhost:3000`。
