# Goal Engine + SubAgent 实现方案

本文基于 `docs/AGENT-CORE-FLOW.md` 的主链路设计，结合当前 `packages/core`、`apps/web-server`、`apps/web-ui` 的真实代码结构，给出适合本项目的 Goal Engine + SubAgent 落地方案。`docs/todo.md` 仅作为概念参考，不严格沿用其中伪代码。

## 1. 调研结论

当前项目已经具备 Goal Engine 的底座：

- `packages/core` 已有 `AgentRunRequest -> ContextBuilder -> CapabilityPlanner -> AgentPlan -> DefaultPlanExecutor -> checkpoint/replay` 主流程。
- `AgentPlan` 已经是 DAG 形态，`DagGraphBuilder` 校验依赖，`TopologicalScheduler` 可按批次调度并行根节点。
- `AgentStep` 已支持 `llm`、`tool`、`runner` 三种执行类型，`runner` 已通过 `RemoteRunner` 接入 web-server 的 runner dispatch。
- `web-server` 已有 `/chat` 同步流式链路和 `/tasks` 后台任务链路，适合分别承载“即时对话”和“持久目标”。
- `TaskService` 当前是内存态任务管理，已有 pause/resume/cancel/retry 和 SSE task events，但还不是 Goal 语义。
- `CoreRuntimeGateway` 当前只有 `/run` 指令才进入 core runtime；普通聊天直接走 model adapter + tools。
- core 的 `llm` step 当前是 placeholder 输出，真正 LLM 生成在 `web-server` 的 `CoreRuntimeGateway` 内部，不在 `packages/core` 内。

因此建议采用：

```text
Goal Engine = web-server 持久目标服务 + core goal planner/executor 扩展
SubAgent = core 内部一种 capability worker，不做无限递归 agent
```

不要把 subagent 做成 `Agent -> Agent -> Agent` 的递归聊天架构。更适合本项目的是：

```text
User / Chat / Task
  -> GoalService
  -> GoalRuntime
  -> GoalPlanner produces AgentPlan DAG
  -> PlanExecutor runs tool / runner / subagent steps
  -> Verifier updates Goal state
  -> SSE events back to UI
```

## 2. 命名边界：不要替换现有 request.goal

当前 `packages/core/src/types/index.ts` 已有：

```ts
export interface AgentRunRequest {
  taskId?: string;
  goal: string;
  // ...
}
```

`packages/core/src/orchestration/planner/plan-factory.ts` 中大量使用的 `request.goal` 是“一次 AgentRun 的目标文本”，本质上更接近 `prompt` / `objective text` / `user request`。它是现有 runtime 的核心输入，短期不建议重命名，否则会影响 planner、executor、runtime-gateway、task-service 等多处链路。

本文后续提到的 Goal Engine 是“持久目标生命周期”，不是 `AgentRunRequest.goal` 这个字符串字段。为了避免混淆，实现时建议采用以下命名：

| 概念 | 推荐命名 | 说明 |
| --- | --- | --- |
| 单次运行目标文本 | `AgentRunRequest.goal` | 保持现状，继续作为 planner step input 的目标文本。 |
| 持久目标记录 | `PersistentGoalRecord` 或 `GoalRecord` | web-server/API/DB 层的长期状态对象。 |
| 持久目标规格 | `PersistentGoalSpec` | objective、successCriteria、constraints、budget。 |
| 持久目标运行状态 | `GoalState` | status、progress、checdkpoint、error。 |
| core metadata 关联 | `metadata.goalId` | 用 metadata 串联现有 `AgentRunRequest` 和持久 Goal。 |

推荐第一阶段不要给 `AgentRunRequest` 增加 `goalDefinition` 字段，而是让 `GoalService` 做映射：

```ts
const request: AgentRunRequest = {
  taskId: goal.goalId,
  goal: goal.objective,
  strategy: 'plan',
  initialContext,
  metadata: {
    goalId: goal.goalId,
    goalKind: 'persistent',
    successCriteria: goal.successCriteria,
    constraints: goal.constraints,
    budget: goal.budget,
  },
};
```

这样现有 `plan-factory.ts` 里的 `request.goal` 不会混淆：它仍然只拿到 objective 文本；持久目标的额外语义放在 `metadata`，后续 `GoalPlanner` / `GoalVerifier` 再读取。

