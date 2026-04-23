# Playground 能力补齐技术方案（基于 tsconfig.base.json）

## 1. 背景与目标

本文基于以下输入进行评估：
- 根配置：`tsconfig.base.json`
- 目标应用：`apps/playground`
- 关联实现：`apps/server`、`packages/chat-ui`、`packages/model-contracts`

目标是回答两个问题：
1. `apps/playground` 在工程配置层面（TypeScript/构建）与全仓规范相比还缺什么。
2. `apps/playground` 在产品能力层面还应补哪些关键能力，才能成为可用于日常联调和演示的完整 Playground。

---

## 2. 现状摘要

### 2.1 TypeScript 基线

`tsconfig.base.json` 提供的基线能力（关键项）：
- `strict: true`
- `verbatimModuleSyntax: true`
- `declaration / declarationMap / sourceMap`
- `module: NodeNext`, `moduleResolution: NodeNext`
- `types: ["node"]`

`apps/playground/tsconfig.json` 现状：
- 使用 `module: ESNext` + `moduleResolution: bundler`（适配 Vite，方向正确）
- 未 `extends ../../tsconfig.base.json`
- 通过复制配置保持 `strict` 等选项

结论：Playground 的 TS 配置“能工作”，但没有继承统一基线，长期存在配置漂移风险。

### 2.2 Playground 功能现状

已具备：
- WebSocket 实时消息收发（`/ws`）
- 会话列表创建/删除/切换 UI
- Chat 面板渲染（复用 `@agent-flow/chat-ui`）
- 路由骨架（`/chat`、`/agent`、`/flow`）

明显未闭环：
- `ModelSelector` 已实现但未挂载到页面
- `triggerCompact` API 已定义但无 UI 入口
- 会话选择未传递到聊天发送链路（仅 UI 选择）
- `/agent`、`/flow` 仍为占位页
- 附件能力在 Chat UI 可用，但 Playground 未接入

---

## 3. 能力缺口清单

## 3.1 工程与类型能力缺口

### G1. 缺少 Web 端统一 TS 基座（高优先级）

问题：
- `apps/playground`、`apps/console`、`apps/api-gateway-web` 各自维护近似 tsconfig，重复且易分叉。

建议：
- 新增 `tsconfig.web.json`（根目录），抽取 Web 共性：
  - `target: ES2022`
  - `module: ESNext`
  - `moduleResolution: bundler`
  - `jsx: react-jsx`
  - `strict: true`
  - `verbatimModuleSyntax: true`
  - `resolveJsonModule: true`
  - `isolatedModules: true`
  - `noEmit: true`
  - `types: ["vite/client"]`
- 各 Web app 统一 `extends` 该配置。

收益：
- 减少重复配置
- 与 `tsconfig.base.json` 的“统一治理”目标保持一致
- 降低升级 TS/Vite 时的分散改动成本

### G2. 本地镜像类型导致契约漂移风险（高优先级）

问题：
- `apps/playground/src/types.ts` 在本地复制了 `UnifiedMessage` 等契约。
- `packages/model-contracts` 中 `MessageMetadata`、`TokenUsage` 已包含更丰富字段（例如 `extensions`、cache token 字段），本地镜像容易落后。

建议：
- Playground 直接从 `@agent-flow/model-contracts` 和 `@agent-flow/chat-ui` 导入类型。
- 删除本地重复定义，仅保留 UI 扩展类型。

收益：
- 前后端协议一致性更高
- 减少升级时的隐性类型错误

### G3. 脚本跨平台能力不足（中优先级）

问题：
- `apps/playground/package.json` 的 `clean` 使用 `rm -rf dist`，对 Windows shell 兼容性差。

建议：
- 改为 `rimraf dist` 或 `del-cli`。

---

## 3.2 产品与交互能力缺口

### P1. 会话能力未真正接入聊天链路（最高优先级）

问题：
- 侧栏可选择 `activeSessionId`，但 `useChat.sendMessage` 未发送 `sessionId`。
- 当前 WebSocket 消息结构仅 `{ type: 'chat', message, model? }`，未绑定会话。

影响：
- “切换会话”只改变 UI，不改变后端上下文。
- 无法实现真实的多会话连续对话。

建议：
- 扩展 WS 请求体：`{ type: 'chat', sessionId, message, model?, attachments? }`
- 服务端按 `sessionId` 加载/追加上下文消息。
- 首次会话不存在时自动创建或明确返回错误。

### P2. 模型切换与压缩入口缺失（高优先级）

