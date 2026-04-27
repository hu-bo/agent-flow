# @agent-flow/console

Agent Flow 管理控制台，用于监控系统状态、管理模型 / 供应商配置、查看会话与任务。

## 技术栈

- React 19 + TypeScript
- Vite 7（开发端口 5174）
- Radix UI Themes

## 功能

- **Dashboard** — 服务器健康状态监控，显示当前模型信息，每 10 秒自动刷新
- **Providers** — 供应商配置管理（OpenAI / Anthropic / Custom），包含 base_url、apiKey 与扩展配置
- **Models** — 模型列表管理（新增 / 编辑 / 删除），用于下发给 web-ui
- **Sessions** — 会话列表管理（查看 / 删除）
- **Tasks** — 任务状态查看与监控

所有数据通过 REST API 从 `@agent-flow/web-server`（`http://localhost:9200`）获取。

## 开发

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

> 需要先启动 `@agent-flow/web-server` 后端服务。

## 提供的能力

- 为管理员提供系统运行状态的可视化监控
- 集中管理模型、供应商、会话和任务资源
- 与 `@agent-flow/web-server` 配合，覆盖平台管理的完整前端流程