## 2. 设计目标

Goal Engine 要解决的是“目标持续推进”，不是普通一轮 chat completion。

核心能力：

- 持久化 goal：记录 objective、success criteria、constraints、budget、progress、checkpoints。
- 自动拆解：把 goal 规划为可执行 DAG，而不是只生成自然语言计划。
- 可恢复执行：支持 pause/resume/cancel/retry，并能从 checkpoint/replay 继续。
- 可验证完成：区分 task done 和 goal done，必须有验证步骤。
- 可观察：所有 plan、subtask、subagent、tool、runner、verification 都事件化。
- 可控预算：限制 token、时间、轮数、并发数、replan 次数和 subagent 数量。

SubAgent 要解决的是“能力隔离与并行执行”，不是把每个小任务都变成自由代理。

核心约束：

- Stateless：subagent 不拥有长期记忆，只接收裁剪后的上下文。
- Bounded context：只给当前子任务需要的文件、摘要、约束和前置输出。
- Strongly typed output：返回结构化 JSON，便于主流程合成和验证。
- No recursive delegation：默认不允许 subagent 再创建 subagent。
- File ownership：对会写文件的 subagent 必须声明写入范围，避免冲突。
- Event sourced：prompt、输入、工具调用、输出、错误必须进入 replay/event。

## 3. 与现有主链路的关系

基于 `AGENT-CORE-FLOW.md`，当前主链路是：

```text
ChatPage / SpecPage
  -> /api/chat
  -> ChatService
  -> CoreRuntimeGateway
  -> model adapter 或 packages/core
```

新增后建议分两条入口：

```text
即时对话入口：
ChatPage / SpecPage
  -> /api/chat
  -> ChatService
  -> CoreRuntimeGateway
  -> 普通 model stream 或 /run core runtime

持久目标入口：
GoalPage 或 ChatPage action
  -> /api/goals
  -> GoalService
  -> GoalRuntime
  -> packages/core GoalPlanner + PlanExecutor
  -> /api/goals/:goalId/events SSE
```

保留 `/chat` 的轻量体验，不强迫所有输入进入 Goal Engine。只有以下场景进入 Goal：

- 用户显式点击“创建目标”或输入 `/goal ...`。
- `background_task=true` 的长任务。
- Spec tasks 阶段确认后生成实现目标。
- 用户请求包含多阶段执行、需要验证、需要后台继续、需要跨文件修改。

## 4. 推荐架构

```mermaid
flowchart TD
  A[Web UI] --> B[/api/goals]
  B --> C[GoalService]
  C --> D[GoalStore]
  C --> E[GoalRuntime]
  E --> F[ContextBuilder]
  E --> G[GoalPlanner]
  G --> H[AgentPlan DAG]
  H --> I[DefaultPlanExecutor]
  I --> J{Step kind}
  J -->|tool| K[ToolExecutor]
  J -->|runner| L[RemoteRunner]
  J -->|subagent| M[SubAgentExecutor]
  J -->|llm| N[LLM Step Executor]
  M --> O[Capability Agent]
  I --> P[CheckpointStore]
  I --> Q[ReplayStore]
  E --> R[GoalVerifier]
  R --> S[Goal State Update]
  S --> T[/api/goals/:id/events]
```

## 5. Core 层改造

### 5.1 新增 Goal 类型

建议在 `packages/core/src/types/index.ts` 中扩展：

```ts
export type GoalStatus =
  | 'pending'
  | 'planning'
  | 'running'
  | 'blocked'
  | 'verifying'
  | 'succeeded'
  | 'failed'
  | 'cancelled';

export interface GoalBudget {
  maxTokens?: number;
  maxTimeMs?: number;
  maxSteps?: number;
  maxSubAgents?: number;
  maxReplans?: number;
}

export interface GoalDefinition {
  id: string;
  objective: string;
  successCriteria: string[];
  constraints: string[];
  budget: GoalBudget;
  metadata: Record<string, unknown>;
}

export interface GoalState {
  goalId: string;
  status: GoalStatus;
  progress: number;
  activePlanId?: string;
  latestCheckpointId?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}
```

`AgentRunRequest` 可增加可选字段：

