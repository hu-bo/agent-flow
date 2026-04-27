# @agent-flow/memory

记忆与 RAG 原语，为 Agent 提供会话记忆和向量检索能力。

## 使用

```ts
import { SessionMemory, VectorMemory, MemoryService } from '@agent-flow/memory';

// 会话记忆
const sessionMem = new SessionMemory();
sessionMem.append(message);

// 向量记忆（RAG）
const vectorMem = new VectorMemory({ embedder });
await vectorMem.store(document);
const results = await vectorMem.search(query);

// 统一记忆服务
const memoryService = new MemoryService({ session: sessionMem, vector: vectorMem });
```

## 模块

| 模块 | 说明 |
|------|------|
| `session-memory` | 会话级短期记忆，维护当前对话上下文 |
| `vector-memory` | 向量记忆，支持语义检索（RAG） |
| `memory-service` | 统一记忆服务，协调短期与长期记忆 |
| `default-embedder` | 默认嵌入器实现 |
| `types` | 记忆相关类型定义 |

```bash
# 构建
pnpm --filter @agent-flow/memory build

# 类型检查
pnpm --filter @agent-flow/memory typecheck
```
