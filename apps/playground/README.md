# @agent-flow/playground

Agent Flow 交互式聊天 Playground，提供基于 WebSocket 的实时对话界面。

## 技术栈

- React 19 + TypeScript
- Vite 7（开发端口 5173）
- 依赖 `@agent-flow/chat-ui` 共享组件

## 功能

- **实时对话** — 通过 WebSocket (`ws://localhost:3000/ws`) 进行流式消息传输
- **会话管理** — 侧边栏创建 / 切换 / 删除会话
- **模型切换** — 运行时选择不同 AI 模型
- **上下文压缩** — 手动触发 context compact
- **富内容渲染** — 支持文本流、工具调用、工具结果等消息类型

### WebSocket 消息协议

| 方向 | 类型 |
|------|------|
| 发送 | `chat` |
| 接收 | `message`, `text-delta`, `tool-call`, `tool-result`, `done`, `error` |

## 使用

```bash
# 安装依赖（在 monorepo 根目录）
pnpm install

# 启动开发服务器
pnpm --filter @agent-flow/playground dev

# 构建
pnpm --filter @agent-flow/playground build
```

> 需要先启动 `@agent-flow/server` 后端服务。
