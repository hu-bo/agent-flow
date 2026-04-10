# @agent-flow/core

Agent Flow 核心运行时，包含 Agent 循环、查询引擎、工具执行和工作流编排。

## 主要导出

| 导出 | 说明 |
|------|------|
| `Agent` | Agent 主类，驱动对话循环 |
| `QueryEngine` | 查询引擎 |
| `ToolRegistry` | 工具注册表 |
| `PermissionManager` | 权限管理器 |
| `WorkflowEngine` | 工作流编排引擎 |
| `AgentTeam` | 多 Agent 协作 |

## 依赖

- `@agent-flow/model-contracts`
- `@agent-flow/model-gateway`
- `@agent-flow/context-store`
- `@agent-flow/context-compressor`
- `@agent-flow/checkpoint`

## 使用

```ts
import { Agent, ToolRegistry } from '@agent-flow/core';

const tools = new ToolRegistry();
const agent = new Agent({ gateway, tools, store });
const response = await agent.run('Hello');
```

## 构建

```bash
pnpm --filter @agent-flow/core build
```
