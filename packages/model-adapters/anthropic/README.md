# @agent-flow/model-adapter-anthropic

原生 Anthropic API 适配器，将 `UnifiedMessage` 转换为 Anthropic Messages API 格式。

## 主要导出

- `AnthropicAdapter` — 适配器主类
- `AnthropicMessageConverter` — 消息格式转换器

## 依赖

- `@agent-flow/model-contracts`
- `@anthropic-ai/sdk`

## 使用

```ts
import { AnthropicAdapter } from '@agent-flow/model-adapter-anthropic';

const adapter = new AnthropicAdapter({ apiKey: process.env.ANTHROPIC_API_KEY });
```

## 构建

```bash
pnpm --filter @agent-flow/model-adapter-anthropic build
```
