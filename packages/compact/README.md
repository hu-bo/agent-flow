# @agent-flow/compact

上下文压缩策略包，为长对话提供多种压缩方案以控制 token 消耗。

## 使用

```ts
import { AutoCompact, TokenEstimator } from '@agent-flow/compact';

const estimator = new TokenEstimator();
const compactor = new AutoCompact({ estimator, strategy: 'summarization' });
const compacted = await compactor.compact(messages);
```

## 模块

| 模块 | 说明 |
|------|------|
| `auto-compact` | 自动压缩控制器，根据 token 阈值触发压缩 |
| `token-estimator` | Token 数量估算器 |
| `quality-evaluator` | 压缩质量评估器 |

### 压缩策略

| 策略 | 说明 |
|------|------|
| `summarization` | 摘要式压缩，将长对话浓缩为关键信息 |
| `semantic` | 语义压缩，保留语义相关的上下文 |
| `rewrite` | 重写式压缩，精简表达 |
| `diff` | 差异压缩，仅保留增量变化 |

```bash
# 构建
pnpm --filter @agent-flow/compact build

# 类型检查
pnpm --filter @agent-flow/compact typecheck
```
