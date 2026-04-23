# 需求文档：多设备协作与包合并

## 简介

本需求文档定义 agent-flow 平台的多设备协作能力与 monorepo 包合并优化。目标是让用户能够从本地 PC（CLI / Playground Web UI）、手机（飞书 Bot 等 Webhook 消息平台）、云服务器（远程执行）三种设备无缝接入同一 Agent 会话，同时通过可扩展的 Bot 插件架构支持未来接入钉钉、Telegram 等平台。此外，将当前过度拆分且紧耦合的小包合并为更合理的结构，降低维护成本。

## 术语表

- **Gateway**：Go 语言实现的 API 网关层（`apps/api-gateway`），负责认证、路由、限流、协议转换
- **Agent_Runtime**：Node.js 实现的 Agent 核心运行时（`packages/core` 及相关包），负责会话管理、模型调用、工具执行、上下文压缩
- **Bot_Plugin**：Webhook Bot 插件，将外部消息平台（飞书、钉钉、Telegram 等）的消息协议转换为 Gateway 统一协议
- **Plugin_Registry**：Bot 插件注册中心，管理插件的生命周期（注册、发现、启用/禁用）
- **Session**：一次完整的 Agent 对话会话，包含消息历史、上下文状态、检查点
- **UnifiedMessage**：agent-flow 内部的模型无关消息格式，定义于 `model-contracts`
- **Device_Token**：标识用户设备的令牌，用于将消息路由到正确的会话
- **Core_Package**：合并后的核心包（`packages/core`），包含原 `model-contracts`、`model-gateway`、`context-store`、`context-compressor`、`checkpoint`、`sdk` 的功能
- **Model_Adapters_Native**：合并后的原生模型适配器包，包含 OpenAI、Anthropic、Google、DeepSeek 适配器
- **WebSocket_Hub**：Gateway 中的 WebSocket 连接管理器，负责多设备连接的维护与消息广播
- **SSE**：Server-Sent Events，单向服务端推送协议，当前 server 使用的流式传输方式

## 需求

### 需求 1：多设备会话统一接入

**用户故事：** 作为用户，我希望从本地 PC、手机飞书 Bot、云服务器等多种设备接入同一个 Agent 会话，以便在不同场景下无缝继续工作。

#### 验收标准

1. WHEN 用户从任意设备发送消息, THE Gateway SHALL 通过用户身份（API Key）将消息路由到对应的 Agent_Runtime 会话
2. WHEN 用户在设备 A 发送消息并获得回复后切换到设备 B, THE Agent_Runtime SHALL 保持完整的会话上下文，设备 B 可继续对话
3. THE Gateway SHALL 支持 HTTP/SSE 和 WebSocket 两种传输协议，客户端可根据设备能力选择
4. WHEN 多个设备同时连接同一会话, THE WebSocket_Hub SHALL 将 Agent 回复广播到所有已连接的设备
5. IF 设备连接断开后重新连接, THEN THE Gateway SHALL 允许设备通过会话 ID 重新加入，并提供断线期间的消息历史

### 需求 2：Gateway 层扩展（Go）

**用户故事：** 作为平台运维人员，我希望 Gateway 层使用 Go 实现高性能的认证、路由和协议转换，以便支撑多设备并发连接。

#### 验收标准

1. THE Gateway SHALL 在现有 Go api-gateway 基础上扩展，复用已有的多租户认证、API Key 管理、限流、请求日志功能
2. THE Gateway SHALL 新增 WebSocket 端点（`/v1/ws`），支持双向实时通信
3. THE Gateway SHALL 新增 Bot Webhook 接收端点（`/v1/bot/:plugin/webhook`），接收外部消息平台的回调
4. WHEN Gateway 收到 WebSocket 消息或 Bot Webhook 回调, THE Gateway SHALL 将消息转换为统一的内部请求格式，转发给 Agent_Runtime
5. WHEN Agent_Runtime 返回流式响应, THE Gateway SHALL 根据客户端连接类型（WebSocket / SSE / HTTP）选择对应的推送方式
6. THE Gateway SHALL 对 WebSocket 连接实施与 HTTP 请求相同的认证和限流策略

### 需求 3：Bot 插件架构

**用户故事：** 作为平台开发者，我希望 Bot 接入层采用插件架构，以便快速接入飞书、钉钉、Telegram 等新的消息平台。

