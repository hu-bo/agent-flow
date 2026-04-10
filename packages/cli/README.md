# @agent-flow/cli

Agent Flow 命令行工具，提供交互式 REPL 环境。

## 安装

```bash
pnpm --filter @agent-flow/cli build
```

安装后可通过 `agent-flow` 命令使用。

## 使用

```bash
# 启动交互式 REPL
agent-flow

# 开发模式（tsx 热重载）
pnpm --filter @agent-flow/cli dev
```

## REPL 命令

| 命令 | 说明 |
|------|------|
| `/model` | 切换 AI 模型 |
| `/compact` | 触发上下文压缩 |
| `/sessions` | 管理会话 |
| `/tools` | 查看可用工具 |
| `/help` | 显示帮助 |
| `/quit` | 退出 |

## 功能

- 交互式对话 REPL
- 运行时模型切换
- 上下文自动 / 手动压缩
- 会话持久化与恢复
- 工具调用支持
