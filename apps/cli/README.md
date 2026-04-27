# @agent-flow/cli

Agent Flow 命令行工具，提供交互式 REPL 环境，可直接在终端中与 AI Agent 对话。

## 技术栈

- TypeScript + tsx（开发热重载）
- 依赖 `@agent-flow/core`（核心运行时）、`@agent-flow/model-adapters`（模型接入）
- Vercel AI SDK + OpenAI / Anthropic 适配器

## 功能

- **交互式对话 REPL** — 终端内与 AI Agent 实时对话
- **运行时模型切换** — 在对话中随时切换 AI 模型
- **上下文压缩** — 支持自动 / 手动触发 context compact
- **会话持久化** — 会话保存与恢复
- **工具调用** — 支持内置工具（文件系统、Git、HTTP 等）

## REPL 命令

| 命令 | 说明 |
|------|------|
| `/model` | 切换 AI 模型 |
| `/compact` | 触发上下文压缩 |
| `/sessions` | 管理会话 |
| `/tools` | 查看可用工具 |
| `/help` | 显示帮助 |
| `/quit` | 退出 |

## 开发

```bash
# 安装依赖（在 monorepo 根目录）
pnpm install

# 开发模式（tsx 热重载）
pnpm --filter @agent-flow/cli dev

# 构建
pnpm --filter @agent-flow/cli build

# 类型检查
pnpm --filter @agent-flow/cli typecheck
```

安装后可通过 `agent-flow` 命令使用。

## 提供的能力

- 终端环境下的完整 Agent 交互体验
- 作为 monorepo 默认 `dev` 入口（`pnpm dev` 即启动 CLI）
- 快速验证 core 运行时与模型适配器的集成效果
