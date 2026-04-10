# Agent Flow 架构设计（实施版）

- 文档版本：v2.0
- 更新日期：2026-04-08
- 文档目标：作为 `agent-flow` 的架构基线、研发拆解依据和上线验收标准

---

## 1. 文档范围与设计目标

### 1.1 范围

本文档覆盖以下内容：

1. 目标系统架构（Domain + Runtime + Deployment）
2. 核心执行语义（工作流、Agent、工具、模型网关）
3. 统一消息格式与跨模型 Context 延续
4. Context 压缩策略
5. 长任务中断恢复机制
6. 分阶段实施计划

### 1.2 业务目标

`agent-flow` 目标是构建一个可本地运行、可远程托管的 AI Agent 编排平台，支持：

1. 对话式任务执行（CLI / SDK / UI）
2. DAG + Loop 工作流编排
3. 多 Agent 团队协作
4. 统一模型接入（多厂商可替换，切换不影响上下文）
5. 长对话自动压缩
6. 长任务中断恢复（本地 + 远程）
7. 可远程后台执行任务，资产输出到云存储服务（S3）
8. 工具调用与安全审计

---

## 2. 分层架构总览

### 2.1 架构图

```text
┌─────────────────────────────────────────────────────────────────┐
│                          apps/                                   │
│       playground (Web UI)          console (管理后台)             │
├─────────────────────────────────────────────────────────────────┤
│                        packages/                                 │
│                                                                  │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐                        │
│  │   cli   │  │   sdk   │  │  server   │                        │
│  └────┬────┘  └────┬────┘  └─────┬─────┘                        │
│       │            │             │                                │
│  ┌────┴────────────┴─────────────┴───────────────────────────┐  │
│  │                        core                                │  │
│  │       Agent 主循环 · 工具执行 · 会话管理 · 权限控制          │  │
│  └──┬──────────┬───────────────┬───────────────┬─────────────┘  │
│     │          │               │               │                 │
│  ┌──┴───┐  ┌──┴────────────┐ ┌┴────────────┐ ┌┴─────────────┐  │
│  │model │  │context-store  │ │  context-   │ │  checkpoint  │  │
│  │gate- │  │(存储 + 管理)  │ │  compressor │ │  (断点恢复)  │  │
│  │way   │  └───────────────┘ └─────────────┘ └──────────────┘  │
│  └──┬───┘                                                        │
│     │                                                            │
│  ┌──┴───────────────────────────────────────────────────────┐   │
│  │                   model-adapters/                          │   │
│  │   ai-sdk (主力)  openai  anthropic  google  deepseek      │   │
│  └──┬────────────────────────────────────────────────────────┘   │
│     │                                                            │
│  ┌──┴───────────────────────────────────────────────────────┐   │
│  │                   model-contracts                          │   │
│  │      统一接口 · 消息格式 · 能力描述 · 零运行时依赖          │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 目录结构

```text
agent-flow/
├── packages/
│   ├── model-contracts/          # 纯类型包，零运行时依赖
│   │   └── src/
│   │       ├── index.ts
│   │       ├── message.ts        # UnifiedMessage 及相关类型
│   │       ├── model.ts          # ModelCapabilities, ModelInfo
│   │       ├── tool.ts           # ToolDefinition, ToolResult
│   │       ├── provider.ts       # ProviderAdapter 接口
│   │       └── errors.ts         # 统一错误类型
│   │
│   ├── model-adapters/
│   │   ├── ai-sdk/               # Vercel AI SDK 适配器（主力）
│   │   │   └── src/
│   │   │       ├── adapter.ts    # AiSdkAdapter implements ProviderAdapter
│   │   │       └── converter.ts  # UnifiedMessage <-> CoreMessage
│   │   ├── openai/               # 原生 OpenAI 适配（特殊场景）
│   │   ├── anthropic/            # 原生 Anthropic 适配（prompt caching 等）
│   │   ├── google/               # Gemini 适配
│   │   └── deepseek/             # DeepSeek 适配
│   │
│   ├── model-gateway/            # 模型网关
│   │   └── src/
│   │       ├── gateway.ts        # ModelGateway 类
│   │       ├── router.ts         # 路由策略（按模型名 / 按能力）
│   │       ├── fallback.ts       # fallback 链
│   │       └── rate-limit.ts     # 限流 / 配额管理
│   │
│   ├── context-store/            # 上下文存储与管理
│   │   └── src/
│   │       ├── store.ts          # ContextStore 类
│   │       ├── session.ts        # Session 生命周期管理
│   │       ├── serializer.ts     # JSONL 序列化 / 反序列化
│   │       └── memory-store.ts   # 内存存储实现
│   │
│   ├── context-compressor/       # 上下文压缩引擎
│   │   └── src/
│   │       ├── compressor.ts     # 压缩主逻辑
│   │       ├── auto-compact.ts   # 自动压缩触发器
│   │       ├── micro-compact.ts  # 工具结果微压缩
│   │       └── prompt.ts         # 摘要生成 prompt
│   │
│   ├── checkpoint/               # 检查点与恢复
│   │   └── src/
│   │       ├── checkpoint.ts     # Checkpoint 管理器
│   │       ├── local.ts          # 本地文件 checkpoint
│   │       ├── remote.ts         # 远程 WAL checkpoint
│   │       └── state-machine.ts  # 任务状态机
│   │
│   ├── core/                     # 核心运行时
│   │   └── src/
│   │       ├── agent.ts          # Agent 主循环
│   │       ├── query-engine.ts   # 查询引擎（消息编排 + 模型调用）
│   │       ├── tool-registry.ts  # 工具注册与执行
│   │       └── permission.ts     # 权限控制
│   │
│   ├── cli/                      # CLI 入口
│   ├── sdk/                      # 编程 SDK
│   └── server/                   # HTTP / WebSocket 服务
│
├── apps/
│   ├── playground/               # Web 交互界面
│   └── console/                  # 管理后台
│
└── tests/
    └── golden/                   # 黄金测试用例