```ts
goalDefinition?: GoalDefinition;
parentGoalId?: string;
```

这样不会破坏现有 `/run` 和 `TaskService`。

### 5.2 扩展 AgentStepKind

当前：

```ts
export type AgentStepKind = 'llm' | 'tool' | 'runner';
```

建议扩展为：

```ts
export type AgentStepKind = 'llm' | 'tool' | 'runner' | 'subagent' | 'verify';
```

新增 step 字段：

```ts
export interface SubAgentSpec {
  capability: string;
  objective: string;
  inputContextRefs?: string[];
  expectedOutputSchema?: JsonSchema;
  allowedTools?: string[];
  ownedPaths?: string[];
  timeoutMs?: number;
  modelId?: string | number;
  reasoningEffort?: 'low' | 'medium' | 'high';
}

export interface AgentStep {
  // existing fields...
  subagent?: SubAgentSpec;
  verification?: VerificationSpec;
}
```

### 5.3 新增 GoalPlanner

当前 `CapabilityPlanner` 是启发式 planner，适合简单 chat/run。Goal 需要更明确的 planning 合约：

```text
GoalDefinition + ContextEnvelope
  -> GoalPlan
  -> normalize to AgentPlan
```

建议新增：

- `packages/core/src/goal/planner/index.ts`
- `packages/core/src/goal/planner/goal-plan-schema.ts`
- `packages/core/src/goal/planner/goal-plan-normalizer.ts`

输出仍然复用 `AgentPlan`，但 metadata 中标记：

```ts
metadata: {
  goalId,
  planKind: 'goal',
  successCriteria,
  verificationPolicy,
}
```

第一版可以先用 deterministic planner，不依赖 LLM：

- research/discovery step：用 `fs.search`、`fs.list`、`fs.read` 找上下文。
- implementation step：根据任务类型生成 `subagent` 或 `runner`。
- verification step：运行 typecheck/test/build 或结构化检查。
- synthesis step：汇总输出。

第二版再接入 LLM planner，要求输出 JSON schema，而不是自然语言计划。

### 5.4 新增 SubAgentExecutor

建议在 core executor 中增加可插拔执行器，而不是把逻辑塞进 `DefaultPlanExecutor`。

目标结构：

```ts
export interface StepExecutor {
  kind: AgentStepKind;
  execute(ctx: StepExecutionContext): AsyncIterable<AgentEvent>;
}
```

短期可直接在 `DefaultPlanExecutor` 增加 `subagent` 分支；中期再抽象。

`SubAgentExecutor` 负责：

- 根据 `capability` 找到 `CapabilityAgent`。
- 构建隔离上下文。
- 注入 allowed tools / owned paths / budget。
- 执行后校验 output schema。
- 输出 `subagent.started`、`subagent.completed`、`subagent.failed` 事件。

### 5.5 CapabilityAgent 注册表

新增：

```ts
export interface CapabilityAgent {
  name: string;
  description: string;
  accepts(task: SubAgentSpec): boolean;
  execute(task: SubAgentTask, context: SubAgentContext): Promise<SubAgentResult>;
}

export interface CapabilityAgentRegistry {
  register(agent: CapabilityAgent): void;
  get(name: string): CapabilityAgent | undefined;
  select(task: SubAgentSpec): CapabilityAgent;
  list(): CapabilityAgent[];
}
```

第一批内置 capability：

| Capability | 用途 | 默认工具 |
| --- | --- | --- |
| `research` | 代码/文档/依赖调研，只读输出事实 | `fs.list`, `fs.search`, `fs.read` |
| `coding` | 小范围代码修改 | `fs.read`, `fs.patch`, `fs.write`, `shell.exec` |
| `review` | 设计/代码审查，发现风险 | `fs.read`, `fs.search` |
| `verification` | 测试、构建、类型检查 | `shell.exec`, `fs.read` |
| `synthesis` | 汇总多个 step 输出 | 无或只读 |

## 6. Web-server 层改造

### 6.1 新增 GoalService

新增：

- `apps/web-server/src/services/goal-service.ts`
- `apps/web-server/src/routes/goals.ts`
- `apps/web-server/src/handlers/goal-handlers.ts`
- `apps/web-server/src/schemas/goal.ts`

