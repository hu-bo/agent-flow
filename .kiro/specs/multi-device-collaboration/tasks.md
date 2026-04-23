# 实施计划：多设备协作与包合并

## 概述

本实施计划将多设备协作与包合并特性拆分为 7 个阶段，按依赖关系排序。阶段 1（包合并）必须先完成，因为它重构了代码库结构；阶段 2（会话持久化）为多设备接入提供基础；阶段 3-6 逐步构建 Gateway 扩展、Bot 插件架构和飞书 Bot 实现；阶段 7 进行端到端集成验证。

Go 组件使用 Go 1.23 实现（Gateway 层），TypeScript 组件使用 TypeScript 5.8 strict mode 实现（Agent Runtime 层）。

## 任务

- [ ] 1. 包合并 — 核心包整合
  - [ ] 1.1 创建合并后的 Core Package 目录结构与子模块
    - 在 `packages/core/src/` 下创建 `messages/`、`gateway/`、`store/`、`compressor/`、`checkpoint/`、`sdk/` 子目录
    - 将 `packages/model-contracts/src/` 下所有文件（`message.ts`、`model.ts`、`tool.ts`、`provider.ts`、`errors.ts`、`index.ts`）复制到 `packages/core/src/messages/`
    - 将 `packages/model-gateway/src/` 下所有文件（`gateway.ts`、`router.ts`、`fallback.ts`、`rate-limit.ts`、`index.ts`）复制到 `packages/core/src/gateway/`
    - 将 `packages/context-store/src/` 下所有文件（`store.ts`、`session.ts`、`serializer.ts`、`memory-store.ts`、`index.ts`）复制到 `packages/core/src/store/`
    - 将 `packages/context-compressor/src/` 下所有文件（`compressor.ts`、`auto-compact.ts`、`micro-compact.ts`、`prompt.ts`、`index.ts`）复制到 `packages/core/src/compressor/`
    - 将 `packages/checkpoint/src/` 下所有文件（`checkpoint.ts`、`local.ts`、`remote.ts`、`state-machine.ts`、`index.ts`）复制到 `packages/core/src/checkpoint/`
    - 将 `packages/sdk/src/` 下所有文件（`index.ts`、`agent-flow.ts`）复制到 `packages/core/src/sdk/`
    - 更新每个子模块内部的 import 路径，将跨包引用改为相对路径引用
    - 为每个子目录创建 `index.ts` 入口文件，re-export 所有公开 API
    - _需求: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ] 1.2 配置 Core Package 的 subpath exports
    - 更新 `packages/core/package.json`，添加 `exports` 字段，配置 `.`、`./messages`、`./gateway`、`./store`、`./compressor`、`./checkpoint`、`./sdk` 子路径导出
    - 更新 `packages/core/tsconfig.json`，确保所有子目录被包含在编译范围内
    - 更新 `packages/core/src/index.ts` 主入口，re-export 所有子模块的公开 API
    - 合并所有被合并包的 `dependencies` 到 `packages/core/package.json`
    - _需求: 5.7_

  - [ ] 1.3 更新所有消费方的依赖和 import 路径
    - 更新 `apps/server/package.json`：移除对 `@agent-flow/model-contracts`、`@agent-flow/model-gateway`、`@agent-flow/context-store`、`@agent-flow/context-compressor`、`@agent-flow/checkpoint` 的依赖
    - 更新 `packages/cli/package.json`：同上
    - 更新 `packages/model-adapters/ai-sdk/package.json`：将 `@agent-flow/model-contracts` 依赖替换为 `@agent-flow/core`
    - 更新所有源码文件中的 import 路径，按迁移映射表替换（如 `@agent-flow/model-contracts` → `@agent-flow/core/messages`，`@agent-flow/model-gateway` → `@agent-flow/core/gateway` 等）
    - _需求: 10.2, 10.3_

  - [ ] 1.4 删除已合并的独立包目录
    - 删除 `packages/model-contracts/` 目录
    - 删除 `packages/model-gateway/` 目录
    - 删除 `packages/context-store/` 目录
    - 删除 `packages/context-compressor/` 目录
    - 删除 `packages/checkpoint/` 目录
    - 删除 `packages/sdk/` 目录
    - 更新根 `pnpm-workspace.yaml`（如需要）
    - 更新 `turbo.json` 中的任务依赖配置，移除已合并包的引用
    - _需求: 10.1, 10.4_


  - [ ]* 1.5 编写 Core Package subpath exports 单元测试
    - 验证每个子路径导出（`@agent-flow/core/messages`、`@agent-flow/core/gateway` 等）可正确 import
    - 验证旧 import 路径不再可用
    - _需求: 5.7, 5.8_

  - [ ]* 1.6 编写属性测试：subpath exports 解析一致性
    - **Property: subpath exports 解析一致性**
    - 对所有子路径导出，验证 import 解析到正确的模块文件
    - _需求: 5.7_