```

### 2.3 包依赖关系

```text
cli / sdk / server
       ↓
      core
       ↓
  ┌────┼────────────┬──────────────┐
  ↓    ↓            ↓              ↓
model  context    context       checkpoint
gateway store    compressor
  ↓
model-adapters/*
  ↓
model-contracts
```

所有包通过 `model-contracts` 定义的接口通信，运行时无循环依赖。

---

## 3. 统一消息格式

### 3.1 设计原则

- 模型无关：内部消息格式不绑定任何厂商 API
- 无损转换：可双向转换到各厂商 API 格式
- 链式结构：uuid + parentUuid 形成消息链，支持分支和恢复
- 元数据丰富：携带 token usage、model info、timestamp 等

### 3.2 核心类型定义

```typescript
// packages/model-contracts/src/message.ts

/** 内容块类型 */
type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image'; source: ImageSource }
  | { type: 'tool-call'; toolCallId: string; toolName: string; input: unknown }
  | { type: 'tool-result'; toolCallId: string; toolName: string; output: unknown; isError?: boolean }
  | { type: 'file'; mimeType: string; data: string };

type ImageSource =
  | { type: 'base64'; mediaType: string; data: string }
  | { type: 'url'; url: string };

/** 消息角色 */
type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

/** 统一消息格式 */
interface UnifiedMessage {
  uuid: string;
  parentUuid: string | null;
  role: MessageRole;
  content: ContentPart[];
  timestamp: string;                    // ISO 8601
  metadata: MessageMetadata;
}

/** 消息元数据 */
interface MessageMetadata {
  /** 生成此消息的模型 */
  modelId?: string;
  /** 模型厂商 */
  provider?: string;
  /** token 用量 */
  tokenUsage?: TokenUsage;
  /** 是否为元消息（compact boundary 等） */
  isMeta?: boolean;
  /** 压缩边界信息 */
  compactBoundary?: CompactBoundaryInfo;
  /** 工具执行耗时 */
  toolDuration?: number;
  /** 自定义扩展字段 */
  extensions?: Record<string, unknown>;
}

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
}

