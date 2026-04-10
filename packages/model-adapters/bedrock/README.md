# @agent-flow/model-adapter-bedrock

AWS Bedrock 适配器，通过 AWS SDK 调用 Bedrock 上托管的模型。

## 主要导出

- `BedrockAdapter` — 适配器主类
- `BedrockMessageConverter` — 消息格式转换器

## 依赖

- `@agent-flow/model-contracts`
- `@aws-sdk/client-bedrock-runtime`

## 使用

```ts
import { BedrockAdapter } from '@agent-flow/model-adapter-bedrock';

const adapter = new BedrockAdapter({ region: 'us-east-1' });
```

## 构建

```bash
pnpm --filter @agent-flow/model-adapter-bedrock build
```
