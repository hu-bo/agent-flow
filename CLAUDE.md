# CLAUDE.md

## Project Overview

agent-flow — AI Agent 编排平台，支持对话式任务执行、DAG + Loop 工作流、多 Agent 团队协作、统一模型接入与长对话自动压缩。

## Tech Stack

- **Language**: TypeScript 5.8 (strict mode), Go 1.23 (api-gateway)
- **Monorepo**: pnpm 10.32.1 + Turborepo
- **Runtime**: Node.js (ES2022 target, ESM modules)
- **Testing**: Vitest 3.2.1 (globals enabled)
- **Backend**: Fastify 5 (web-server), Echo v4 (api-gateway)
- **Frontend**: React 19, Vite 7
- **Model SDK**: Vercel AI SDK (primary adapter), OpenAI / Anthropic SDK
- **Database**: PostgreSQL (pgx/v5 for Go, TypeORM for TS), Redis, Qdrant
- **State Management**: Zustand (web-ui)
- **Styling**: Tailwind CSS 4, Less

### FRONT-END TECH STACK:
  - Core: React 19 + TypeScript + Vite
  - Styling: Tailwind CSS v4 + `@tailwindcss/vite`
  - Theming: centralized design tokens via Tailwind `@theme` in global CSS
  - Motion: `motion/react` (Framer Motion API)
  - Icons: `lucide-react`
  - Utility helpers: `clsx` + `tailwind-merge` (`cn()` pattern)

  LIGHT MODERN WORKSPACE STYLE GUIDE (SOURCE OF TRUTH):
  1. Visual Direction: Bright, modern, design-forward "agent workspace" UI. Keep technical tone, but avoid dark terminal heaviness as the default.
  2. Border Philosophy: Prefer borderless surfaces. Use separation via elevation, contrast, spacing, and soft gradient planes. Only use ultra-subtle borders when absolutely necessary.
  3. Depth & 3D: Build hierarchy with layered shadows (`shadow-1/2/3` tokens), soft highlights, and slight lift-on-hover transforms. Depth should feel premium, not noisy.
  4. Color System: Light palette by default (`canvas`, `surface`, `surface-soft`, `text-*`, `brand-*`, `status-*`) with tokenized variables. No hard-coded one-off colors for core surfaces.
  5. Layout Pattern: Multi-pane workspace shell remains the primary pattern (app rail + session/context sidebar + main canvas + compact status footer).
  6. Typography: Dual-font hierarchy is required:
     - Sans (`Inter`) for primary content and UI readability.
     - Mono (`JetBrains Mono`) for system labels, IDs, metrics, state badges, and tooling affordances.
  7. Components: Cards, panels, bubbles, and controls should use rounded geometry plus soft elevation instead of heavy strokes.
  8. Motion Language: Fast, subtle, and purposeful transitions only (hover lift, panel state changes, content switch fades). No decorative animation clutter.
  9. Data Presentation: Keep developer-friendly readability (logs, metadata, tool output, status chips), but render in clean light containers rather than dense admin tables by default.
  10. Responsive Behavior: Preserve workspace hierarchy on desktop; progressively collapse rails/sidebars on narrow screens without breaking chat-first interaction.
  11. Prohibited Visual Smells: Thick borders, flat enterprise admin panels, harsh black/white contrast blocks, and over-saturated CTA colors.

## Monorepo Structure

```
agent-flow/
├─ apps/                          # 应用层
│  ├─ api-gateway/                # Go — LLM API 透传代理网关
│  ├─ api-gateway-web/            # React — API Gateway 管理控制台
│  ├─ cli/                        # TypeScript — 交互式 REPL 命令行
│  ├─ console/                    # React — 系统管理控制台
│  ├─ web-server/                 # Fastify — BFF/API 服务层
│  └─ web-ui/                     # React — 交互式 Playground
├─ packages/                      # 共享库
│  ├─ core/                       # 核心运行时（Agent 循环、编排、工具、状态）
│  ├─ model-adapters/             # 统一模型适配器（AI SDK / OpenAI / Anthropic / Local）
│  ├─ chat-ui/                    # React 聊天面板组件库
│  ├─ compact/                    # 上下文压缩策略
│  ├─ events/                     # 结构化日志与追踪
│  ├─ memory/                     # 记忆与 RAG 原语
│  ├─ storage/                    # 存储适配器（Redis / Qdrant / InMemory）
│  └─ tools-impl/                 # 内置工具实现（fs / git / http）
└─ turbo.json                     # Turborepo 任务配置
```


## Apps

### apps/api-gateway (Go)
LLM API 纯透传代理服务。不做消息格式适配，原样转发请求到供应商并回传响应。负责认证、路由分发、用量记录、对话日志、密钥托管。
- 技术栈：Go + Echo v4 + PostgreSQL (pgx/v5) + sqlc + AES-256-GCM
- 启动：`make dev`（默认端口 8080）

