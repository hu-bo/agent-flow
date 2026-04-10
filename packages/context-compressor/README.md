# @agent-flow/context-compressor

上下文压缩引擎，支持自动压缩、微压缩和摘要生成，用于控制上下文窗口大小。

## 主要导出

| 导出 | 说明 |
|------|------|
| `ContextCompressor` | 压缩引擎主类 |
| Auto-compact 工具函数 | 自动触发上下文压缩 |
| Micro-compact 工具函数 | 细粒度微压缩 |
| System prompts | 压缩用系统提示词 |

## 依赖

- `@agent-flow/model-contracts`
- `@agent-flow/model-gateway`

## 使用

```ts
import { ContextCompressor } from '@agent-flow/context-compressor';

const compressor = new ContextCompressor(gateway);
const compacted = await compressor.compact(messages);
```

## 构建

```bash
pnpm --filter @agent-flow/context-compressor build
```