- [ ] 2. 包合并 — 原生模型适配器整合与清理
  - [ ] 2.1 创建 `packages/model-adapters-native` 合并包
    - 创建 `packages/model-adapters-native/` 目录结构，包含 `src/openai/`、`src/anthropic/`、`src/google/`、`src/deepseek/` 子目录
    - 将 `packages/model-adapters/openai/src/` 复制到 `packages/model-adapters-native/src/openai/`
    - 将 `packages/model-adapters/anthropic/src/` 复制到 `packages/model-adapters-native/src/anthropic/`
    - 将 `packages/model-adapters/google/src/` 复制到 `packages/model-adapters-native/src/google/`
    - 将 `packages/model-adapters/deepseek/src/` 复制到 `packages/model-adapters-native/src/deepseek/`
    - 配置 `package.json` 的 subpath exports（`./openai`、`./anthropic`、`./google`、`./deepseek`）
    - 更新内部 import 路径，将 `@agent-flow/model-contracts` 替换为 `@agent-flow/core/messages`
    - _需求: 6.1, 6.2_

  - [ ] 2.2 删除旧适配器目录和空存根
    - 删除 `packages/model-adapters/openai/`、`packages/model-adapters/anthropic/`、`packages/model-adapters/google/`、`packages/model-adapters/deepseek/` 目录
    - 删除 `packages/model-adapters/bedrock/` 和 `packages/model-adapters/gemini/` 空存根目录
    - 确认 `packages/model-adapters/ai-sdk/` 保持独立不变
    - _需求: 6.3, 6.4, 7.1_

  - [ ] 2.3 验证独立包保留与构建完整性
    - 确认 `@agent-flow/model-adapter-ai-sdk`、`@agent-flow/chat-ui`、`@agent-flow/cli` 保持独立
    - 确认 `apps/console`、`apps/api-gateway`、`apps/api-gateway-web` 保持独立
    - 运行 `pnpm install` 更新依赖锁文件
    - 运行 `pnpm build` 验证全量构建无错误
    - 运行 `pnpm test` 验证所有测试通过
    - _需求: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 10.5, 10.6_

- [ ] 3. 检查点 — 确保包合并后构建和测试全部通过
  - 确保所有测试通过，如有问题请询问用户。

