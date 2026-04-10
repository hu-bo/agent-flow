# @agent-flow/model-adapter-gemini

Google Gemini API 适配器。

## 主要导出

- `GeminiAdapter` — 适配器主类
- `GeminiMessageConverter` — 消息格式转换器

## 依赖

- `@agent-flow/model-contracts`
- `@google/generative-ai`

## 使用

```ts
import { GeminiAdapter } from '@agent-flow/model-adapter-gemini';

const adapter = new GeminiAdapter({ apiKey: process.env.GEMINI_API_KEY });
```

## 构建

```bash
pnpm --filter @agent-flow/model-adapter-gemini build
```
