# @agent-flow/core

Agent Flow 核心运行时，定义 Agent 循环、工具执行、工作流编排和状态管理的基础抽象。

## 模块结构

```
packages/core/src/
├─ context/          # 上下文管理
│  ├─ builder/       # 上下文构建器
│  ├─ loader/        # 上下文加载器
│  ├─ selector/      # 上下文选择器
│  └─ window/        # 上下文窗口管理
├─ messages/         # 消息模型（message / model / tool / errors）
├─ orchestration/    # 工作流编排
│  ├─ executor/      # 执行器
│  ├─ graph/         # DAG 图引擎
│  ├─ guardrails/    # 护栏 / 约束
│  ├─ planner/       # 任务规划器
│  └─ scheduler/     # 调度器
├─ prompt/           # Prompt 管理
│  ├─ system-loader/ # 系统提示词加载
│  └─ variables/     # 变量替换
├─ state/            # 状态管理
│  ├─ checkpoint/    # 检查点
│  ├─ replay/        # 回放
│  └─ session/       # 会话状态
├─ tools/            # 工具系统
│  ├─ executor/      # 工具执行器
│  ├─ registry/      # 工具注册表
│  └─ schema/        # 工具 schema 定义
└─ types/            # 公共类型
```

## 使用

```ts
import { Agent, ToolRegistry } from '@agent-flow/core';

const tools = new ToolRegistry();
const agent = new Agent({ gateway, tools, store });
const response = await agent.run('Hello');
```

```bash
# 构建
pnpm --filter @agent-flow/core build

# 类型检查
pnpm --filter @agent-flow/core typecheck
```

## 导出

- `.` — 主入口（Agent、ToolRegistry、编排器等）
- `./messages` — 消息类型与工具类型
