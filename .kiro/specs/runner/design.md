# Runner 设计

## 背景

E:\Project\my-project\agent-flow\AGENTS.md

1. apps\web-server\README.md 服务端
2. apps\web-ui\README.md 前端
3. pkg\runner 
4. protocol\README.md gRPC proto(web-server和runner共享)

## 1. 目标

本期目标有 4 个：

- 打通 `web-ui -> web-server <-> Runner`。
- Runner 启动后主动连接 `web-server`, websocket。
- Web UI 通过api获取在线runner，如果为0，需要引导安装和提供带token的启动命令，用户复制可直接启动。
- Local Runner 与用户身份强绑定，保证 `task.userId === runner.ownerUserId`。

系统拓扑如下：

```text
Web UI (Browser)
  └─ HTTP / SSE ───────────────► web-server (Fastify)

runnerd (Go)
  └─ gRPC Connect ────────► web-server RunnerService
```


设计原则：

- Runner 启动后主动向 `web-server` 注册，并通过心跳维持在线状态。
- Runner 的发现、绑定、调度、离线判定统一由 `web-server` 管理。
- owner 隔离是强约束，不允许跨用户看到或执行他人的 Runner。

---

## 2. web-server 与 Runner 通信方案

### 2.1 总体通信模型

Runner 与 `web-server` 之间使用 gRPC 双向流：

- `Runner -> web-server`：主动发起 `Connect(stream RunnerEnvelope)`
- `web-server -> Runner`：通过同一条 bidi stream 下发 `run_task / cancel_task / ping`
- `Runner -> web-server`：通过同一条 bidi stream 上报 `register / heartbeat / task_event / task_completed / task_failed`

Web UI 不直接访问 Runner，只通过：

- `Browser -> web-server`：HTTP / SSE， 用户发起query
- web-server 负责调度 runner, 比如 read/write file操作， runner 通过event同步给 web-server
- web-server -> web-ui: SSE

web-server 提供api
- `GET /api/runners`

只要 Runner 启动成功并完成注册，`web-server` 的在线状态中就会出现一条 `status=online` 的记录，Web UI 即可感知。

### 2.2 注册、重连与心跳

Runner 动作

1. 首次连接
2. 后续重连

Runner 使用一个长期 `runner_token` 完成接入与重连：

- 用户在 Web UI 点击“生成启动命令”
- `web-server` 为当前 `user_id` 生成或复用一个 `runner_token`
- Token 与当前 `user_id` 绑定，服务端只保存 token hash
- 同一用户的多个 Runner 可以使用同一个 `runner_token`
- Token 支持手动轮换与撤销；轮换后旧 token 不再可用，需要重新生成启动命令

Web UI 展示启动命令，例如：

```bash
./runner start \
  --rpc_host 127.0.0.1:9200 \
  --rpc_token <runner_token>
```

Runner 启动后：

- Runner 始终携带 `runner_token` 连接 `web-server`
- 若本地不存在 `runner_id`，则由 `web-server` 创建 Runner 记录并返回 `runner_id`
- 若本地已存在 `runner_id`，则使用 `runner_id + runner_token` 重连并接管旧连接

这样可以兼顾：

- 流程简单，Web UI 下发一次 token 即可启动多个 Runner
- 后续启动无需每次回到 Web UI 重新拿 Token
- owner 隔离仍由服务端根据 token 映射出的 `user_id` 保证

心跳机制：

- Runner 每 `10s` 上报一次 `heartbeat`
- `web-server` 超过 `30s` 未收到心跳，则将 Runner 标记为 `offline`
- 心跳恢复后，状态自动回到 `online`

### 2.3 Runner 注册与任务协议

`protocol/proto/runner.proto` 当前已支持：

- `Connect(stream RunnerEnvelope) returns (stream ServerEnvelope)`

建议保留并扩展以下字段：

- 注册字段
  - `runner_id`
  - `owner_userid`
  - `runner_token`
  - `kind`
  - `tags`
  - `capabilities`
  - `host`
  - `version`