interface CompactBoundaryInfo {
  trigger: 'auto' | 'manual' | 'model-switch';
  preCompactTokenCount: number;
  postCompactTokenCount: number;
  summarizedMessageCount: number;
  lastPreCompactMessageUuid: string;
}
```

### 3.3 序列化格式（JSONL）

每条消息序列化为一行 JSON，附加会话级字段：

```typescript
interface SerializedMessage extends UnifiedMessage {
  sessionId: string;
  cwd: string;
  version: string;
  gitBranch?: string;
}
```

存储路径：`~/.agent-flow/sessions/<project-hash>/<sessionId>.jsonl`

### 3.4 消息转换器接口

```typescript
// packages/model-contracts/src/provider.ts

/** 消息转换器 — 每个 adapter 实现 */
interface MessageConverter {
  /** 内部格式 → 厂商 API 格式 */
  toProviderMessages(messages: UnifiedMessage[]): unknown[];
  /** 厂商 API 响应 → 内部格式 */
  fromProviderResponse(response: unknown, parentUuid: string): UnifiedMessage;
}
```

---

## 4. 模型适配层（混合方案）

### 4.1 ProviderAdapter 接口

```typescript
// packages/model-contracts/src/provider.ts

interface ChatRequest {
  messages: UnifiedMessage[];
  system?: string;
  tools?: ToolDefinition[];
  toolChoice?: 'auto' | 'none' | 'required' | { type: 'tool'; toolName: string };
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
  abortSignal?: AbortSignal;
}

interface ChatResponse {
  message: UnifiedMessage;
  finishReason: 'stop' | 'length' | 'tool-calls' | 'error';
  usage: TokenUsage;
}

interface StreamChunk {
  type: 'text-delta' | 'tool-call-delta' | 'tool-call' | 'finish' | 'error';
  textDelta?: string;
  toolCallId?: string;
  toolName?: string;
  inputDelta?: string;
  finishReason?: ChatResponse['finishReason'];
  usage?: TokenUsage;
}

/** 模型适配器接口 — 所有 adapter 必须实现 */
interface ProviderAdapter {
  readonly providerId: string;

  chat(request: ChatRequest): Promise<ChatResponse>;
  streamChat(request: ChatRequest): AsyncIterable<StreamChunk>;
  countTokens(messages: UnifiedMessage[]): Promise<number>;

  /** 消息格式转换器 */
  readonly converter: MessageConverter;
}
```

### 4.2 模型能力描述

```typescript
// packages/model-contracts/src/model.ts

interface ModelCapabilities {
  maxInputTokens: number;
  maxOutputTokens: number;
  supportsVision: boolean;
  supportsToolCalling: boolean;
  supportsStreaming: boolean;
  supportsSystemMessage: boolean;
  supportsPromptCaching: boolean;
  supportedMediaTypes?: string[];
}

interface ModelInfo {
  modelId: string;
  displayName: string;
  provider: string;
  capabilities: ModelCapabilities;
}

/** 模型注册表 — 查询已注册模型的能力 */
interface ModelRegistry {
  register(model: ModelInfo): void;
  get(modelId: string): ModelInfo | undefined;
  getByProvider(provider: string): ModelInfo[];
  listAll(): ModelInfo[];
}
```

### 4.3 AI SDK 适配器（主力）

```typescript
// packages/model-adapters/ai-sdk/src/adapter.ts

import { generateText, streamText, type CoreMessage } from 'ai';
import type { ProviderAdapter, ChatRequest, ChatResponse, StreamChunk } from '@agent-flow/model-contracts';

class AiSdkAdapter implements ProviderAdapter {
  readonly providerId: string;
  readonly converter: AiSdkMessageConverter;

  constructor(
    private languageModel: LanguageModel,  // AI SDK 的模型实例
    providerId: string,
  ) {
    this.providerId = providerId;
    this.converter = new AiSdkMessageConverter();
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const result = await generateText({
      model: this.languageModel,
      messages: this.converter.toProviderMessages(request.messages) as CoreMessage[],
      system: request.system,
      tools: this.convertTools(request.tools),
      toolChoice: request.toolChoice,
      maxTokens: request.maxTokens,
      temperature: request.temperature,
      abortSignal: request.abortSignal,
    });
    return this.converter.fromGenerateResult(result, request.messages);
  }