- [ ] 4. 会话持久化与跨设备同步
  - [ ] 4.1 实现 RemoteSessionManager 接口与 S3 + PostgreSQL 持久化
    - 在 `packages/core/src/store/` 下创建 `remote-session-manager.ts`
    - 定义 `SessionMetadata` 接口（sessionId、userId、title、modelId、messageCount、tokenUsage、storageRef、compactBoundaryUuid 等字段）
    - 实现 `RemoteSessionManager` 类，包含 `create`、`load`、`appendMessages`、`updateMetadata`、`listByUser`、`delete` 方法
    - `appendMessages` 写入 S3 JSONL 文件（append-only）并更新 PostgreSQL 元数据
    - `load` 从 PostgreSQL 读取元数据，从 S3 加载消息历史
    - 实现 S3 不可用时回退到本地 JSONL 文件存储的逻辑
    - _需求: 9.1, 9.2, 9.3, 9.5_

  - [ ] 4.2 添加 PostgreSQL 会话相关数据库表
    - 在 `apps/api-gateway` 中创建 SQL 迁移文件，添加 `sessions`、`device_connections`、`bot_user_mappings`、`bot_plugin_configs`、`sync_cursors` 表
    - 使用 sqlc 生成对应的 Go 查询代码
    - 添加必要的索引（`idx_sessions_user_id`、`idx_sessions_updated_at`、`idx_device_connections_session`）
    - _需求: 9.1_

  - [ ] 4.3 扩展 Agent Runtime HTTP API 路由
    - 在 `apps/server/src/http/` 下添加会话管理路由：`POST /api/sessions`、`GET /api/sessions`、`GET /api/sessions/:id`、`DELETE /api/sessions/:id`
    - 添加对话路由：`POST /api/sessions/:id/chat`（SSE 流式响应）、`GET /api/sessions/:id/messages`
    - 路由处理器从请求 Header 中读取 `X-User-ID`、`X-Device-ID`、`X-Session-ID`、`X-Request-ID`、`X-Source`
    - 集成 `RemoteSessionManager` 进行会话的创建、加载、消息追加
    - _需求: 9.1, 9.2, 9.3_

  - [ ] 4.4 实现压缩结果同步持久化
    - 在 `RemoteSessionManager` 中添加压缩后持久化逻辑：将压缩后的消息历史写入 S3 的 `{session_id}.compact.jsonl`
    - 更新 PostgreSQL 中的 `compact_boundary_uuid` 字段
    - 确保任何设备加载的都是最新压缩状态
    - _需求: 9.4_


  - [ ]* 4.5 编写属性测试：会话持久化往返一致性 (Property 1)
    - **Property 1: 会话持久化往返一致性**
    - **验证: 需求 1.2, 9.1, 9.2**
    - 使用 `fast-check` 生成随机 `UnifiedMessage` 序列
    - 验证 `appendMessages` → `load` 后消息内容相同、顺序一致

  - [ ]* 4.6 编写属性测试：压缩后持久化一致性 (Property 11)
    - **Property 11: 压缩后持久化一致性**
    - **验证: 需求 9.4**
    - 使用 `fast-check` 生成随机消息序列，触发压缩后持久化再加载
    - 验证加载状态包含压缩边界标记，边界之后的消息与压缩前近期消息一致

  - [ ]* 4.7 编写属性测试：断线重连同步准确性 (Property 3)
    - **Property 3: 断线重连同步准确性**
    - **验证: 需求 1.5**
    - 使用 `fast-check` 生成随机消息历史和随机同步游标位置
    - 验证增量同步返回恰好是游标之后的所有消息，不多不少，顺序一致

  - [ ]* 4.8 编写 RemoteSessionManager 单元测试
    - 测试会话创建、加载、追加消息的基本流程
    - 测试 S3 不可用时的本地回退逻辑
    - 测试 JSONL 格式损坏时的容错处理（逐行解析，跳过损坏行）
    - _需求: 9.1, 9.2, 9.5_

- [ ] 5. 检查点 — 确保会话持久化功能测试通过
  - 确保所有测试通过，如有问题请询问用户。

- [ ] 6. Go Gateway 扩展 — WebSocket Hub 与协议转换
  - [ ] 6.1 实现 WebSocket Hub 连接管理
    - 在 `apps/api-gateway/internal/ws/` 下创建 `hub.go` 和 `client.go`
    - 实现 `Hub` 结构体：按 session ID 分组的连接集合、注册/注销通道、主循环
    - 实现 `Client` 结构体：连接 ID（nanoid）、UserID、SessionID、DeviceID、WebSocket 连接、出站消息缓冲
    - 实现 `Hub.Run()`、`Hub.BroadcastToSession()`、`Hub.SendToClient()`、`Hub.GetSessionClients()`、`Hub.Subscribe()`、`Hub.Unsubscribe()` 方法
    - 实现心跳检测（PingInterval=30s、PongTimeout=10s）和异常断开处理
    - _需求: 1.3, 1.4, 2.2_

  - [ ] 6.2 实现 WebSocket 端点与认证
    - 在 `apps/api-gateway/internal/handler/` 下创建 `ws.go`
    - 添加 WebSocket 升级端点 `GET /v1/ws`，复用现有 `Auth` 中间件进行 API Key 认证
    - 实现 `ReadPump`（读取客户端消息）和 `WritePump`（发送消息到客户端）
    - 支持 `WSMessage` 协议：`subscribe`、`unsubscribe`、`chat`、`history`、`ping` 消息类型
    - 在 `apps/api-gateway/internal/router/router.go` 中注册 WebSocket 路由
    - _需求: 2.2, 2.6_

  - [ ] 6.3 实现统一请求格式与协议转换层
    - 在 `apps/api-gateway/internal/model/` 下创建 `request.go`，定义 `UnifiedChatRequest` 结构体
    - 在 `apps/api-gateway/internal/converter/` 下创建 `converter.go`
    - 实现 WebSocket 消息 → `UnifiedChatRequest` 的转换逻辑
    - 实现 Bot Webhook 载荷 → `UnifiedChatRequest` 的转换逻辑（预留接口）
    - 转换后的请求通过 HTTP 反向代理转发给 Agent Runtime，注入 `X-User-ID`、`X-Device-ID`、`X-Session-ID`、`X-Request-ID`、`X-Source` Header
    - _需求: 2.4, 8.3_

  - [ ] 6.4 实现 SSE 透传与多协议响应分发
    - 扩展现有 `proxy.LLMProxy`，支持将 Agent Runtime 的 SSE 流式响应透传到客户端
    - 实现响应分发逻辑：根据请求来源（HTTP/WS/Bot）选择对应的推送方式
    - HTTP 客户端：直接 SSE 透传
    - WebSocket 客户端：将 SSE 事件转换为 WS frame 并通过 Hub 广播到会话所有设备
    - Bot 客户端：收集完整响应后通过 Bot Plugin 发送
    - _需求: 2.5, 8.4_


  - [ ]* 6.5 编写属性测试：WebSocket Hub 广播完整性 (Property 2)
    - **Property 2: WebSocket Hub 广播完整性**
    - **验证: 需求 1.4**
    - 使用 `gopter` 生成随机客户端集合和随机消息
    - 验证广播时该会话所有客户端（除发送者外）收到消息，其他会话客户端不收到

  - [ ]* 6.6 编写属性测试：协议转换有效性 (Property 4)
    - **Property 4: 协议转换有效性**
    - **验证: 需求 2.4**
    - 使用 `gopter` 生成随机 WebSocket 消息和 Bot Webhook 载荷
    - 验证转换后的 `UnifiedChatRequest` 包含所有必填字段且内容不丢失

  - [ ]* 6.7 编写 WebSocket 认证与连接管理单元测试
    - 测试有效 API Key 连接成功
    - 测试无效 Key 被拒绝
    - 测试过期 Key 被拒绝
    - 测试 SSE 透传不缓冲完整响应，逐事件转发
    - _需求: 2.2, 2.6_