- 任务字段
  - `task_id`
  - `session_id`
  - `step_id`
  - `user_id`

字段语义调整如下：

- `runner_token`
  - 由 `web-server` 为当前用户生成，Runner 首次连接和后续重连都使用同一个 token
  - 服务端只保存 token hash，校验通过后映射出 `ownerUserId`
  - 同一用户的多个 Runner 可以共用该 token
- `owner_userid`
  - 不信任客户端传值
  - 以服务端对 Token 的解码结果为准
- `runner_id`
  - 首次连接时可由服务端生成并返回
  - 重连时必须与本地持久化值一致

其中：

- `runner_token` 用于连接准入和重连校验
- `userid` 用于执行阶段的 owner 隔离校验

### 2.4 web-server 侧职责

- `RunnerService`
  - 接收 Runner gRPC `Connect`
  - 维护在线连接表与心跳状态
  - 向指定在线 Runner 下发任务
  - 将 Runner 事件转译为 core runner event
- `RunnerRegistrationService`
  - 创建或复用当前用户的 `runner_token`
  - 校验 `runner_token`
  - 创建 Runner 记录
  - 处理 Token 轮换与撤销
- `RunnerRegistry`
  - 管理 Runner 元数据
  - 管理 `lastSeenAt / status / ownerUserId / capabilities`
  - 为 Web UI 提供查询与过滤能力

Web API：

- Runner API
  - `GET /api/runners`
  - `GET /api/runners/events`
  - `POST /api/sessions/:sessionId/runner-binding`
- Runner Token 控制面
  - `POST /api/runners/token`
  - `POST /api/runners/token/rotate`
    


runner下载入口，建议改为更通用的二进制下载接口，例如：

- `GET /api/runners/downloads`

### 2.5 首次连接流程

1. Web UI 调 `POST /api/runners/token` 获取当前用户的 Runner 接入令牌。
2. `web-server` 返回：
   - `runnerToken`
   - `serverAddr`
   - `downloadUrls`
3. Web UI 展示下载链接和启动命令。
4. 用户手动下载 Runner 二进制并在终端执行命令。
5. Runner 启动后，携带 `rpc_host` `runner_token` 发起 gRPC `Connect.register`。
6. `web-server` 校验：
   - Token 是否存在
   - Token 是否有效且未撤销
   - Token 是否能映射到有效用户
7. 校验通过后，`web-server`：
   - 生成 `runnerId`
   - 创建 Runner 记录
   - 将 `ownerUserId` 绑定为 Token 对应用户
   - 返回心跳间隔等运行参数
8. Runner 将 `runnerId + runnerToken + serverHost` 持久化到本地配置目录。
9. Runner 开始周期性发送 `heartbeat`。
10. Web UI 通过 `/api/runners` 或 SSE 感知到该 Runner 变为 `online`。

### 2.6 重连流程

Runner 后续重启时继续使用同一个 `runner_token`：

1. Runner 从本地配置目录读取：
   - `runnerId`
   - `runnerToken`
   - `serverAddr`
2. Runner 使用 `runnerId + runnerToken` 发起 `Connect.register`。
3. `web-server` 校验 Runner 接入令牌：
   - Token 是否有效
   - Token 是否能映射到 `runner.ownerUserId`
   - `runner.ownerUserId` 是否仍有效
4. 校验成功后，Runner 恢复在线状态并继续发送心跳。

如果本地凭证丢失、被撤销或用户想重新绑定账号，则回退到“首次连接”流程。

### 2.7 注册准入与 owner 隔离

新的准入规则：

- 首次连接和重连都校验 `runner_token`
- `ownerUserId` 不接受客户端自报，必须由服务端凭证映射得出
- `runnerId` 跨用户冲突时拒绝注册
- 同用户同 `runnerId` 重连时允许接管旧连接

owner 隔离模型：

