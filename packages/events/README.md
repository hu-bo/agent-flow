# @agent-flow/events

结构化日志与追踪原语，为 Agent 执行链路提供可观测性支持。

## 使用

```ts
import { Logger, Tracer } from '@agent-flow/events';

const logger = new Logger({ sinks: [consoleSink] });
logger.info('Agent started', { sessionId });

const tracer = new Tracer();
const span = tracer.startSpan('tool-execution');
// ... 执行逻辑
span.end();
```

## 模块

| 模块 | 说明 |
|------|------|
| `logger` | 结构化日志记录器 |
| `tracer` | 追踪器，支持 span 级别的链路追踪 |
| `sinks` | 日志输出目标（console / file / remote） |
| `types` | 日志与追踪类型定义 |

```bash
# 构建
pnpm --filter @agent-flow/events build

# 类型检查
pnpm --filter @agent-flow/events typecheck
```
