# @agent-flow/context-store

上下文存储与会话管理，负责消息持久化和会话生命周期。

## 主要导出

| 导出 | 说明 |
|------|------|
| `ContextStore` | 上下文存储主类 |
| `SessionManager` | 会话管理器（创建 / 恢复 / 删除） |
| `JsonlSerializer` | JSONL 格式序列化器 |
| `MemoryStore` | 内存存储实现 |

## 依赖

- `@agent-flow/model-contracts`

## 使用

```ts
import { ContextStore, SessionManager } from '@agent-flow/context-store';

const store = new ContextStore();
const session = new SessionManager(store);
```

## 构建

```bash
pnpm --filter @agent-flow/context-store build
```
