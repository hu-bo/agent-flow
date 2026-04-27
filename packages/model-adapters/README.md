# @agent-flow/model-adapters

统一模型适配器包，定义适配器协议标准并提供多供应商实现。

## 使用

```ts
// 使用 Vercel AI SDK 适配器（推荐）
import { createAiSdkAdapter } from '@agent-flow/model-adapters/ai-sdk';

// 使用 OpenAI 工厂
import { createOpenAIAdapter } from '@agent-flow/model-adapters/openai';

// 使用 Anthropic 工厂
import { createAnthropicAdapter } from '@agent-flow/model-adapters/anthropic';

// 使用本地确定性适配器（测试用）
import { createLocalAdapter } from '@agent-flow/model-adapters/local';

// 仅导入类型
import type { ModelAdapter, ModelRequest, ModelResponse } from '@agent-flow/model-adapters/types';
```

## 导出路径

| 路径 | 说明 |
|------|------|
| `./types` | 适配器协议类型（adapter / message / model / request / response / tool / errors） |
| `./ai-sdk` | 基于 Vercel AI SDK 的通用适配器 |
| `./openai` | OpenAI 工厂 |
| `./anthropic` | Anthropic 工厂 |
| `./local` | 本地确定性适配器（用于测试与开发） |

## 依赖

- `ai` — Vercel AI SDK
- `@ai-sdk/openai` — OpenAI provider
- `@ai-sdk/anthropic` — Anthropic provider

```bash
# 构建
pnpm --filter @agent-flow/model-adapters build

# 类型检查
pnpm --filter @agent-flow/model-adapters typecheck
```

## 设计原则

`@agent-flow/core` 通过本包的适配器协议接入模型，不直接依赖任何供应商 SDK。新增供应商只需实现 `ModelAdapter` 接口并注册即可。