  async *streamChat(request: ChatRequest): AsyncIterable<StreamChunk> {
    const result = streamText({
      model: this.languageModel,
      messages: this.converter.toProviderMessages(request.messages) as CoreMessage[],
      system: request.system,
      tools: this.convertTools(request.tools),
      toolChoice: request.toolChoice,
      maxTokens: request.maxTokens,
      temperature: request.temperature,
      abortSignal: request.abortSignal,
    });
    for await (const event of result.fullStream) {
      yield this.converter.fromStreamEvent(event);
    }
  }
}
```

### 4.4 模型网关

```typescript
// packages/model-gateway/src/gateway.ts

interface GatewayConfig {
  /** 默认模型 */
  defaultModel: string;
  /** 模型优先级链：运行时命令 > 启动参数 > 环境变量 > 配置文件 > 默认值 */
  modelOverrides?: ModelOverrideChain;
  /** fallback 配置 */
  fallback?: FallbackConfig;
  /** 限流配置 */
  rateLimit?: RateLimitConfig;
}

interface FallbackConfig {
  /** 按模型 ID 配置 fallback 链 */
  chains: Record<string, string[]>;
  /** 触发 fallback 的错误类型 */
  triggerOn: ('rate-limit' | 'server-error' | 'timeout' | 'model-unavailable')[];
  /** 最大重试次数 */
  maxRetries: number;
}

interface ModelOverrideChain {
  runtime?: string;     // 会话内 /model 命令
  cli?: string;         // --model 启动参数
  env?: string;         // AGENT_FLOW_MODEL 环境变量
  config?: string;      // 配置文件 settings.model
}

class ModelGateway {
  private adapters: Map<string, ProviderAdapter>;
  private registry: ModelRegistry;
  private config: GatewayConfig;

  /** 解析当前应使用的模型（按优先级链） */
  resolveModel(): ModelInfo { ... }

  /** 获取适配器（含 fallback 逻辑） */
  getAdapter(modelId?: string): ProviderAdapter { ... }

  /** 切换模型（运行时） */
  switchModel(modelId: string): void { ... }

  /** 注册新的适配器 */
  registerAdapter(providerId: string, adapter: ProviderAdapter): void { ... }
}
```

---

## 5. 跨模型 Context 延续

### 5.1 核心思路

内部始终使用 `UnifiedMessage` 存储对话历史，模型切换只需更换 adapter，无需转换历史消息。

```text
用户对话历史 (UnifiedMessage[])
       │
       ├── 使用 OpenAI 时 → OpenAI Adapter.converter.toProviderMessages() → OpenAI API
       │
       ├── 切换到 Claude 时 → Anthropic Adapter.converter.toProviderMessages() → Anthropic API
       │
       └── 切换到 Gemini 时 → Google Adapter.converter.toProviderMessages() → Google API
```

### 5.2 切换时的自动适配

```typescript
// packages/core/src/query-engine.ts

class QueryEngine {
  private contextStore: ContextStore;
  private gateway: ModelGateway;
  private compressor: ContextCompressor;

  /** 切换模型 */
  async switchModel(newModelId: string): Promise<void> {
    const oldModel = this.gateway.resolveModel();
    const newModel = this.gateway.registry.get(newModelId);

    // 1. 能力降级处理
    if (oldModel.capabilities.supportsVision && !newModel.capabilities.supportsVision) {
      this.contextStore.stripImageContent();  // 将图片转为文字描述
    }

    // 2. Token 限制适配
    const currentTokens = await this.contextStore.estimateTokenCount();
    if (currentTokens > newModel.capabilities.maxInputTokens * 0.7) {
      await this.compressor.compact(this.contextStore, {
        trigger: 'model-switch',
        targetTokens: newModel.capabilities.maxInputTokens * 0.5,
      });
    }

    // 3. 切换网关模型
    this.gateway.switchModel(newModelId);
  }
}
```

### 5.3 能力差异处理策略

| 场景 | 策略 |
|------|------|
| 目标模型不支持 vision | 图片内容转为 `[Image: <description>]` 文本占位 |
| 目标模型不支持 tool calling | 将 tool_call/tool_result 转为等效的 user/assistant 文本消息 |
| 目标模型不支持 system message | 将 system 内容合并到第一条 user 消息前 |
| 目标模型 token 限制更小 | 触发 `model-switch` 类型的 compact |
| 目标模型支持 prompt caching | 在转换时自动添加 cache_control 标记 |

---

## 6. Context 压缩策略

### 6.1 压缩架构

```text
Agent 主循环每轮迭代
       │
       ├── 微压缩 (micro-compact)
       │   └── 检查旧 tool_result 内容 → 超过阈值则截断
       │
       └── 自动压缩 (auto-compact)
           └── 检查总 token 数 → 超过阈值则触发全量压缩
               │
               ├── fork 小模型生成结构化摘要
               ├── 插入 CompactBoundary 边界消息
               └── 后续 API 调用只发送边界之后的消息
