# @agent-flow/console

Agent Flow 管理控制台，用于监控系统状态、管理会话和查看任务。

## 技术栈

- React 19 + TypeScript
- Vite 7（开发端口 5174）

## 功能

- **Dashboard** — 服务器健康状态监控，显示当前模型信息，每 10 秒自动刷新
- **Sessions** — 会话列表管理（查看 / 删除）
- **Tasks** — 任务状态查看与监控

所有数据通过 REST API 从后端 (`http://localhost:3000`) 获取。

## 使用

```bash
# 安装依赖（在 monorepo 根目录）
pnpm install

# 启动开发服务器
pnpm --filter @agent-flow/console dev

# 构建
pnpm --filter @agent-flow/console build

# 预览构建产物
pnpm --filter @agent-flow/console preview
```

> 需要先启动 `@agent-flow/server` 后端服务。
