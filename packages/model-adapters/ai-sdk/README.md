# @agent-flow/model-adapter-ai-sdk

基于 Vercel AI SDK 的模型适配器（主适配器），同时支持 OpenAI 和 Anthropic 模型。

## 主要导出

- `AiSdkAdapter` — 适配器主类
- `AiSdkMessageConverter` — 消息格式转换器

## 依赖

- `@agent-flow/model-contracts`
- `ai` (Vercel AI SDK)
- `@ai-sdk/openai`, `@ai-sdk/anthropic`

## 使用

```ts
import { AiSdkAdapter } from '@agent-flow/model-adapter-ai-sdk';

const adapter = new AiSdkAdapter();
```

## 构建

```bash
pnpm --filter @agent-flow/model-adapter-ai-sdk build
```