```

### 6.2 自动压缩触发条件

```typescript
// packages/context-compressor/src/auto-compact.ts

interface AutoCompactConfig {
  /** 触发压缩的 token 占比阈值（相对于模型 maxInputTokens） */
  triggerRatio: number;          // 默认 0.7
  /** 压缩后的目标 token 占比 */
  targetRatio: number;           // 默认 0.5
  /** 最小消息数（少于此数不压缩） */
  minMessageCount: number;       // 默认 10
  /** 压缩失败时截断最旧消息的重试次数 */
  maxRetries: number;            // 默认 3
}

function shouldAutoCompact(
  messages: UnifiedMessage[],
  modelCapabilities: ModelCapabilities,
  config: AutoCompactConfig,
): boolean {
  const currentTokens = estimateTokenCount(messages);
  const maxTokens = modelCapabilities.maxInputTokens;
  return (
    currentTokens / maxTokens > config.triggerRatio &&
    messages.length >= config.minMessageCount
  );
}
```

### 6.3 压缩流程

```typescript
// packages/context-compressor/src/compressor.ts

interface CompactionResult {
  /** 压缩后的消息数组（boundary + summary + 保留的近期消息） */
  messages: UnifiedMessage[];
  /** 压缩统计 */
  stats: {
    originalMessageCount: number;
    originalTokenCount: number;
    compactedTokenCount: number;
    summarizedMessageCount: number;
  };
}

class ContextCompressor {
  constructor(
    private gateway: ModelGateway,
    private config: AutoCompactConfig,
  ) {}

  async compact(
    store: ContextStore,
    options?: { trigger?: CompactBoundaryInfo['trigger']; targetTokens?: number },
  ): Promise<CompactionResult> {
    const messages = store.getMessages();
    const boundary = store.getLastCompactBoundary();
    const messagesToCompact = boundary
      ? messages.slice(messages.indexOf(boundary) + 1)
      : messages;

    // 1. 去除图片内容（防止摘要请求超限）
    const textOnlyMessages = stripImagesFromMessages(messagesToCompact);

    // 2. fork 小模型生成摘要
    let summary: string;
    try {
      summary = await this.generateSummary(textOnlyMessages);
    } catch (e) {
      // 3. 摘要请求本身超限 → 截断最旧消息后重试
      summary = await this.retryWithTruncation(textOnlyMessages);
    }

    // 4. 构建压缩后的消息
    const boundaryMessage = createCompactBoundaryMessage(messagesToCompact, summary, options?.trigger);
    const summaryMessage = createSummaryMessage(summary, boundaryMessage.uuid);

    store.insertCompactBoundary(boundaryMessage, summaryMessage);

    return { messages: store.getMessages(), stats: { ... } };
  }
}
```

### 6.4 微压缩（工具结果裁剪）

```typescript
// packages/context-compressor/src/micro-compact.ts

interface MicroCompactConfig {
  /** 工具结果最大字符数 */
  maxToolResultChars: number;    // 默认 10000
  /** 保留头部字符数 */
  headChars: number;             // 默认 3000
  /** 保留尾部字符数 */
  tailChars: number;             // 默认 3000
  /** 只对 N 轮之前的工具结果生效 */
  staleAfterTurns: number;       // 默认 3
}

