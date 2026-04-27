# @agent-flow/api-gateway-web

API Gateway 管理控制台，用于管理 LLM 代理网关的供应商配置、API Key、用户和请求日志。

## 技术栈

- React 19 + TypeScript
- Vite 7
- Ant Design 5 + @ant-design/icons
- React Router 7

## 功能

- **Dashboard** — 网关运行状态总览
- **Providers** — 供应商管理（OpenAI / Anthropic / Google / DeepSeek / 自定义），配置 API Key 与 Base URL
- **API Keys** — API Key 生命周期管理（创建 / 停用 / 列表）
- **Users** — 用户管理（创建 / 查看）
- **Logs** — 请求日志查询与详情查看，支持按对话 ID 过滤
- **Login** — 认证登录，Bearer Token 鉴权

## 开发

```bash
# 安装依赖（在 monorepo 根目录）
pnpm install

# 启动开发服务器
pnpm --filter @agent-flow/api-gateway-web dev

# 构建
pnpm --filter @agent-flow/api-gateway-web build

# 预览构建产物
pnpm --filter @agent-flow/api-gateway-web preview
```

> 需要先启动 `apps/api-gateway` Go 后端服务。

## 提供的能力

- 可视化管理 API Gateway 的全部资源（供应商、密钥、用户、日志）
- 为运维人员提供网关监控与排查入口
- 与 `apps/api-gateway` Go 后端配合，覆盖网关管理的完整前端流程