职责：

- 创建 goal。
- 管理 goal 状态。
- 启动/暂停/恢复/取消 goal execution。
- 接收 core `AgentEvent` 并转换成 `GoalEvent`。
- 将 goal progress、checkpoint、outputs 写入 store。

### 6.2 Goal API

建议 API：

```text
POST   /api/goals
GET    /api/goals
GET    /api/goals/:goalId
GET    /api/goals/:goalId/events
POST   /api/goals/:goalId/actions/:action
GET    /api/goals/:goalId/plan
GET    /api/goals/:goalId/checkpoints
```

创建 body：

```ts
{
  sessionId?: string;
  projectId?: string;
  objective: string;
  successCriteria?: string[];
  constraints?: string[];
  modelId?: number;
  reasoningEffort?: 'low' | 'medium' | 'high';
  budget?: {
    maxTokens?: number;
    maxTimeMs?: number;
    maxSteps?: number;
    maxSubAgents?: number;
  };
  mode?: 'plan-only' | 'execute';
}
```

action：

```text
pause | resume | cancel | retry | approve | replan
```

### 6.3 Goal 事件

扩展 web-server contracts：

```ts
export type GoalEventType =
  | 'goal.created'
  | 'goal.planned'
  | 'goal.started'
  | 'goal.progress'
  | 'goal.blocked'
  | 'goal.completed'
  | 'goal.failed'
  | 'goal.cancelled'
  | 'goal.checkpoint'
  | 'goal.subagent.started'
  | 'goal.subagent.completed'
  | 'goal.verification';
```

SSE payload 中保留原始 `AgentEvent`：

```ts
{
  goalId,
  sequence,
  type,
  timestamp,
  payload: {
    agentEvent?: AgentEvent,
    progress?: number,
    checkpointId?: string,
    subagent?: { name, capability, stepId },
  }
}
```

### 6.4 持久化

`TaskService` 当前使用内存 Map，不适合 Goal。建议新增 TypeORM entities：

- `goal`
- `goal_event`
- `goal_checkpoint`
- `goal_plan_snapshot`

最小字段：

```text
goal:
  goal_id uuid pk
  owner_user_id varchar
  session_id uuid nullable
  project_id uuid nullable
  status varchar
  objective text
  success_criteria jsonb
  constraints jsonb
  budget jsonb
  progress integer
  active_plan_id varchar nullable
  latest_checkpoint_id varchar nullable
  outputs jsonb nullable
  error text nullable
  created_at timestamptz
  updated_at timestamptz

goal_event:
  event_id uuid pk
  goal_id uuid
  sequence integer
  type varchar
  payload jsonb
  created_at timestamptz
```

第一阶段可以复用内存 store 快速打通，但最终应落 PostgreSQL。

## 7. LLM Step 的位置

当前 core 的 `llm` step 只是 placeholder，真实 model adapter 在 `CoreRuntimeGateway`。Goal Engine 如果要真正自主规划和执行，必须处理这个边界。

推荐两阶段：

### 阶段 A：不移动 model adapter

在 web-server 新增 `LlmStepExecutorAdapter`，注入给 core：

```text
core PlanExecutor
  -> llm step
  -> calls injected LLM executor interface
  -> web-server implementation uses ModelAdapterService
```

core 只定义接口，不依赖 provider SDK：

```ts
export interface LlmStepExecutor {
  execute(input: LlmStepInput, context: ToolContext): Promise<unknown>;
}
```

### 阶段 B：抽象到 packages/model-adapters

让 `packages/core` 只依赖 `@agent-flow/model-adapters/types`，由 app 注入 adapter factory。这样 GoalPlanner、SubAgent、Verifier 都可使用统一 LLM 能力。

不要让 core 直接依赖 OpenAI/Anthropic SDK。

## 8. SubAgent 运行模型

### 8.1 不是独立聊天会话

subagent 不应该直接写入 `chat_message`，否则会污染用户对话。它的完整日志进入：

- `ReplayStore`
- `goal_event`
- `checkpoint`

只有主 agent 的 synthesis 结果写回 chat。

### 8.2 上下文隔离

subagent 输入：