#### 验收标准

1. THE Plugin_Registry SHALL 定义标准的 Bot_Plugin 接口，包含：消息接收（Webhook 验证 + 解析）、消息发送（回复格式化 + 推送）、平台认证配置
2. WHEN 新的 Bot_Plugin 被注册到 Plugin_Registry, THE Gateway SHALL 自动为该插件创建对应的 Webhook 端点
3. THE Bot_Plugin 接口 SHALL 支持以下消息类型的双向转换：纯文本、富文本（Markdown）、文件附件
4. WHEN Bot_Plugin 收到平台 Webhook 回调, THE Bot_Plugin SHALL 验证请求签名的合法性后再处理消息
5. IF Bot_Plugin 向外部平台发送消息失败, THEN THE Bot_Plugin SHALL 记录失败日志并按指数退避策略重试，最多重试 3 次
6. THE Plugin_Registry SHALL 支持在运行时启用或禁用单个 Bot_Plugin，禁用期间该插件的 Webhook 端点返回 503 状态码

### 需求 4：飞书 Bot 插件（首个实现）

**用户故事：** 作为用户，我希望通过飞书 Bot 与 Agent 对话，以便在手机上随时使用 agent-flow。

#### 验收标准

1. THE Feishu_Bot_Plugin SHALL 实现 Bot_Plugin 接口，支持飞书开放平台的事件订阅（Event Subscription）机制
2. WHEN 飞书用户在群聊或私聊中 @Bot 发送消息, THE Feishu_Bot_Plugin SHALL 将飞书消息格式转换为 UnifiedMessage 并提交给 Agent_Runtime
3. WHEN Agent_Runtime 返回回复, THE Feishu_Bot_Plugin SHALL 将 UnifiedMessage 转换为飞书消息卡片格式并发送到对应的聊天
4. THE Feishu_Bot_Plugin SHALL 使用飞书 App ID 和 App Secret 进行 Webhook 签名验证
5. WHILE Agent_Runtime 正在处理长时间任务, THE Feishu_Bot_Plugin SHALL 先发送"处理中"的临时消息，任务完成后更新为最终结果

### 需求 5：包合并 — 核心包整合

**用户故事：** 作为开发者，我希望将紧耦合且从不独立使用的小包合并到 core 中，以便减少包间依赖复杂度和维护成本。

#### 验收标准

1. THE Core_Package SHALL 包含原 `model-contracts` 的所有类型定义（UnifiedMessage、ProviderAdapter、ModelCapabilities 等），并从 `@agent-flow/core` 重新导出
2. THE Core_Package SHALL 包含原 `model-gateway` 的 ModelGateway、ModelRouter、FallbackChain、RateLimiter 功能
3. THE Core_Package SHALL 包含原 `context-store` 的 ContextStore、SessionManager、序列化功能
4. THE Core_Package SHALL 包含原 `context-compressor` 的 ContextCompressor、自动压缩、微压缩功能
5. THE Core_Package SHALL 包含原 `checkpoint` 的 LocalCheckpointManager、RemoteCheckpointManager、状态机功能
6. THE Core_Package SHALL 包含原 `sdk` 的 AgentFlow 类及其公开 API
7. WHEN 合并完成后, THE Core_Package SHALL 通过子路径导出（subpath exports）保持 API 兼容，例如 `@agent-flow/core/messages`、`@agent-flow/core/gateway`、`@agent-flow/core/store`
8. THE Core_Package 的合并 SHALL 保证所有现有测试通过，功能行为不变

### 需求 6：包合并 — 原生模型适配器整合

**用户故事：** 作为开发者，我希望将分散的原生模型适配器合并为一个包，以便统一管理和减少样板代码。

#### 验收标准

1. THE Model_Adapters_Native 包 SHALL 将 `openai`、`anthropic`、`google`、`deepseek` 四个适配器合并为单一的 `@agent-flow/model-adapters-native` 包
2. THE Model_Adapters_Native 包 SHALL 通过子路径导出各适配器，例如 `@agent-flow/model-adapters-native/openai`、`@agent-flow/model-adapters-native/anthropic`
3. WHEN 合并完成后, THE 构建系统 SHALL 删除 `bedrock` 和 `gemini` 两个仅含 README 的空适配器存根目录
4. THE `@agent-flow/model-adapter-ai-sdk` 包 SHALL 保持独立，不参与合并
5. THE Model_Adapters_Native 包的合并 SHALL 保证所有现有测试通过，适配器行为不变

