# claude-code-main 学习总结（README + src）

## 1. 项目定位与背景

`claude-code-main` 是一个基于 **TypeScript + Bun** 的终端 Agent 工具源码快照（研究镜像）。从仓库 README 看，项目核心目标是：

- 在 CLI 中与模型对话
- 让模型可调用“工具”执行工程任务（读写文件、跑命令、检索、调用子 Agent 等）
- 用命令系统、权限系统、插件/技能系统扩展能力
- 在复杂会话里做上下文管理、成本追踪和任务编排

README 还强调该仓库是公开暴露快照的研究归档，不是官方仓库。

---

## 2. 整体架构（从 src 观察）

### 2.1 启动入口与初始化

- 入口：`src/main.tsx`
- 特点：启动时做大量“并行预热”和延迟加载（例如 MDM、Keychain、Bootstrap、Feature Flags、插件/技能初始化等）
- 使用 `bun:bundle` 的 `feature()` 做编译期特性裁剪，很多功能模块是按 flag 条件导入（减少不需要功能的代码体积/路径）

整体上 `main.tsx` 的职责非常重，属于“编排层”：

- CLI 参数解析（Commander）
- 环境与设置加载
- 命令注册与过滤
- 工具池初始化
- REPL/UI 启动
- 远程/桥接/多 Agent 等模式切换

### 2.2 命令系统（/xxx）

- 核心文件：`src/commands.ts`
- 命令来源有四类：
  - 内建命令（如 `/review`、`/memory`、`/mcp`、`/plugin` 等）
  - skills 目录命令
  - plugin 提供命令
  - workflow 生成命令（特性开关控制）
- 关键机制：
  - `getCommands(cwd)` 统一汇总并按可用性、权限、开关过滤
  - 通过 memoize 缓存重加载成本
  - 支持 remote/bridge 场景的“安全命令白名单”

这意味着命令系统不只是静态注册，而是“动态聚合 + 条件可见”。

### 2.3 工具系统（模型可调用）

- 核心文件：`src/tools.ts`
- 工具池包含：`BashTool`、`FileReadTool`、`FileEditTool`、`WebFetchTool`、`AgentTool`、`MCP` 相关工具等
- 关键机制：
  - `getAllBaseTools()` 定义“可用工具全集”
  - `getTools(permissionContext)` 按权限模式、运行模式（如 REPL/simple）和 feature flag 过滤
  - `assembleToolPool()` 把内建工具与 MCP 工具合并并去重

工具层里有一个很重要的设计：**工具可见性和工具执行权限是两层控制**。

- 第一层：在 prompt 中展示/暴露哪些工具
- 第二层：调用时再做权限判断

### 2.4 UI 与交互

- 终端 UI 基于 React + Ink（大量组件位于 `src/components`、`src/ink`）
- 不是简单 readline；具备复杂的状态渲染、消息分组、权限弹窗、通知、对话可视化

### 2.5 扩展系统

- `src/plugins`：插件系统
- `src/skills`：技能系统（prompt 能力扩展）
- `src/services/mcp`：MCP Server 接入
- 这三者共同构成“外部能力注入层”

---

## 3. 你当前关注文件的重点

## 3.1 `src/tools/AgentTool/AgentTool.tsx`

这是子 Agent 能力的核心实现，复杂度很高。主要职责：

- 定义 `AgentTool` 的输入输出 schema（Zod）
- 生成工具提示（prompt）并根据当前可用 agent/权限过滤
- 执行 agent 启动流程：
  - 同步执行
  - 后台执行（run_in_background）
  - teammate/team 相关模式
  - worktree 隔离模式
  - remote 隔离模式（受环境/开关影响）
- 处理 agent 生命周期：注册、进度上报、完成/失败回传
- 防止某些高风险或语义错误路径（如 fork 子流程递归、上下文不一致场景）

结论：`AgentTool` 是“模型调用 -> 多 Agent 编排执行”的关键桥梁。

## 3.2 `src/tools/AgentTool/prompt.ts`

这是 `AgentTool` 的使用说明生成器，核心价值不是“文案”，而是**行为约束**：

- 动态列出可用 agent（或通过系统消息附件注入）
- 指导什么时候该用 Agent、什么时候不该用
- 指导如何写高质量委派 prompt（尤其是给 fresh agent 的背景补全）
- 针对 fork 场景加入特殊约束（不要提前读取中间输出、不要猜测结果）

这能显著影响模型在复杂任务里的调度质量。

## 3.3 `src/tools/AgentTool/agentMemory.ts`

该文件定义 Agent 的持久记忆目录策略，支持三层 scope：

- `user`：用户级（跨项目）
- `project`：项目级（仓库内）
- `local`：本地项目级（不入版本控制）

关键点：

- 对 agentType 做路径安全清洗（如 `:` -> `-`）
- `isAgentMemoryPath` 会做 normalize 后路径判断，避免简单路径穿越绕过
- 记忆会拼装成 prompt 注入 agent 系统上下文

## 3.4 `src/tools/BashTool/sedEditParser.ts`

这是一个“把 sed 原地编辑解析成结构化编辑意图”的解析器，作用是让 shell 编辑能被系统更好理解/展示。

主要能力：

- 识别 `sed -i` 类命令
- 提取编辑目标文件、pattern、replacement、flags
- 支持基础 BRE/ERE 差异处理
- 将 sed substitution 映射为 JS 正则替换（含转义处理）

安全和鲁棒性上做了不少限制：

- 只接受简单可解析模式
- 多文件、复杂 glob、未知 flag 直接拒绝解析
- replacement 中对 `&` 等特殊语义做安全转换

---

## 4. 从源码看出的关键设计思想

- **特性开关驱动架构**：大量 feature-gated import，既做功能分层，也做编译期裁剪。
- **工具优先的 Agent 体系**：模型能力通过工具边界落地，执行动作可控、可审计。
- **动态扩展优先**：命令/技能/插件/MCP 均可热插拔式参与系统能力。
- **多层权限控制**：工具展示与执行双层控制，配合规则过滤和交互式授权。
- **多 Agent 协作**：支持子 Agent、team、后台任务、隔离运行，是偏“编排器”而非单聊天机器人。
- **工程化程度高**：围绕缓存稳定性、启动性能、跨模式一致性、故障降级都做了细粒度处理。

---

## 5. 快速结论（TL;DR）

`claude-code-main` 本质上是一个“终端内 Agent OS”风格的系统：

- `main.tsx` 负责总编排；
- `commands.ts` 管用户入口；
- `tools.ts` 管模型执行能力；
- `AgentTool` 负责多 Agent 任务分发与生命周期；
- `prompt.ts + agentMemory.ts` 负责把“行为策略”和“长期记忆”注入到 Agent；
- `sedEditParser.ts` 展示了它对 shell 修改行为做结构化理解的工程思路。

如果后续要深入二次开发，建议优先读这条主链：

1. `src/main.tsx`
2. `src/commands.ts`
3. `src/tools.ts`
4. `src/tools/AgentTool/AgentTool.tsx`
5. `src/tools/AgentTool/runAgent.ts`（本次未展开，但和 Agent 执行强相关）
6. `src/services/tools/*` 与 `src/hooks/toolPermission/*`