```ts
{
  objective: string;
  constraints: string[];
  context: ContextFragment[];
  previousOutputs: Record<string, unknown>;
  allowedTools: string[];
  ownedPaths: string[];
  expectedOutputSchema: JsonSchema;
}
```

subagent 输出：

```ts
{
  summary: string;
  filesRead?: string[];
  filesChanged?: string[];
  commandsRun?: string[];
  findings?: string[];
  risks?: string[];
  verification?: {
    passed: boolean;
    evidence: string[];
  };
  nextActions?: string[];
}
```

### 8.3 并发与文件锁

当前 scheduler 会把同一批次 step 顺序执行，因为 `DefaultPlanExecutor.executePlanSteps()` 对 batch 内 steps 使用 `for ... of await`。如果要真正并行 subagent，需要改为：

```text
batch steps
  -> acquire ownership locks
  -> Promise.allSettled execute independent steps
  -> merge outputs by stepId
```

第一版建议仍顺序执行，先把语义跑通。第二版再加：

- `ownedPaths` 冲突检测。
- 只读 subagent 可并行。
- 写入 subagent 需要路径锁。
- 同一文件只能有一个 writer。

## 9. Goal 验证闭环

Goal Engine 的关键是 verification。

建议新增 `GoalVerifier`：

```ts
export interface GoalVerifier {
  verify(goal: GoalDefinition, result: AgentRunResult): Promise<GoalVerificationResult>;
}

export interface GoalVerificationResult {
  passed: boolean;
  progress: number;
  satisfiedCriteria: string[];
  missingCriteria: string[];
  evidence: string[];
  nextPlan?: AgentPlan;
}
```

验证来源：

- deterministic：`pnpm typecheck`、`pnpm test`、`go test`、schema validation。
- semantic：LLM 对照 success criteria 检查结果。
- artifact：检查文件是否存在、diff 是否符合 owned paths、API contract 是否更新。

失败处理：

```text
verification failed
  -> if budget remains: replan with missing criteria
  -> else: goal blocked/failed with evidence
```

## 10. UI 落地

### 10.1 最小 UI

在 `apps/web-ui` 先加 Goal 侧栏或页面：

- goal 列表：status、progress、updatedAt。
- goal detail：objective、success criteria、current plan、events。
- event timeline：subagent、tool、runner、checkpoint、verification。
- actions：pause/resume/cancel/retry。

可以先复用当前 task UI/接口风格，如果已有页面未完整实现，则新增轻量 Goal panel。

### 10.2 Chat 集成

在 `ChatPage` 增加：

- `/goal ...` 输入触发创建 goal。
- 长任务 action prompt：“作为后台目标执行”。
- assistant 返回 goal card：包含进度和跳转。

在 `SpecPage`：

- tasks 阶段确认后可以创建 implementation goal。
- Goal 完成后回写 spec task 状态。

## 11. 分阶段实施计划

### Phase 1：Goal 数据模型和 API 骨架

目标：让系统能创建、查询、订阅、控制 goal。

改动：

- 新增 `GoalRecord`、`GoalEvent` contracts。
- 新增 `GoalService`，先使用内存 store。
- 新增 `/api/goals` routes/handlers/schemas。
- 新增 SSE `GET /api/goals/:goalId/events`。
- Goal action 支持 pause/resume/cancel/retry。

验收：

- 前端或 curl 可创建 goal。
- goal events 能持续推送。
- pause/resume/cancel 状态正确。

### Phase 2：复用 core runtime 执行 Goal

目标：GoalService 能调用现有 `AgentRuntime.run()`。

改动：

- GoalService 将 `GoalDefinition` 转为 `AgentRunRequest`。
- `metadata` 写入 `goalId`、`sessionId`、`projectId`、budget。
- core `AgentEvent` 转为 `GoalEvent`。
- checkpoint 更新 goal progress。

验收：

- goal 能跑完整个 `CapabilityPlanner` 生成的 plan。
- tool/runner/checkpoint 事件可在 goal event stream 看到。
- 失败时 goal 状态和 error 正确。

### Phase 3：GoalPlanner 和 verification

目标：从“任务执行”升级为“目标推进”。

改动：

- 新增 `GoalPlanner`，输出包含 verify step 的 `AgentPlan`。
- 新增 `GoalVerifier`。
- `GoalService` 根据 verification 决定 completed / blocked / retry / replan。
- 增加 budget 检查。

