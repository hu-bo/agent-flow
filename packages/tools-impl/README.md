# @agent-flow/tools-impl

内置工具实现包，提供文件系统、Git 和 HTTP 等常用工具供 Agent 调用。

## 使用

```ts
import { registerBuiltinTools } from '@agent-flow/tools-impl';
import { ToolRegistry } from '@agent-flow/core';

const registry = new ToolRegistry();
registerBuiltinTools(registry);
```

## 内置工具

| 工具 | 说明 |
|------|------|
| `fs-tools` | 文件系统操作（读写文件、列目录、搜索等） |
| `git-tool` | Git 操作（status、diff、commit、log 等） |
| `http-tool` | HTTP 请求（GET / POST / PUT / DELETE） |

## 依赖

- `@agent-flow/core` — 工具注册表与 schema 定义

```bash
# 构建
pnpm --filter @agent-flow/tools-impl build

# 类型检查
pnpm --filter @agent-flow/tools-impl typecheck
```

## 扩展

实现 `@agent-flow/core` 的工具接口并通过 `register.ts` 注册即可添加新工具。