function microCompact(
  messages: UnifiedMessage[],
  currentTurn: number,
  config: MicroCompactConfig,
): UnifiedMessage[] {
  return messages.map(msg => {
    if (msg.role !== 'tool') return msg;
    if (currentTurn - getTurn(msg) < config.staleAfterTurns) return msg;

    return {
      ...msg,
      content: msg.content.map(part => {
        if (part.type !== 'tool-result') return part;
        const text = JSON.stringify(part.output);
        if (text.length <= config.maxToolResultChars) return part;
        // 保留头尾，中间截断
        const truncated = text.slice(0, config.headChars)
          + `\n\n... [${text.length - config.headChars - config.tailChars} chars truncated] ...\n\n`
          + text.slice(-config.tailChars);
        return { ...part, output: truncated };
      }),
    };
  });
}
```

### 6.5 摘要生成 Prompt

```typescript
// packages/context-compressor/src/prompt.ts

const COMPACT_SYSTEM_PROMPT = `Your task is to create a detailed summary of the conversation so far.
This summary will replace the conversation history, so it must preserve ALL information
needed to continue the work without losing context.

Output the following sections:

1. **Primary Request and Intent** — What the user is trying to accomplish
2. **Key Technical Decisions** — Architecture choices, libraries, patterns decided
3. **Files and Code** — Files modified/created, with key code snippets verbatim
4. **Current State** — What was just completed, what's in progress
5. **Pending Tasks** — What still needs to be done
6. **Important Context** — Constraints, preferences, gotchas discovered

Be thorough. Losing information here means losing it forever.`;
```

---

## 7. 长任务中断恢复

### 7.1 Checkpoint 数据结构

```typescript
// packages/checkpoint/src/checkpoint.ts

interface Checkpoint {
  /** 检查点 ID */
  checkpointId: string;
  /** 会话 ID */
  sessionId: string;
  /** 创建时间 */
  timestamp: string;
  /** 检查点版本（用于兼容性） */
  version: number;

  /** === 对话状态 === */
  /** 消息历史（或指向 JSONL 文件的引用） */
  messagesRef: string;           // JSONL 文件路径
  /** 最后一条消息的 UUID */
  lastMessageUuid: string;
  /** 当前使用的模型 */
  modelId: string;

  /** === 执行状态 === */
  /** 当前步骤索引（在工作流中的位置） */
  currentStepIndex: number;
  /** 工具执行状态 */
  toolExecutionState: ToolExecutionState;
  /** 累计 token 用量 */
  totalUsage: TokenUsage;

  /** === 运行时状态 === */
  /** 工作目录 */
  cwd: string;
  /** 文件操作历史 */
  fileHistory: FileHistoryEntry[];
  /** 待办事项 */
  todos: TodoItem[];
  /** 环境变量快照（仅保存 agent-flow 相关的） */
  envSnapshot: Record<string, string>;
}

interface ToolExecutionState {
  /** 当前正在执行的工具（null 表示无） */
  currentTool: { toolName: string; toolCallId: string; input: unknown } | null;
  /** 已完成但未发送给模型的工具结果 */
  pendingResults: UnifiedMessage[];
}

interface FileHistoryEntry {
  path: string;
  action: 'create' | 'edit' | 'delete';
  timestamp: string;
}
```

### 7.2 本地恢复流程

```text
正常执行流程：
  Agent 主循环
    ├── 每轮 tool 执行完成后 → 保存 checkpoint
    ├── 每次 compact 完成后 → 保存 checkpoint
    └── 用户主动暂停时 → 保存 checkpoint

恢复流程（--resume）：
  1. 列出可用的 session → 用户选择
  2. 加载 JSONL 文件 → 重建 UnifiedMessage[]
  3. 加载最新 checkpoint → 恢复运行时状态
  4. 恢复 QueryEngine 状态（modelId, totalUsage, fileHistory, todos）
  5. 检查 toolExecutionState：
     ├── currentTool != null → 有未完成的工具调用
     │   └── 重新执行该工具（幂等）或标记为失败
     └── pendingResults 非空 → 有未发送的结果
         └── 将 pendingResults 追加到消息历史
  6. 继续主循环