### 需求 7：包合并 — 独立包保留

**用户故事：** 作为开发者，我希望明确哪些包保持独立，以便在合并过程中不误操作。

#### 验收标准

1. THE `@agent-flow/model-adapter-ai-sdk` 包 SHALL 保持独立（主力适配器，有独立的依赖树）
2. THE `@agent-flow/chat-ui` 包 SHALL 保持独立（前端组件，有真实的跨项目复用价值）
3. THE `@agent-flow/cli` 包 SHALL 保持独立（入口点，独立的二进制分发）
4. THE `apps/console` 应用 SHALL 保持独立，不合并到 `apps/playground`
5. THE `apps/api-gateway` 应用 SHALL 保持独立（Go 语言，独立的技术栈）
6. THE `apps/api-gateway-web` 应用 SHALL 保持独立（API Gateway 管理前端）

### 需求 8：性能关键路径的语言分工

**用户故事：** 作为平台架构师，我希望性能关键路径使用 Go 实现，AI 逻辑路径使用 Node.js/TypeScript 实现，以便在性能和开发效率之间取得平衡。

#### 验收标准

1. THE Gateway SHALL 使用 Go 实现以下性能关键路径：多租户认证、API Key 验证、请求限流、WebSocket 连接管理、Bot Webhook 接收与签名验证、请求路由与负载均衡
2. THE Agent_Runtime SHALL 使用 Node.js/TypeScript 实现以下 AI 逻辑路径：Agent 主循环、模型调用（AI SDK）、工具执行、上下文管理与压缩、检查点与恢复
3. THE Gateway 与 Agent_Runtime 之间 SHALL 通过 HTTP（反向代理）进行通信，Gateway 将认证后的请求转发给 Agent_Runtime
4. WHEN Gateway 需要向 Agent_Runtime 转发流式请求, THE Gateway SHALL 支持 SSE 透传（streaming passthrough），不缓冲完整响应

### 需求 9：会话持久化与跨设备同步

**用户故事：** 作为用户，我希望会话状态在服务端持久化，以便从任何设备恢复之前的对话。

#### 验收标准

1. THE Agent_Runtime SHALL 将会话消息持久化到服务端存储（PostgreSQL 用于元数据，S3 用于消息历史 JSONL 文件）
2. WHEN 用户从新设备连接并指定会话 ID, THE Agent_Runtime SHALL 从持久化存储加载完整的会话上下文
3. THE Agent_Runtime SHALL 为每个会话维护一个唯一的 Session ID，该 ID 在所有设备间共享
4. WHEN 会话发生上下文压缩, THE Agent_Runtime SHALL 将压缩结果同步持久化，确保任何设备加载的都是最新状态
5. IF 持久化存储不可用, THEN THE Agent_Runtime SHALL 回退到本地文件存储（当前的 JSONL 模式），并在存储恢复后同步

### 需求 10：合并后的构建与依赖更新

**用户故事：** 作为开发者，我希望包合并后 monorepo 的构建配置和依赖关系正确更新，以便项目能正常构建和运行。

#### 验收标准

1. WHEN 包合并完成后, THE 构建系统 SHALL 更新 `turbo.json` 中的任务依赖配置，移除已合并包的引用
2. WHEN 包合并完成后, THE 构建系统 SHALL 更新所有消费方（`apps/server`、`apps/playground`、`packages/cli` 等）的 `package.json`，将对已合并包的依赖替换为对 `@agent-flow/core` 的依赖
3. WHEN 包合并完成后, THE 构建系统 SHALL 更新所有源码中的 import 路径，从 `@agent-flow/model-contracts` 等旧路径迁移到 `@agent-flow/core` 或其子路径
4. WHEN 包合并完成后, THE 构建系统 SHALL 删除已合并包的目录（`packages/model-contracts`、`packages/model-gateway`、`packages/context-store`、`packages/context-compressor`、`packages/checkpoint`、`packages/sdk`）
5. THE 合并后的项目 SHALL 通过 `pnpm build` 完整构建且无错误
6. THE 合并后的项目 SHALL 通过 `pnpm test` 所有测试且无失败