问题：
- `ModelSelector` 组件未挂载。
- `triggerCompact` 方法未被调用，且服务端要求 `sessionId`，当前调用会失败。

建议：
- 在 `Sidebar` 或 `Workspace` 头部接入 `ModelSelector`。
- 增加“手动压缩上下文”按钮，调用 `/api/compact` 时传 `sessionId`。
- 压缩成功后刷新会话消息与 token 统计。

### P3. 协议语义与实现不一致（高优先级）

问题：
- Playground 已定义 `text-delta`、`tool-call`、`tool-result` 分支。
- 服务端当前主要发送 `message`、`done`、`error`，未发送 delta 级别事件。

风险：
- 前端状态机会出现“设计支持但实际收不到”的伪能力。

建议（二选一，建议 B）：
- A. 前端删去未实现事件，保持最小真实协议。
- B. 服务端真正输出结构化流事件（`text-delta`、`tool-call`、`tool-result`、`done`），前端保留并完善渲染。

### P4. 附件能力未打通（中高优先级）

问题：
- `ChatPanel` 支持 `onFileSelect` + `attachments`。
- Playground 的 `onSend` 签名支持附件，但 `useChat.sendMessage` 实际忽略附件。
- 服务端 `/ws`/`/api/chat` 也未接入附件处理。

建议：
- 增加上传/编码策略（小文件 Base64，大文件 URL + 元数据）。
- 在消息协议中加入 `file` 类型内容块，复用 `model-contracts` 的 `FilePart`。

### P5. Agent/Flow 仅有路由外壳（中优先级）

问题：
- `/agent`、`/flow` 目前为占位文案。

建议：
- `agent` 页优先接入 `tasks` 生命周期：创建任务、轮询状态、查看 checkpoint。
- `flow` 页提供 DAG/步骤视图（初版可先用 JSON 配置 + 执行日志面板）。

### P6. 可观测性与错误反馈不足（中优先级）

问题：
- 错误主要 `console.error`，用户无感知。
- 未展示 token usage、tool duration、provider/model 等元数据。

建议：
- 增加全局通知（toast）和错误分级（可重试/不可重试）。
- 在消息气泡或侧栏展示 `metadata`（token、模型、工具耗时）。

---

## 4. 分阶段实施路线图

## Phase 0（1-2 天）: 工程基线收敛

范围：
- 建立 `tsconfig.web.json` 并让 Playground 继承
- 补 `verbatimModuleSyntax`、`types: ["vite/client"]`
- 清理本地重复类型，改为导入 `model-contracts`
- 修复 `clean` 脚本跨平台问题

验收：
- `pnpm --filter @agent-flow/playground build` 通过
- `pnpm --filter @agent-flow/playground typecheck`（需新增脚本）通过

## Phase 1（3-5 天）: 聊天能力闭环

范围：
- 会话与聊天消息绑定（session-aware WS 协议）
- 挂载模型切换组件
- 增加“手动 compact”入口并传 `sessionId`
- 完善用户态错误提示

验收：
- 切换不同会话后，上下文互不串扰
- 模型切换后新回复可见 model 变更
- compact 调用成功并可看到压缩结果反馈

## Phase 2（5-8 天）: 高级能力补齐

范围：
- 流式事件精细化（delta/tool-call/tool-result）
- 附件上传与渲染链路
- Agent/Flow 页面从占位升级为可操作页面
- 增加关键交互测试（hooks + 组件）

验收：
- 工具调用过程可视化
- 附件发送和回显可用
- `/agent` 至少可完成“创建任务 -> 查看状态”的闭环

---

## 5. 推荐优先级结论

如果只做一轮短迭代，建议优先落地：
1. 会话绑定聊天链路（P1）
2. 模型切换与 compact 接入（P2）
3. TS/类型基线收敛（G1 + G2）

这三项完成后，Playground 将从“演示壳”升级为“可稳定联调的真实工作台”。

---

## 6. 附：证据文件（本次评估依据）

- `tsconfig.base.json`
- `apps/playground/tsconfig.json`
- `apps/playground/src/hooks/useChat.ts`
- `apps/playground/src/components/Sidebar/Sidebar.tsx`
- `apps/playground/src/components/Workspace/Workspace.tsx`
- `apps/playground/src/components/ModelSelector/ModelSelector.tsx`
- `apps/playground/src/api.ts`
- `apps/server/src/index.ts`
- `packages/model-contracts/src/message.ts`
- `packages/chat-ui/src/components/ChatPanel/ChatPanel.tsx`
