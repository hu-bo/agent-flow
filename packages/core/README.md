# @agent-flow/core

Agent Flow 核心运行时，包含 Agent 循环、查询引擎、工具执行和工作流编排。



## 依赖

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
