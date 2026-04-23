你现在这套已经不是普通应用了，本质是一个 LLM 执行平台内核。结构设计的关键不是“全”，而是边界清晰 + 不过度细分 + 能支撑演进。

你提到的这些核心模块：

model-adapters
context-store
checkpoint
compact（上下文压缩）

👉 我帮你收敛成4个核心子系统 + 3个支撑层，然后给一个不过度拆分的 monorepo 结构。

一、先统一抽象（避免目录失控）
四大核心域（必须稳定）
1. orchestration   → 调度 / agent / plan
2. model           → LLM 适配层
3. context         → 上下文系统（含 compact）
4. state           → checkpoint / session
三个基础支撑域
5. runner          → 执行层（Go）
6. protocol        → 跨语言协议
7. infra           → 部署 / sandbox
二、收敛后的项目结构（不过度拆分）

👉 控制在7~9 个顶级目录，这是比较健康的规模

ai-system/
├── apps/
│   ├── web/                 # 前端（Next.js）
│   └── api/                 # BFF / 控制入口（Node）
│
├── core/                    # 🧠 核心（Node，重点）
│   ├── orchestration/       # Agent / Planner / Tool调度
│   ├── model/               # model-adapters（统一封装）
│   ├── context/             # context-store + retrieval
│   ├── state/               # checkpoint / session
│   └── compact/             # 上下文压缩（独立出来很关键）
│
├── runner/                  # ⚙️ 执行层（Go）
│   ├── local/               # 本地 runner
│   ├── remote/              # 远程 runner
│   └── sandbox/             # 容器执行
│
├── protocol/                # 📡 通信协议（强约束）
│   ├── proto/               # gRPC 定义
│   └── types/               # TS 类型（自动生成）
│
├── engine/                  # 🚀 高性能模块（Rust 可选）
│   ├── diff/                # 文件 diff / patch
│   └── sandbox/             # 安全执行（可选）
│
├── sdk/                     # 对外 SDK（可选）
│   ├── js/
│   ├── go/
│   └── python/
│
├── infra/                   # 部署 & 运行环境
│   ├── docker/
│   ├── k8s/
│   └── scripts/
│
└── README.md
三、核心模块职责（重点讲你提的4个）
1️⃣ model-adapters（core/model）

👉 不只是 SDK 封装，而是统一语义层

interface ModelAdapter {
  chat(req: ChatRequest): Promise<ChatResponse>

  stream(req): AsyncIterable<Token>

  // 关键：工具调用统一
  callTools?(tools, messages): Promise<ToolCall[]>

  // checkpoint 恢复
  resume?(state): void
}
子结构建议（不要再细分）
model/
├── adapters/        # openai / anthropic / 本地模型
├── router.ts        # 模型选择策略（成本 / latency）
└── types.ts
2️⃣ context-store（core/context）

👉 统一三类 context：

- 短期：对话上下文（messages）
- 长期：向量库（你已有 Qdrant）
- 环境：文件 / repo / runtime
结构
context/
├── manager.ts       # 统一入口（最重要）
├── retriever.ts     # 向量 / 关键词检索
├── providers/       # file / vector / memory
└── ranking.ts       # rerank（可选）

👉 核心接口：

getContext(query, opts): ContextChunk[]
3️⃣ checkpoint（core/state）

👉 不要拆太细，保持一个入口

state/
├── checkpoint.ts    # 核心逻辑
├── store.ts         # 持久化（redis / db / s3）
└── session.ts       # session 管理

👉 核心能力：

save()
load()
resume()
branch()（建议预留）
4️⃣ compact（core/compact）

👉 这是很多系统忽略但你必须做的模块

作用：

减少 token / 控制上下文窗口
结构
compact/
├── summarizer.ts    # LLM 压缩
├── truncator.ts     # 截断策略
├── memory.ts        # 长期记忆抽取
└── policy.ts        # 何时触发

👉 示例策略：

if (tokens > limit) {
  summarize(oldMessages)
}
四、模块之间的关系（非常关键）
            orchestration
          /      |      \
       model   context   state
                   |
                compact
                   |
                 runner

解释：

orchestration 是大脑
model 是“思考接口”
context 提供信息
compact 控制成本
state 提供恢复能力
runner 执行现实操作
五、最小闭环调用链（你可以直接实现）
User Input
   ↓
orchestration.plan()
   ↓
context.get()
   ↓
compact.process()
   ↓
model.chat()
   ↓
tool call?
   ↓
runner.exec()
   ↓
state.checkpoint()
   ↓
返回结果
六、避免过度设计的关键原则
1. 每个域只暴露一个入口

例如：

context.getContext()
state.saveCheckpoint()
model.chat()