```

```typescript
// packages/checkpoint/src/local.ts

class LocalCheckpointManager {
  private basePath: string;  // ~/.agent-flow/checkpoints/<project-hash>/

  /** 保存检查点 */
  async save(checkpoint: Checkpoint): Promise<void> {
    const filePath = path.join(this.basePath, checkpoint.sessionId, `${checkpoint.checkpointId}.json`);
    // 原子写入：先写临时文件，再 rename
    await writeAtomic(filePath, JSON.stringify(checkpoint));
  }

  /** 加载最新检查点 */
  async loadLatest(sessionId: string): Promise<Checkpoint | null> {
    const dir = path.join(this.basePath, sessionId);
    const files = await readdir(dir);
    if (files.length === 0) return null;
    // 按时间戳排序，取最新
    const latest = files.sort().pop()!;
    return JSON.parse(await readFile(path.join(dir, latest), 'utf-8'));
  }

  /** 清理旧检查点（保留最近 N 个） */
  async prune(sessionId: string, keepCount: number = 5): Promise<void> { ... }
}
```

### 7.3 远程任务恢复

#### 7.3.1 任务状态机

```text
  ┌─────────┐    start     ┌─────────┐
  │ pending ├──────────────►│ running │
  └─────────┘               └────┬────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
              ┌──────────┐ ┌─────────┐ ┌──────────┐
              │  paused  │ │completed│ │  failed  │
              └────┬─────┘ └─────────┘ └────┬─────┘
                   │                        │
                   │  resume                │ retry
                   └────────►running◄───────┘
```

```typescript
// packages/checkpoint/src/state-machine.ts

type TaskStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed';

interface TaskState {
  taskId: string;
  sessionId: string;
  status: TaskStatus;
  /** 创建时间 */
  createdAt: string;
  /** 最后更新时间 */
  updatedAt: string;
  /** 最新 checkpoint ID */
  latestCheckpointId: string | null;
  /** 失败信息 */
  error?: { code: string; message: string; retryable: boolean };
  /** 重试次数 */
  retryCount: number;
  /** 最大重试次数 */
  maxRetries: number;
  /** 输出资产（S3 路径等） */
  outputs?: Record<string, string>;
}
```

#### 7.3.2 WAL（Write-Ahead Log）

远程任务使用 WAL 确保操作的持久性和幂等恢复：

```typescript
// packages/checkpoint/src/remote.ts

interface WALEntry {
  /** 单调递增序列号 */
  sequenceId: number;
  /** 操作类型 */
  operation: 'message' | 'tool-start' | 'tool-complete' | 'compact' | 'model-switch' | 'checkpoint';
  /** 操作数据 */
  payload: unknown;
  /** 时间戳 */
  timestamp: string;
  /** 是否已应用到主状态 */
  applied: boolean;
}

class RemoteCheckpointManager {
  /** WAL 存储（可接 SQLite / Redis / S3） */
  private wal: WALStore;

  /** 写入 WAL 条目 */
  async appendWAL(entry: Omit<WALEntry, 'sequenceId' | 'applied'>): Promise<number> { ... }