```ts
Runner {
  runnerId: string
  ownerUserId: string
  tokenId: string
  kind: "local" | "remote"
  status: "online" | "offline"
  lastSeenAt: string
}
```

隔离规则：

- 发现：`listRunners(userId)` 仅返回 `ownerUserId === userId`
- 绑定：session 只能绑定当前用户可见的 Runner
- 执行：`task.userId === runner.ownerUserId`
- 调度：只允许向当前用户自己的在线 Runner 下发任务

### 2.8 状态存储与故障恢复

建议将状态拆成两层：

- 在线连接态
  - 内存维护
  - 保存 stream、最近心跳、当前任务数
- 持久元数据
  - 数据库存储
  - 保存 `runnerId / ownerUserId / tokenId / host / version / capabilities / lastSeenAt / status`

建议实现：

- `runner_token`
  - 按用户持久化存储 token hash
  - 支持轮换和撤销
  - 轮换后旧 token 立即失效，使用旧 token 的 Runner 需要重新生成启动命令
- `lastSeenAt`
  - 每次心跳更新
  - 用于服务重启后恢复离线判定

故障恢复行为：

- `web-server` 重启后，Runner 会自动重连
- Runner 退出或用户关闭终端后，心跳超时，状态自动变为 `offline`
- 网络闪断时，Runner 应带指数退避进行自动重连



---

## 3. Web UI Runner 接入与引导

### 3.1 设计目标

- 当前用户是否有在线 Runner
- 如果没有，如何快速下载并启动 Runner
- Runner 上线后如何尽快刷新状态
- 当前会话如何自动绑定到可用 Runner, 默认local，可切换到remote

### 3.2 自动发现机制

自动发现改为监听云端状态：

- 轮询 `GET /api/runners`

判断逻辑：

- 存在 `ownerUserId === currentUser.id && status === "online"` 的 Runner
  - 判定为“已安装且在线”
- 存在 Runner 记录，但全部为 `offline`
  - 判定为“已安装但离线”
- 不存在任何 Runner
  - 判定为“未安装”

### 3.3 Runner 页安装引导

Runner 有独立的页面，包含：顶部的下载+使用说明，然后是runner列表页(感知启动状态)

状态机建议如下：

1. `NOT_INSTALLED`
   - 当前用户无任何 Runner 记录
2. `OFFLINE`
   - 存在 Runner，但全部离线
3. `CONNECTING`
   - 用户已生成启动命令，页面等待 Runner 首次上线
4. `ONLINE`
   - 至少有一个 Runner 在线

展示内容：

- 状态文案
  - `未检测到 Runner，请下载并运行以下命令`
  - `Runner 已注册，但当前离线`
  - `正在等待 Runner 连接...`
  - `Runner 在线，可用于当前会话`
- 操作按钮
  - `Download Runner`
  - `Generate Start Command`
  - `Refresh Status`
- 命令展示
  - `macOS / Linux`
  - `Windows PowerShell`
- Runner Token 提示
  - 例如：`该 token 只展示一次，轮换后旧 token 会立即失效`

命令示例：


```bash
# 本地开发
./runner start --rpc_host 127.0.0.1:9200 --rpc_token <runner_token>
```
```bash
# 正式环境rpc_host默认=aflow-grpc.8and1.cn
./runner start --rpc_token <runner_token>
```
```powershell
.\runner.exe start --rpc_host 127.0.0.1:9200 --rpc_token <runner_token>
```

### 3.4 Chat 页引导体验

Chat 页在 runner 在线数量=0 时：

- 提示文案“当前没有在线 Runner，请前往 Runner 页启动”

当 session 已绑定且 Runner 恢复 `online` 后：

- 发送能力自动恢复
- 无需手动刷新页面

### 3.5 自动绑定与状态刷新

点击 `Generate Start Command` 后：

