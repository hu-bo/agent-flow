# @agent-flow/model-gateway

模型路由网关，负责模型选择、fallback 链和速率限制。

## 主要导出

| 导出 | 说明 |
|------|------|
| `ModelGateway` | 网关主类，统一管理模型调用 |
| `ModelRouter` | 模型路由器，根据配置选择目标模型 |
| `FallbackChain` | 失败回退链，自动切换备选模型 |
| `RateLimiter` | 速率限制器 |

## 依赖

- `@agent-flow/model-contracts`

## 使用

```ts
import { ModelGateway, FallbackChain } from '@agent-flow/model-gateway';

const gateway = new ModelGateway(config);
```

## 构建

```bash
pnpm --filter @agent-flow/model-gateway build
```