  /** 恢复：重放未应用的 WAL 条目 */
  async recover(taskId: string): Promise<TaskState> {
    const checkpoint = await this.loadLatestCheckpoint(taskId);
    const unapplied = await this.wal.getUnapplied(taskId, checkpoint?.sequenceId ?? 0);

    // 按序重放
    for (const entry of unapplied) {
      await this.applyWALEntry(entry);
      await this.wal.markApplied(entry.sequenceId);
    }

    return this.getTaskState(taskId);
  }
}
```

### 7.4 Checkpoint 保存时机

| 事件 | 保存内容 | 存储位置 |
|------|---------|---------|
| 每轮 tool 执行完成 | 完整 checkpoint | 本地文件 |
| auto-compact 完成 | 完整 checkpoint | 本地文件 |
| 模型切换 | 完整 checkpoint | 本地文件 |
| 用户主动暂停 (Ctrl+C) | 完整 checkpoint | 本地文件 |
| 远程任务每步操作 | WAL entry | WAL 存储 |
| 远程任务每 N 步 | 完整 checkpoint | 远程存储 |

---

## 8. 分阶段实施计划

### Phase 1：最小可用（MVP）

目标：能跑通 CLI 对话，支持 OpenAI + Anthropic 切换，上下文延续。

| 包 | 内容 | 优先级 |
|----|------|--------|
| `model-contracts` | UnifiedMessage, ProviderAdapter, ModelCapabilities 类型定义 | P0 |
| `model-adapters/ai-sdk` | AI SDK 适配器，支持 OpenAI + Anthropic | P0 |
| `context-store` | 内存存储 + JSONL 持久化 | P0 |
| `model-gateway` | 基础路由（无 fallback） | P0 |
| `core` | Agent 主循环 + 基础工具执行 | P0 |
| `cli` | 基础 CLI（chat + --model 切换） | P0 |

验收标准：
- `agent-flow chat --model gpt-4o "hello"` 正常对话
- `agent-flow chat --model claude-sonnet-4-20250514 "hello"` 正常对话
- 对话中途 `/model claude-sonnet-4-20250514` 切换模型，上下文延续

### Phase 2：压缩 + 本地恢复

目标：长对话自动压缩，进程崩溃后可恢复。

| 包 | 内容 | 优先级 |
|----|------|--------|
| `context-compressor` | auto-compact + micro-compact + 摘要生成 | P1 |
| `checkpoint` (local) | 本地 checkpoint 保存/加载/恢复 | P1 |
| `cli` 增强 | `--resume` 恢复会话 | P1 |

验收标准：
- 长对话自动触发压缩，压缩后对话质量不明显下降
- `Ctrl+C` 中断后 `agent-flow --resume` 恢复到中断点

### Phase 3：网关增强 + 更多模型

目标：fallback、限流、更多厂商支持。

| 包 | 内容 | 优先级 |
|----|------|--------|
| `model-gateway` 增强 | fallback 链 + 限流 + 模型优先级链 | P2 |
| `model-adapters/google` | Gemini 适配 | P2 |
| `model-adapters/deepseek` | DeepSeek 适配 | P2 |
| `model-adapters/anthropic` | 原生 Anthropic 适配（prompt caching） | P2 |

验收标准：
- 模型不可用时自动 fallback 到备选模型
- 支持 Gemini、DeepSeek 对话

### Phase 4：远程执行 + SDK + Server

目标：支持远程后台任务、编程 SDK、HTTP 服务。

| 包 | 内容 | 优先级 |
|----|------|--------|
| `checkpoint` (remote) | WAL + 远程 checkpoint + 任务状态机 | P3 |
| `server` | HTTP/WebSocket 服务 | P3 |
| `sdk` | 编程 SDK（TypeScript） | P3 |
| `apps/playground` | Web 交互界面 | P3 |

验收标准：
- 远程提交任务，服务重启后任务自动恢复
- SDK 可编程调用 agent-flow 能力
- Playground 可在浏览器中对话

---

## 9. 关键设计决策记录

| 决策 | 选择 | 理由 |
|------|------|------|
| 模型适配层 | AI SDK 混合方案 | AI SDK 覆盖主流厂商且 TS 原生；特殊场景（prompt caching）用原生 SDK 补充 |
| 消息格式 | 自定义 UnifiedMessage | 需要携带元数据（uuid 链、token usage、compact boundary），AI SDK CoreMessage 不够用 |
| 持久化格式 | JSONL | append-only 写入性能好，支持流式读取，与 Claude Code 方案一致 |
| 压缩策略 | 摘要式压缩 | 比滑动窗口保留更多语义信息，参考 Claude Code 验证过的方案 |
| 本地恢复 | checkpoint 文件 | 简单可靠，无需额外依赖 |
| 远程恢复 | WAL + 状态机 | 保证操作持久性和幂等恢复，工业级可靠性 |
| 包管理 | pnpm + turbo monorepo | 已有基础设施，workspace 协议管理内部依赖 |