1. Web UI 获取或创建 `runner_token`
2. 页面展示下载链接和命令
3. 用户在本机终端启动 Runner
4. Web UI 进入 `CONNECTING` 状态
5. Web UI 通过 SSE 或 `2s` 轮询刷新 `/api/runners`
6. 检测到新 Runner `online` 后：
   - 刷新 Runner 列表

---

## 4. Chat Query 到 Runner IO 调度

### 4.1 目标

用户在 Web UI 发起 query 后，Agent 内部需要能判断哪些操作必须交给 Runner 执行，例如：

- 读取工作区文件或目录
- 写入、修改、删除文件
- 执行 shell 命令
- 获取本地环境信息
- 运行测试、构建、格式化等项目命令

这些 IO 操作不能直接在 Browser 内完成，也不应该由 Web UI 直接访问 Runner。统一链路仍然是：

```text
web-ui
  -> POST /api/chat
  -> apps/web-server/src/routes/chat.ts
  -> chatService
  -> CoreRuntimeGateway
  -> packages/core AgentRuntime
  -> RunnerRouter
  -> 在线 Runner
```

### 4.2 web-server 入口

`apps/web-server/src/routes/chat.ts` 只负责注册 `/chat`：

```ts
app.post('/chat', { preHandler: requireJsonBody }, createChatHandler);
```

`createChatHandler` 根据请求模式分三类：

- `backgroundTask=true`：创建后台 task，不立即阻塞 HTTP 请求。
- `stream=true`：通过 SSE 返回 assistant message 和后续事件。
- 普通请求：等待本轮 Agent 执行完成后返回结果。

无论哪种模式，真正的 Agent 执行入口都是 `chatService.runTurn / streamTurn`，再进入 `CoreRuntimeGateway.streamChat`。

### 4.3 ChatService 到 CoreRuntimeGateway

`chatService` 负责会话层工作：

- 解析或创建 session
- 将用户消息写入 session history
- 记录短期 memory
- 将 `message / session / history / attachments / modelId / requestId` 交给 `RuntimeGateway`

`CoreRuntimeGateway` 负责把 Web Chat 输入转换成 `packages/core` 的 `AgentRunRequest`：

```ts
{
  goal,
  strategy: "plan",
  initialContext,
  runnerCommand,
  runnerArgs,
  metadata: {
    modelId,
    requestId,
    sessionId,
    reasoningEffort,
    attachmentCount
  }
}
```

当前实现里，`parseRunnerDirective()` 只识别 `/run ...`，并把它转换成 `runnerCommand / runnerArgs`。这适合作为调试入口，但正式的 IO 调度不应该依赖用户手写 `/run`。

目标行为是：Agent 根据 query 语义和可用工具能力，自动规划出 `runner` step。

### 4.4 Agent 内部规划

`packages/core` 已经有统一的 step 类型：

```ts
type AgentStepKind = "llm" | "tool" | "runner";
```

当 Agent 判断本轮需要本地 IO 时，Planner 应生成 `kind="runner"` 的步骤：

```ts
{
  id: "read_workspace",
  title: "read workspace files",
  kind: "runner",
  dependsOn: [],
  runner: {
    command: "fs.read",
    args: ["apps/web-server/src/routes/chat.ts"],
    preferredRunnerKind: "local",
    stream: true
  },
  input: {
    reason: "Inspect chat route before modifying runner dispatch design"
  }
}
```

Runner IO 不建议直接暴露任意 shell 字符串作为主要协议。推荐把常见 IO 收敛成语义化 command：

- `fs.read`
- `fs.write`
- `fs.patch`
- `fs.list`
- `fs.search`
- `shell.exec`

这样 `web-server` 和 Runner 都可以针对不同 command 做权限、路径、审计和 sandbox 控制。

### 4.5 Runner 选择与 owner 隔离

进入执行阶段后，`DefaultPlanExecutor` 会把 runner step 转换成 `RunnerTask`：

```ts
{
  taskId,
  sessionId,
  stepId,
  command,
  args,
  timeoutMs,
  env,
  input,
  stream,
  metadata
}
```

