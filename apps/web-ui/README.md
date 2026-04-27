# @agent-flow/web-ui

Agent Flow 交互式 Playground，提供基于 Web 的实时对话界面与 Agent 工作区。

## 技术栈

- React 19 + TypeScript
- Vite 7（开发端口 5173）
- Tailwind CSS 4 + Less
- Zustand（状态管理）
- React Router 7
- Lucide React（图标）
- 依赖 `@agent-flow/chat-ui`（聊天组件）、`@agent-flow/core`（核心类型）

## 功能

- **实时对话** — 通过 SSE / WebSocket 进行流式消息传输
- **多页面工作区** — Chat（对话）、Agent（Agent 管理）、Flow（工作流编排）
- **会话管理** — 侧边栏创建 / 切换 / 删除会话
- **模型切换** — 运行时选择不同 AI 模型
- **上下文压缩** — 手动触发 context compact
- **富内容渲染** — 支持 Markdown、代码高亮、思维链、工具调用、图片、文件附件等
- **多面板布局** — App Rail + 侧边栏 + 主画布的工作区 Shell

## 开发

```bash
# 安装依赖（在 monorepo 根目录）
pnpm install

# 启动开发服务器
pnpm --filter @agent-flow/web-ui dev

# 构建
pnpm --filter @agent-flow/web-ui build

# 类型检查
pnpm --filter @agent-flow/web-ui typecheck

# 预览构建产物
pnpm --filter @agent-flow/web-ui preview
```

> 需要先启动 `@agent-flow/web-server` 后端服务。

## 提供的能力

- 面向终端用户的 Agent 交互入口
- 多面板工作区布局，支持对话、Agent 管理和工作流编排
- 消费 `@agent-flow/chat-ui` 组件库，保持聊天体验一致性
- 遵循 Light Modern Workspace 设计风格