验收：

- success criteria 未满足时不会误判完成。
- verification evidence 被写入 event。
- budget 用尽时 goal 进入 blocked 或 failed。

### Phase 4：SubAgent 类型与执行器

目标：支持 capability-based subagent step。

改动：

- 扩展 `AgentStepKind`：加入 `subagent`。
- 新增 `SubAgentSpec`、`CapabilityAgent`、`CapabilityAgentRegistry`。
- 新增 `SubAgentExecutor`。
- 内置 research/review/verification 三类只读 subagent。
- `DefaultPlanExecutor` 支持 subagent step。

验收：

- GoalPlanner 可生成 subagent step。
- subagent 输出结构化 JSON。
- subagent 事件、输出、checkpoint 可追踪。

### Phase 5：Coding subagent 和文件所有权

目标：让 subagent 能安全改代码。

改动：

- 新增 `ownedPaths` 和 path lock。
- coding subagent 只能写 owned paths。
- runner-backed `fs.patch` / `fs.write` 检查 metadata 中的 owned paths。
- verification step 检查 diff 范围。

验收：

- 两个 subagent 写同一文件时被阻止或顺序化。
- 越权写文件失败并产生可解释事件。
- coding goal 能修改文件并完成 typecheck/test。

### Phase 6：并发调度和 UI

目标：可视化和并发执行。

改动：

- scheduler batch 内支持并发执行只读/不冲突 steps。
- UI 展示 goal plan DAG、subagent timeline、verification evidence。
- ChatPage/SpecPage 支持创建 goal。

验收：

- 多个 research/review subagent 可并行。
- UI 能看到实时进度。
- 用户能暂停/恢复/取消。

## 12. 风险与约束

| 风险 | 说明 | 缓解 |
| --- | --- | --- |
| LLM step 仍是 placeholder | core 目前不能直接做真实推理 step | 先注入 `LlmStepExecutor`，由 web-server 实现 |
| TaskService 是内存态 | 进程重启会丢任务 | Goal 独立持久化到 PostgreSQL |
| subagent 上下文污染 | 子任务日志可能进入主对话 | subagent 日志只进 replay/goal_event，最终 synthesis 才进 chat |
| 并发写冲突 | 多 subagent 改同一文件 | 第一版顺序执行，后续加 ownedPaths lock |
| 无限 replan | goal 可能不断自我修正 | budget + maxReplans + explicit blocked state |
| 审批链路 | shell/fs write 可能需要用户审批 | 复用现有 `approval_req` 和 runner approval ticket |

## 13. 建议优先级

推荐先做“可观察的持久 Goal”，再做“智能 subagent”。

优先级：

1. `GoalService + /api/goals + events`
2. `GoalService -> AgentRuntime.run()` 打通
3. `GoalPlanner + GoalVerifier`
4. 只读 subagent：research/review/verification
5. 写入 subagent：coding + ownedPaths
6. 并发调度和前端 DAG 可视化

这样每一步都能复用现有架构并独立验收，不需要一次性重写 core runtime。

## 14. 最终形态

最终用户体验应是：

```text
用户提出目标
  -> 系统生成可检查计划
  -> 后台持续执行
  -> 子代理隔离处理调研、编码、审查、验证
  -> 每一步都有事件、checkpoint、证据
  -> 未满足成功标准时自动 replan
  -> 完成后把总结、改动、验证结果回写到 chat/spec
```

工程形态应是：

```text
web-ui:
  Goal UI + Chat/Spec integration

web-server:
  GoalService + persistent GoalStore + events API
  LlmStepExecutor implementation

packages/core:
  Goal types
  GoalPlanner
  SubAgentExecutor
  CapabilityAgentRegistry
  GoalVerifier contracts
  PlanExecutor extensions
```

这条路线和当前 `AGENT-CORE-FLOW.md` 保持一致：前端仍通过 API 进入 web-server，web-server 仍负责 session/model/memory/runner 编排，core 仍负责 context、plan、DAG、tool/runner、checkpoint/replay。Goal Engine 只是把“一轮 agent run”提升为“可持久推进和验证的目标生命周期”，SubAgent 则是这个生命周期里受控的能力执行单元。