### apps/api-gateway-web (React)
API Gateway 管理控制台前端。管理供应商配置、API Key、用户和请求日志。
- 技术栈：React 19 + Ant Design 5 + React Router 7
- 启动：`pnpm --filter @agent-flow/api-gateway-web dev`

### apps/cli (TypeScript)
交互式 REPL 命令行工具，终端内与 AI Agent 对话。支持模型切换、上下文压缩、会话持久化、工具调用。
- 依赖：`@agent-flow/core`、`@agent-flow/model-adapters`
- 启动：`pnpm --filter @agent-flow/cli dev`（也是 monorepo 默认 `pnpm dev` 入口）

### apps/console (React)
系统管理控制台。监控服务状态、管理模型/供应商配置、查看会话与任务。
- 技术栈：React 19 + Radix UI Themes
- 启动：`pnpm --filter @agent-flow/console dev`（端口 5174）

### apps/web-server (Fastify)
BFF/API 服务层，为前端应用提供统一 HTTP 接口与 SSE 流式输出。管理会话、聊天、模型、任务、上下文压缩。
- 技术栈：Fastify 5 + Zod + TypeORM + PostgreSQL
- 依赖：`@agent-flow/core`、`@agent-flow/compact`、`@agent-flow/events`、`@agent-flow/memory`、`@agent-flow/tools-impl`
- 启动：`pnpm --filter @agent-flow/web-server dev`（端口 9200）

### apps/web-ui (React)
交互式 Playground，面向终端用户的 Agent 对话与工作区界面。多面板布局（App Rail + 侧边栏 + 主画布）。
- 技术栈：React 19 + Tailwind CSS 4 + Zustand + Lucide React
- 依赖：`@agent-flow/chat-ui`、`@agent-flow/core`
- 启动：`pnpm --filter @agent-flow/web-ui dev`（端口 5173）

## Packages

### packages/core
核心运行时。Agent 循环、上下文管理（builder/loader/selector/window）、消息模型、工作流编排（DAG executor/graph/guardrails/planner/scheduler）、Prompt 管理、状态管理（checkpoint/replay/session）、工具系统（executor/registry/schema）。

### packages/model-adapters
统一模型适配器。定义适配器协议标准（`./types`），提供 Vercel AI SDK（`./ai-sdk`）、OpenAI（`./openai`）、Anthropic（`./anthropic`）、Local（`./local`）四种实现。core 通过本包接入模型，不直接依赖供应商 SDK。

### packages/chat-ui
React 聊天面板组件库。提供 ChatPanel、MessageList、MessageBubble、InputArea 等组件，以及 Text/Thinking/Image/CodeDiff/ToolCall/ToolResult/FileAttachment 七种内容渲染器。支持自定义渲染器注册。

### packages/compact
上下文压缩策略。提供 summarization（摘要）、semantic（语义）、rewrite（重写）、diff（差异）四种压缩策略，以及 AutoCompact 自动压缩控制器和 TokenEstimator。

### packages/events
结构化日志与追踪原语。提供 Logger（结构化日志）、Tracer（span 级链路追踪）、Sinks（输出目标）。

### packages/memory
记忆与 RAG 原语。提供 SessionMemory（会话短期记忆）、VectorMemory（向量检索）、MemoryService（统一记忆服务）、DefaultEmbedder。

### packages/storage
存储适配器。提供 InMemoryStore（开发/测试）、RedisAdapter（会话/缓存）、QdrantAdapter（向量存储）的统一接口。

### packages/tools-impl
内置工具实现。提供 fs-tools（文件系统）、git-tool（Git 操作）、http-tool（HTTP 请求），通过 ToolRegistry 注册供 Agent 调用。

## Common Commands

```bash
pnpm install              # 安装所有依赖
pnpm build                # 构建所有包（turbo）
pnpm dev                  # 启动 CLI（默认入口）
pnpm test                 # 运行所有测试（vitest）
pnpm typecheck            # 全量类型检查
pnpm lint                 # 全量 lint
pnpm clean                # 清理所有构建产物
```

## Dependency Graph

```
web-ui ──→ chat-ui ──→ core
  │                      ↑
  └──────────────────────┘

web-server ──→ core
  ├──→ compact
  ├──→ events
  ├──→ memory
  └──→ tools-impl ──→ core

cli ──→ core
  └──→ model-adapters

model-adapters（独立，无内部依赖）
storage（独立，无内部依赖）
events（独立，无内部依赖）
compact（独立，无内部依赖）
memory（独立，无内部依赖）
```

## 参考文档
- [前端样式风格](./docs/FRONT-END.md)