- [ ] 7. 检查点 — 确保 Gateway 扩展功能测试通过
  - 确保所有测试通过，如有问题请询问用户。

- [ ] 8. Bot 插件架构
  - [ ] 8.1 定义 BotPlugin 接口与基础类型
    - 在 `apps/api-gateway/internal/bot/` 下创建 `plugin.go`
    - 定义 `BotPlugin` 接口：`PluginID()`、`VerifyWebhook()`、`ParseMessage()`、`SendReply()`、`SendTypingIndicator()`、`UpdateMessage()`、`Configure()`
    - 定义 `BotIncomingMessage` 结构体（PlatformUserID、ChatID、ChatType、MessageID、MessageType、TextContent、RichContent、Attachments、Metadata）
    - 定义 `BotOutgoingMessage` 结构体（ChatID、MessageType、TextContent、RichContent、CardContent、ReplyToID）
    - 定义 `BotAttachment` 结构体（FileName、MimeType、URL、Size）
    - _需求: 3.1, 3.3_

  - [ ] 8.2 实现 PluginRegistry 插件注册中心
    - 在 `apps/api-gateway/internal/bot/` 下创建 `registry.go`
    - 实现 `PluginRegistry` 结构体：plugins map、enabled map、读写锁
    - 实现 `Register()`、`Get()`、`Enable()`、`Disable()`、`IsEnabled()`、`List()` 方法
    - 注册插件时自动创建对应的 Webhook 端点路径映射
    - _需求: 3.2, 3.6_

  - [ ] 8.3 实现 Bot Webhook Handler 与路由注册
    - 在 `apps/api-gateway/internal/handler/` 下创建 `bot.go`
    - 实现 `BotHandler` 结构体，包含 `PluginRegistry`、`BotUserMapper`、`AgentClient`、`Hub` 引用
    - 实现 `HandleWebhook()`：路由 `POST /v1/bot/:plugin/webhook`，验证签名、解析消息、转换为 `UnifiedChatRequest`、转发给 Runtime
    - 实现 `HandlePluginList()`：路由 `GET /v1/bot/plugins`
    - 实现 `HandlePluginToggle()`：路由 `PUT /v1/bot/plugins/:plugin/toggle`
    - 禁用的插件 Webhook 端点返回 503 状态码
    - 在 `router.go` 中注册 Bot 相关路由
    - _需求: 3.2, 3.6_

  - [ ] 8.4 实现 Bot 消息发送重试机制
    - 在 `apps/api-gateway/internal/bot/` 下创建 `retry.go`
    - 实现 `RetryConfig` 结构体（MaxRetries=3、InitialDelay=1s、MaxDelay=30s、BackoffFactor=2.0）
    - 实现 `SendWithRetry()` 函数，按指数退避策略重试，最多 3 次
    - 记录每次重试的失败日志
    - _需求: 3.5_

  - [ ] 8.5 实现 BotUserMapper 平台用户映射服务
    - 在 `apps/api-gateway/internal/service/` 下创建 `bot_user_mapper.go`
    - 实现平台用户 ID → agent-flow 用户 ID 的映射查询（查 `bot_user_mappings` 表）
    - 支持自动创建映射（首次使用时）
    - 支持获取用户的默认会话 ID
    - _需求: 1.1_


  - [ ]* 8.6 编写属性测试：插件注册端点创建 (Property 5)
    - **Property 5: 插件注册端点创建**
    - **验证: 需求 3.2**
    - 使用 `gopter` 生成随机插件 ID
    - 验证注册后对应 Webhook 端点可达（非 404），插件 ID 与端点路径一一对应

  - [ ]* 8.7 编写属性测试：Webhook 签名验证正确性 (Property 7)
    - **Property 7: Webhook 签名验证正确性**
    - **验证: 需求 3.4**
    - 使用 `gopter` 生成随机载荷和密钥
    - 验证正确密钥计算的签名通过验证，不同签名验证失败

  - [ ]* 8.8 编写属性测试：消息发送重试约束 (Property 8)
    - **Property 8: 消息发送重试约束**
    - **验证: 需求 3.5**
    - 使用 `gopter` 生成随机失败序列
    - 验证重试次数不超过 3 次，连续重试延迟遵循指数退避（每次 ≥ 前次 2 倍）

  - [ ]* 8.9 编写属性测试：插件启用/禁用状态一致性 (Property 9)
    - **Property 9: 插件启用/禁用状态一致性**
    - **验证: 需求 3.6**
    - 使用 `gopter` 生成随机启用/禁用操作序列
    - 验证 Webhook 端点 HTTP 状态码与当前启用状态一致（启用→正常处理，禁用→503）

  - [ ]* 8.10 编写属性测试：Bot 消息格式往返一致性 (Property 6)
    - **Property 6: Bot 消息格式往返一致性**
    - **验证: 需求 3.3**
    - 使用 `gopter` 生成随机 UnifiedMessage（含纯文本、Markdown、文件附件）
    - 验证转换为平台消息格式再转换回 UnifiedMessage 后，文本内容和附件元数据不变