`RunnerRouter` 负责选择可用 Runner：

- 只选择 `canRun(task) === true` 的 Runner
- 如果指定 `preferredRunnerId`，只调度到该 Runner
- 如果指定 `preferredRunnerKind`，优先匹配 local / remote / sandbox
- 多个候选 Runner 之间按 round-robin 或 least-loaded 分配

web-server 接入真实 Runner 后，`canRun(task)` 必须同时校验：

- Runner 当前 `status === "online"`
- `runner.ownerUserId === task.userId`
- session 绑定的 runner 可见且属于当前用户
- Runner capability 支持当前 command，例如 `fs.read`、`fs.write`、`shell.exec`
- 工作目录和路径在允许范围内

调度阶段的硬约束仍然是：

```ts
task.userId === runner.ownerUserId
```

### 4.6 IO 执行协议

Web-server 下发给 Runner 的任务建议统一为 `run_task`：

```ts
RunTask {
  taskId: string
  sessionId: string
  stepId: string
  userId: string
  command: string
  args: string[]
  inputJson: bytes
  workingDir?: string
  timeoutMs?: number
  sandboxPolicy?: SandboxPolicy
}
```

Runner 执行后以事件流上报：

- `started`
- `stdout`
- `stderr`
- `progress`
- `result`
- `error`
- `completed`

`DefaultPlanExecutor` 将这些 Runner 事件包装成 core event：

```ts
{
  type: "runner.event",
  payload: {
    stepId,
    runnerEvent
  }
}
```

如果 Runner 返回 `result`，该结果会作为当前 step output，并写入 checkpoint。后续 LLM step 或最终 assistant response 可以读取该 output 继续推理。

### 4.7 SSE 返回给 Web UI

对于 `stream=true` 的 chat 请求，web-server 应把 runner 调度过程转成前端可消费的 SSE：

- `step.started`：展示正在分析或准备执行
- `runner.event.started`：展示 Runner 已接收任务
- `runner.event.stdout/stderr`：展示命令输出或文件读取摘要
- `runner.event.progress`：展示进度
- `runner.event.result`：展示结构化 IO 结果
- `step.completed`：展示该 IO step 完成
- `session.completed`：展示最终回答

Web UI 不直接拼接 Runner 输出作为最终回答，而是展示执行状态；最终自然语言回答由 Agent 基于 Runner output 生成。

### 4.8 权限与安全

Runner IO 调度必须在三个层面做限制：

1. Planner 限制
   - 默认优先生成语义化 command，不直接生成任意 shell
   - 对写文件、删除文件、执行命令等高风险操作标记为 `requiresApproval`

2. web-server 限制
   - 根据 `ownerUserId` 过滤 Runner
   - 根据 session binding 限制可调度 Runner
   - 根据 command 类型生成 `SandboxPolicy`
   - 对 `fs.write / fs.patch / shell.exec` 做审计记录

3. Runner 限制
   - 校验工作目录
   - 拒绝越权路径
   - 应用 command allowlist / blocklist
   - 按 `timeoutMs` 中断长时间任务
   - 对 stdout/stderr 做大小限制，避免大量输出拖垮 SSE

### 4.9 推荐落地顺序

1. 在 web-server 增加真实 `RemoteRunner`，实现 `packages/core` 的 `Runner` 接口。
2. `RemoteRunner.run()` 将 `RunnerTask` 转成 `run_task` 下发给在线 Runner。
3. RunnerRegistry 提供 `listRunnableRunners(userId, sessionId, command)`。
4. `CoreRuntimeGateway.buildAgentRequest()` 将 `userId / sessionId / preferredRunnerId` 写入 metadata。
5. Planner 从 `/run` 调试模式升级为根据 query 自动生成 runner IO step。
6. SSE 将 `runner.event` 透传为前端进度事件。
7. Web UI 在 Chat 页面展示 IO 执行状态和最终回答。
