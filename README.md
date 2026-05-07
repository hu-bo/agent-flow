# Agent Flow

AI Agent 编排平台（Monorepo），支持会话式任务执行、DAG 工作流、工具调用、Runner 分发与多端接入（CLI / Web / API）。

## 项目目标

- 构建长任务友好的 Agent Runtime
- 支持 `Plan -> Execute -> Checkpoint -> Replay` 的完整闭环
- 通过统一模型适配层与工具协议，降低不同模型和执行环境的耦合
- 提升编码任务效率：可观察、可恢复、可扩展

## 当前架构

- `packages/core`：最小运行时（planner / executor / scheduler / context / tools / state）
- `packages/model-adapters`：OpenAI / Anthropic / AI SDK / Local 统一适配
- `packages/tools-impl`：内置 `git.exec` / `http.request`（`fs/shell` 通过 runner 路径）
- `apps/web-server`：Fastify BFF（对外 API + SSE + runtime gateway）
- `apps/web-ui`：交互式工作区 UI（React + Vite）
- `apps/cli`：终端入口（正在完善）
- `pkg/runner`：Go 执行层（隔离执行、流式事件）

## Planner 设计（2026-05 更新）

`packages/core/src/orchestration/planner/index.ts` 已从静态单步规划升级为 `CapabilityPlanner`：

- 支持显式传入 plan 的规范化（`request.plan`）
- 支持 runner 直执行计划（`request.runnerCommand`）
- 支持语义工具识别（`fs.list / fs.read / fs.search`）
- 对“仅查询类”请求走 tool-only 计划
- 对“改代码/复杂任务”走 tool-first 或多阶段 LLM 计划（analysis -> execution -> verification）

这个方向参考了 `claude-code-main` 的实践：优先能力路由、分阶段执行、减少“单步硬编码计划”。

## Monorepo 结构

```text
agent-flow/
├─ apps/
│  ├─ api-gateway/         # Go 转发网关
│  ├─ api-gateway-web/     # 网关管理前端
│  ├─ cli/                 # CLI 入口
│  ├─ console/             # 管理控制台
│  ├─ web-server/          # Fastify BFF
│  └─ web-ui/              # Playground UI
├─ packages/
│  ├─ core/
│  ├─ model-adapters/
│  ├─ chat-ui/
│  ├─ compact/
│  ├─ events/
│  ├─ memory/
│  ├─ storage/
│  └─ tools-impl/
├─ pkg/
│  └─ runner/              # Go Runner
├─ protocol/
│  └─ proto/               # 协议定义
└─ docs/
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 常用开发命令

```bash
pnpm build
pnpm typecheck
pnpm lint
pnpm test
```

### 3. 启动应用（推荐）

```bash
# Web UI（默认 5173）
pnpm --filter @agent-flow/web-ui dev

# Web Server（默认 9200）
pnpm --filter @agent-flow/web-server dev
```

## 工程约定

- TypeScript 严格模式（`strict: true`）
- Monorepo：`pnpm workspace + turbo`
- 所有核心能力从 `@agent-flow/core` 收敛导出
- 工具协议统一为 `ToolCall / ToolResult`
- 状态基线：`session + checkpoint + replay`

## 现状与下一步

- CLI 入口正在补齐（当前主开发链路建议使用 `web-ui + web-server`）
- CI / lint / test 门禁将继续完善
- Runner 与 core 的协议化协作会持续增强（取消、超时、流控、重试）

## 参考文档

- [项目阶段规划](./docs/IDEAD.md)
- [前端风格规范](./docs/FRONT-END.md)
- [Claude Code 学习摘要](./claude-code-main/CLAUDE_CODE_MAIN_SUMMARY.md)