- [ ] 9. 检查点 — 确保 Bot 插件架构测试通过
  - 确保所有测试通过，如有问题请询问用户。

- [ ] 10. 多设备会话统一接入
  - [ ] 10.1 实现 Gateway 层多设备消息路由
    - 扩展 Gateway 认证中间件，从 API Key 解析 UserID 后注入到请求上下文
    - 实现消息路由逻辑：根据 UserID + SessionID 将消息转发到对应的 Agent Runtime 会话
    - 支持 HTTP/SSE 和 WebSocket 两种传输协议的统一路由
    - _需求: 1.1, 1.3_

  - [ ] 10.2 实现多设备广播与断线重连同步
    - 在 WebSocket Hub 中实现多设备广播：Agent 回复时广播到同一会话的所有已连接设备
    - 实现 `sync_cursors` 表的读写逻辑，跟踪每个设备的消息同步位置
    - 实现断线重连后的增量同步：设备重连时根据 `sync_cursors` 返回断线期间的消息
    - 支持 `history` 消息类型，允许客户端请求指定范围的消息历史
    - _需求: 1.4, 1.5_

  - [ ] 10.3 实现设备连接生命周期管理
    - 实现设备连接记录：连接时写入 `device_connections` 表，断开时更新 `disconnected_at`
    - 实现设备活跃状态跟踪：定期更新 `last_active_at`
    - 实现会话切换：客户端通过 `subscribe` 消息切换到不同会话
    - _需求: 1.2, 1.5_

  - [ ]* 10.4 编写多设备同步单元测试
    - 测试设备 A 发消息后设备 B 收到广播
    - 测试设备 C 断线重连后收到增量同步
    - 测试会话切换后消息路由正确
    - _需求: 1.1, 1.4, 1.5_

