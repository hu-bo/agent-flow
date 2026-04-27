# @agent-flow/storage

存储适配器包，提供 Redis、Qdrant 和内存存储的统一接口。

## 使用

```ts
import { InMemoryStore, RedisAdapter, QdrantAdapter } from '@agent-flow/storage';

// 内存存储（开发 / 测试）
const store = new InMemoryStore();

// Redis 适配器（会话 / 缓存）
const redis = new RedisAdapter({ url: 'redis://localhost:6379' });

// Qdrant 适配器（向量存储）
const qdrant = new QdrantAdapter({ url: 'http://localhost:6333' });
```

## 模块

| 模块 | 说明 |
|------|------|
| `in-memory` | 内存存储，适用于开发与测试 |
| `redis-adapter` | Redis 适配器，用于会话持久化与缓存 |
| `qdrant-adapter` | Qdrant 适配器，用于向量存储与检索 |
| `types` | 存储接口类型定义 |

```bash
# 构建
pnpm --filter @agent-flow/storage build

# 类型检查
pnpm --filter @agent-flow/storage typecheck
```
