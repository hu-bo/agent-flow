# @agent-flow/model-adapter-openai

原生 OpenAI API 适配器，将 `UnifiedMessage` 转换为 OpenAI 格式，支持流式传输和 token 计数。

## 主要导出

- `OpenAIAdapter` — 适配器主类
- `OpenAIMessageConverter` — 消息格式转换器

## 依赖

- `@agent-flow/model-contracts`
- `openai`

## 使用

```ts
import { OpenAIAdapter } from '@agent-flow/model-adapter-openai';

const adapter = new OpenAIAdapter({ apiKey: process.env.OPENAI_API_KEY });
```

## 构建

```bash
pnpm --filter @agent-flow/model-adapter-openai build
```