- [ ] 11. 飞书 Bot 插件实现
  - [ ] 11.1 实现飞书 Bot Plugin 核心逻辑
    - 在 `apps/api-gateway/internal/bot/feishu/` 下创建 `plugin.go`
    - 实现 `FeishuPlugin` 结构体，实现 `BotPlugin` 接口
    - 实现 `Configure()`：接收飞书 App ID、App Secret、Verification Token、Encrypt Key 配置
    - 实现 `VerifyWebhook()`：使用飞书签名验证算法验证 Webhook 请求
    - 实现 `ParseMessage()`：解析飞书事件订阅消息（支持私聊和群聊 @Bot 消息），提取 platform_user_id、chat_id、chat_type、文本内容
    - _需求: 4.1, 4.2, 4.4_

  - [ ] 11.2 实现飞书消息发送与卡片格式化
    - 实现 `SendReply()`：将 `BotOutgoingMessage` 转换为飞书消息卡片（Interactive Card）格式并发送
    - 支持 Markdown 渲染、长文本折叠
    - 实现 `SendTypingIndicator()`：发送"处理中"临时消息
    - 实现 `UpdateMessage()`：任务完成后更新临时消息为最终结果
    - 集成 `SendWithRetry` 重试机制
    - _需求: 4.3, 4.5_

  - [ ] 11.3 注册飞书插件并配置路由
    - 在 Gateway 启动时将 `FeishuPlugin` 注册到 `PluginRegistry`
    - 从 `bot_plugin_configs` 表加载飞书插件配置（App ID、Secret 等）
    - 确保 `/v1/bot/feishu/webhook` 端点可达
    - _需求: 4.1_


  - [ ]* 11.4 编写属性测试：飞书消息解析完整性 (Property 10)
    - **Property 10: 飞书消息解析完整性**
    - **验证: 需求 4.2**
    - 使用 `gopter` 生成随机飞书事件订阅消息载荷（不同聊天类型、消息类型、内容长度）
    - 验证解析后的 `BotIncomingMessage` 包含正确的 platform_user_id、chat_id、chat_type，文本内容一致

  - [ ]* 11.5 编写飞书 Bot 单元测试
    - 使用飞书官方测试向量验证签名计算
    - 测试长任务时先发"处理中"临时消息，完成后更新为最终结果
    - 测试消息卡片格式化（Markdown 渲染、长文本折叠）
    - _需求: 4.3, 4.4, 4.5_

- [ ] 12. 检查点 — 确保飞书 Bot 插件测试通过
  - 确保所有测试通过，如有问题请询问用户。

- [ ] 13. 集成测试与端到端验证
  - [ ] 13.1 编写 Gateway ↔ Runtime 端到端集成测试
    - 测试 HTTP 客户端 → Gateway → Runtime → 响应 → 客户端 完整流程
    - 测试 WebSocket 客户端 → Gateway → Runtime → 广播 → 所有 WS 客户端 完整流程
    - 测试 Bot Webhook → Gateway → Runtime → Bot 回复 完整流程
    - _需求: 1.1, 2.4, 2.5, 8.3, 8.4_

  - [ ] 13.2 编写多设备同步集成测试
    - 测试设备 A 发消息 → 设备 B 收到广播 → 设备 C 断线重连收到同步
    - 测试跨设备会话上下文保持一致
    - _需求: 1.2, 1.4, 1.5_

  - [ ] 13.3 编写冒烟测试验证所有端点和导出
    - 验证 `/v1/ws` WebSocket 端点可连接
    - 验证 `/v1/bot/feishu/webhook` Bot 端点可达
    - 验证所有 subpath exports（`@agent-flow/core/messages`、`@agent-flow/core/gateway` 等）可正确 import
    - 验证已合并包的目录不存在（`packages/model-contracts` 等）
    - 验证空存根已删除（`bedrock`、`gemini`）
    - 验证独立包完整（ai-sdk adapter、chat-ui、cli、console）
    - _需求: 5.7, 6.3, 7.1, 7.2, 7.3, 10.4, 10.5_

- [ ] 14. 最终检查点 — 确保所有测试通过
  - 运行 `pnpm build` 全量构建无错误
  - 运行 `pnpm test` 所有测试无失败
  - 在 `apps/api-gateway` 中运行 `go test ./...` 所有 Go 测试通过
  - 确保所有测试通过，如有问题请询问用户。

## 备注

- 标记 `*` 的任务为可选任务，可跳过以加速 MVP 交付
- 每个任务引用了具体的需求编号，确保需求可追溯
- 检查点任务确保增量验证，及时发现问题
- 属性测试验证通用正确性属性（使用 `fast-check` 和 `gopter`），单元测试验证具体示例和边界条件
- Go 组件的属性测试使用 `gopter` 库，TypeScript 组件使用 `fast-check` 库
- 阶段 1-2（包合并）必须先完成，因为后续阶段依赖合并后的代码结构
