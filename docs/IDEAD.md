
## 目标
长任务 LLM 编码框架

## 🧭 1. 任务编排与执行（核心）
- 支持多阶段任务规划（Plan / ReAct / Tree）
- 支持 Task Graph（DAG），非线性任务依赖与并发执行
- 支持 step-by-step 执行与动态重规划（replan）
- 支持多 Agent 协作（planner / executor / reviewer）

---

## 🧾 2. Prompt / 指令系统
- 支持 .md 文件作为 system prompt（项目级 / 任务级）
- 支持 prompt 模板化（variables / context injection）
- 支持多层 prompt 叠加（system / task / tool）

---

## ⚙️ 3. 执行系统（Runner）
- 支持本地执行（文件 / shell / git）
- 支持远程执行（agent / sandbox）
- 支持多 runner 调度（负载均衡 / failover）
- 支持流式执行输出（stdout / stderr / progress）
- 支持安全沙箱（仅限制rm 操作 + 白名单）

---

## 🔄 4. 任务控制与状态管理
- 支持后台任务执行（异步）
- 支持 checkpoint（步骤级快照）
- 支持断点续传（resume / replay）
- 支持任务控制（pause / resume / cancel / retry）
- 支持任务幂等与重试机制

---

## 📦 5. 上下文管理（Context System）
- 支持上下文构建（代码 / 文件 / 历史）
- 支持上下文选择（相关性检索）
- 支持 token window 管理（模型上下文窗口）
- 支持上下文生命周期（创建 / 扩展 / 过期 / 清理）

---

## ✂️ 6. 上下文压缩（Auto-Compact）
- 支持自动触发压缩（接近 token 上限）
- 支持多策略压缩：
  - 摘要压缩（summarization）
  - 差量压缩（diff）
  - 语义裁剪（embedding-based）
  - 重写压缩（rewrite）
- 支持压缩质量评估与回退机制

---

## 🧠 7. 记忆系统（Memory / RAG）
- 支持短期记忆（session 内上下文）
- 支持长期记忆（向量存储 / RAG）
- 支持 embedding 与索引管理
- 支持语义检索与上下文增强
- 支持记忆写入策略（何时写 / 写什么）

---

## 🔧 8. 工具系统（Tooling）
- 支持标准化 Tool 调用协议（ToolCall / ToolResult）
- 支持工具注册与动态扩展
- 支持内置工具（fs / git / http）
- 支持工具执行追踪（trace / log）
- 支持工具失败重试与回滚

---

## 🔗 9. 通信与执行协议（Protocol）
- core ⇄ runner 使用双向流协议（gRPC / WS）
- 支持任务流（TaskRequest / TaskEvent）
- 支持流式事件（log / progress / result）
- 支持任务取消 / 心跳 / 超时控制
- 支持跨语言（Node ⇄ Go）通信

---

## 📡 10. Streaming 全链路
- 支持 LLM → core → runner → UI 全链路流式输出
- 支持多事件类型：
  - token stream（LLM输出）
  - tool stream（工具执行）
  - runner stream（执行日志）
- 支持 backpressure 与流控


---

## 🔌 11. 插件与扩展系统（Plugin System）
- 支持工具插件（tools）
- 支持 memory 插件（不同向量库）
- 支持模型插件（多 LLM 接入）
- 支持 planner / executor 扩展
- 支持按需加载（lazy load）

---

## 📊 12. 可观测性与评估（Observability）
- 支持执行日志（structured log）
- 支持调用链追踪（tracing）
- 支持指标统计：
  - token 使用量
  - tool 调用次数
  - 成功率 / 失败率
- 支持调试模式（debug replay）

---

## ⚙️ 13. 配置系统（apps/console）
- 支持配置tools、model
- 支持限流 / 配额控制
- 后台系统设计详见：[`docs/CONSOLE-SYSTEM-DESIGN.md`](./CONSOLE-SYSTEM-DESIGN.md)

---

## 🧩 14. 架构目标
- 支持 CLI / Web / API 多入口统一能力
- 支持多 runner 横向扩展
- 支持模块化（packages 拆分）
- 支持低耦合（core 最小化）
- 支持未来演进（multi-agent / 自动化开发）


## 项目结构
agent-flow/
├── apps/                          # 🧩 应用层（入口）
│   ├── api-gateway/               # api中转服务，只负责中转(不用改动)
│   ├── api-gateway-web/           # api中转管理页面(不用改动)
│   ├── web-ui/                    # Next.js 前端（IDE/UI）
│   ├── web-server/                # BFF（Fastify）统一入口
│   ├── console/                   # 查看本应用相关数据的管理前端(不用改动)
│   └── cli/                       # CLI（类似 codex/claude code）
│
├── packages/
│   ├── core/                     # 🧠 最小运行时（对外唯一入口）
│   │   ├── orchestration/
│   │   │   ├── planner/           # 任务规划（Plan / ReAct / Tree）
│   │   │   ├── executor/          
│   │   │   ├── scheduler/
│   │   │   ├── graph/
│   │   │   └── guardrails/
│   │   │
│   │   ├── context/
│   │   │   ├── builder/
│   │   │   ├── loader/
│   │   │   ├── selector/
│   │   │   └── window/
│   │   │
│   │   ├── tools/                 # 仅抽象（无具体 fs/git 实现）
│   │   │   ├── registry/
│   │   │   ├── schema/
│   │   │   └── executor/
│   │   │
│   │   ├── prompt/
│   │   │   ├── system-loader/
│   │   │   └── variables/
│   │   │
│   │   ├── state/                 # checkpoint（建议保留）
│   │   │   ├── session/
│   │   │   ├── checkpoint/
│   │   │   └── replay/
│   │   │
│   │   ├── types/                 # 核心类型（强制所有包依赖它）
│   │   └── index.ts               # createAgent / run / resume
│   │
│   ├── memory/                   # 🧠 RAG（长短记忆、向量库等）
│   ├── compact/                  # ✂️ 压缩算法（摘要压缩、代码差量压缩、语义压缩）
│   ├── model-adapters/           # 🤖 模型接入(local、openai、anthropic、ai-sdk)
│   ├── tools-impl/               # 🔧 fs/git/http 等实现
│   ├── events/                   # 📡 logging/tracing
│   ├── storage/                  # 💾 Redis/qdrant 适配
│
├── pkg/                        # ⚙️ 执行层（Go，强隔离）
│   │   ├── runner/                 # checkpoint（建议保留）
│   │   │   ├── exec/               # 执行器，agent的手脚，可以为LLM做任何事情
│   │   │   ├── sandbox/            # 安全的执行exec
│   │   │   ├── docker/             # docker 执行 exec
│   │   │   └── runner.go           # 统一入口
│
├── protocol/                      # 📡 通信协议（强约束）
│   ├── proto/                     # gRPC定义
│   │   ├── runner.proto
│   ├── types/                     # TS类型（自动生成）
│
├── scripts/                       # 🛠️ 脚本（构建/部署/protocol 生成）
├── docker-compose.yaml           
├── docker-compose.dev.yaml        # 包含依赖的reids、qdrant、MinIO
├── docs/                          # 📚 文档（架构/协议/开发指南）
└── README.md

## 架构通信
[ Web UI ]
     ⇅ (SSE / WS)
[ core (Node) ]
     ⇅ (gRPC 双向流)
[ runner x N (Go) ]
