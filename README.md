# agent-flow

可本地运行、可远程托管的 AI Agent 编排平台。支持对话式任务执行、DAG + Loop 工作流编排、多 Agent 团队协作、统一模型接入与长对话自动压缩。

详细架构设计见 [architecture-design.md](./architecture-design.md)。

## 快速开始

```bash
pnpm install
pnpm build
```

### CLI 对话

```bash
# 使用 OpenAI（默认）
pnpm --filter @agent-flow/cli dev

# 指定模型
pnpm --filter @agent-flow/cli dev -- --model claude-sonnet-4-20250514
```

CLI 内置命令：`/model <id>` 切换模型、`/compact` 压缩上下文、`/sessions` 查看会话、`/tools` 查看工具、`/help` 帮助。

### Server

```bash
# 启动 HTTP 服务（默认端口 3000）
pnpm --filter @agent-flow/server dev
```

### Playground（Web 对话界面）

一键启动 server + playground 并自动打开浏览器：

```bash
pnpm --filter @agent-flow/cli dev -- playground
```

也可以分别启动：

```bash
pnpm --filter @agent-flow/server dev
pnpm --filter @agent-flow/playground dev
# 访问 http://localhost:5173
```

支持参数：`--port 3001`（server 端口）、`--no-open`（不自动打开浏览器）。

通过 SSE（`/api/chat`）实现实时流式对话，支持工具调用展示、会话管理和模型切换。

### Console（管理后台）

```bash
pnpm --filter @agent-flow/console dev
# 访问 http://localhost:5174
```

提供 Dashboard（服务状态）、Sessions（会话管理）、Tasks（任务管理）三个页面。

### SDK 编程调用

```typescript
import { AgentFlow } from '@agent-flow/sdk';

const flow = new AgentFlow({ defaultModel: 'gpt-4o' });
flow.registerAdapter('gpt-4o', adapter);

for await (const msg of flow.chat('hello')) {
  console.log(msg);
}
```

## 项目结构

```text
packages/
  model-contracts      # 纯类型包，统一接口与消息格式
  model-adapters/
    ai-sdk             # Vercel AI SDK 适配器（主力）
    openai             # 原生 OpenAI 适配
    anthropic          # 原生 Anthropic 适配
    google             # Gemini 适配
    deepseek           # DeepSeek 适配
  model-gateway        # 模型网关（路由、fallback、限流）
  context-store        # 上下文存储（内存 + JSONL 持久化）
  context-compressor   # 上下文压缩（auto-compact + micro-compact）
  checkpoint           # 检查点与中断恢复（本地 + 远程 WAL）
  core                 # 核心运行时（Agent 主循环、工具执行、工作流引擎、团队协作）
  cli                  # CLI 入口
  sdk                  # 编程 SDK
  server               # HTTP 服务（Hono + SSE）
apps/
  playground           # Web 对话界面（React + Vite，端口 5173）
  console              # 管理后台（React + Vite，端口 5174）
```

## Server API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| POST | `/api/chat` | 发送消息（支持 SSE 流式） |
| GET | `/api/sessions` | 列出会话 |
| POST | `/api/sessions` | 创建会话 |
| DELETE | `/api/sessions/:id` | 删除会话 |
| POST | `/api/tasks` | 创建后台任务 |
| GET | `/api/tasks/:id` | 查询任务状态 |
| POST | `/api/compact` | 手动压缩上下文 |
| POST | `/api/model` | 切换模型 |
| SSE | `POST /api/chat` + `stream: true` | 实时对话流 |

## 环境变量

| 变量 | 说明 |
|------|------|
| `OPENAI_API_KEY` | OpenAI API 密钥 |
| `ANTHROPIC_API_KEY` | Anthropic API 密钥 |
| `AGENT_FLOW_MODEL` | 默认模型（默认 `gpt-4o`） |
| `AGENT_FLOW_SESSIONS` | 会话存储目录 |
| `AGENT_FLOW_CHECKPOINTS` | 检查点存储目录 |

## 技术栈

- TypeScript 5.8 + pnpm + Turborepo
- Vercel AI SDK（模型适配主力）
- Hono + SSE（server）
- React 19 + Vite 7（前端应用）
