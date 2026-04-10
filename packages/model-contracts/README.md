# @agent-flow/model-contracts

Agent Flow 的类型定义基础包，提供整个系统共享的接口和类型。

## 特点

- 零运行时依赖
- 纯 TypeScript 类型定义

## 主要导出

| 类型 | 说明 |
|------|------|
| `UnifiedMessage` | 统一消息格式 |
| `ProviderAdapter` | 模型提供商适配器接口 |
| `ModelCapabilities` | 模型能力描述 |
| `ToolDefinition` | 工具定义 |
| `ChatRequest` / `ChatResponse` | 请求 / 响应结构 |
| `StreamChunk` | 流式传输数据块 |
| `MessageConverter` | 消息格式转换器接口 |

## 使用

```ts
import type { UnifiedMessage, ProviderAdapter, ToolDefinition } from '@agent-flow/model-contracts';
```

## 构建

```bash
pnpm --filter @agent-flow/model-contracts build
pnpm --filter @agent-flow/model-contracts typecheck
```
