# @agent-flow/sdk

Agent Flow 的 TypeScript SDK，提供编程式 API 来创建和运行 Agent。

## 主要导出

- `AgentFlow` — SDK 入口类
- `createAgent` — 快速创建 Agent 的工厂函数

## 使用

```ts
import { AgentFlow, createAgent } from '@agent-flow/sdk';

const flow = new AgentFlow({
  model: 'gpt-4o',
  tools: [/* ... */],
});

const agent = createAgent(flow);
const result = await agent.run('帮我分析这段代码');
```

## 构建

```bash
pnpm --filter @agent-flow/sdk build
```
