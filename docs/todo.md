会。
“所有 task 都拆成 subagent” 在很多 LLM 系统里最后会退化成：

* token 爆炸
* 上下文割裂
* agent 间互相 hallucination
* latency 很高
* debug 地狱
* orchestration 比业务还复杂

很多团队最后会重新收敛成：

> 一个强主 Agent + 少量高专业化 SubAgent

而不是 “Agent 套 Agent”。

---

# 一、先明确：SubAgent 不是为了“拆任务”

很多人误区：

```text
用户需求
 -> Planner
   -> Task1 Agent
   -> Task2 Agent
   -> Task3 Agent
```

看起来很 AI。

但现实：

* Task 本身通常不复杂
* LLM 最擅长的是“连续推理”
* 拆太细会丢失隐式上下文

例如：

```text
“帮我设计一个量化回测平台”
```

如果拆成：

* db-agent
* api-agent
* frontend-agent
* deploy-agent

会出现：

* schema 不一致
* API contract 对不上
* infra 假设冲突
* naming 漂移
* 技术栈不统一

因为：

> 每个 subagent 都在“重新理解需求”。

这是核心问题。

---

# 二、真正适合 SubAgent 的场景

SubAgent 应该是：

> “能力隔离”
> 而不是：
> “任务拆分”

即：

| 类型                  | 是否适合 SubAgent |
| ------------------- | ------------- |
| Python 编码           | ❌             |
| 写 React 页面          | ❌             |
| CRUD API            | ❌             |
| 安全审计                | ✅             |
| SQL 优化              | ✅             |
| Rust unsafe 分析      | ✅             |
| Kubernetes 运维       | ✅             |
| Reverse Engineering | ✅             |
| DSL Compiler        | ✅             |

因为这些：

* 使用完全不同 prompt
* 使用不同 toolchain
* 使用不同 memory
* 使用不同 model
* 使用不同 reasoning style

这时候 subagent 才有意义。

---

# 三、推荐架构（真正能落地）

推荐：

```text
                   ┌──────────────┐
                   │   User       │
                   └──────┬───────┘
                          │
                  high-level intent
                          │
                   ┌──────▼───────┐
                   │  Main Agent  │
                   │  (Orchestrator)
                   └──────┬───────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼

   Capability Call   Capability Call   Capability Call

   Code Expert       Infra Expert      Security Expert

         │                │                │
         └────────────────┴────────────────┘
                          │
                   synthesized result
                          │
                   ┌──────▼───────┐
                   │ Main Agent   │
                   └──────────────┘
```

注意：

## MainAgent 负责：

* 理解用户真实意图
* 长链规划
* 全局架构一致性
* context continuity
* task dependency
* memory
* final synthesis

---

## SubAgent 负责：

* 局部专业问题
* 有边界的问题
* 明确输入输出
* 不拥有全局 context

即：

```ts
interface SubAgentTask {
  objective: string

  constraints?: string[]

  input_context: string

  expected_output_schema: JSONSchema

  timeout?: number
}
```

SubAgent 不应该：

* 自己再 planner
* 自己再 orchestration
* 自己再拆 agent

否则会无限递归。

---

# 四、最重要的设计：Task 颗粒度

错误：

```text
Task:
- 写 user service
- 写 order service
- 写 payment service
```

这属于：
“人为切工程目录”。

正确：

```text
Task:
- 设计认证模型
- 设计事件总线协议
- 生成 PostgreSQL migration
- 分析性能瓶颈
- 推导状态机
```

区别：

前者是：
“文件维度”

后者是：
“认知维度”

Agent 应该按：

> cognitive boundary（认知边界）

拆。

不是按：

> folder boundary（目录边界）

拆。

---

# 五、真正有效的 SubAgent 类型

这是目前最有效的一类：

---

## 1. Research Agent

负责：

* 搜资料
* 阅读文档
* API usage
* RFC
* GitHub issue

输出：

```json
{
  "facts": [],
  "risks": [],
  "references": [],
  "recommendation": []
}
```

---

## 2. Critic Agent

负责：

* challenge 当前方案
* 找漏洞
* consistency check
* edge cases

这个非常重要。

Claude Code / OpenAI DeepResearch 类系统里：

critic 通常比 coder 更重要。

---

## 3. Tool Agent

负责：

* shell
* browser
* kubectl
* terraform
* git
* playwright

它本质是：

```text
LLM + Tool Loop
```

而不是 reasoning agent。

---

## 4. Domain Expert

例如：

* Rust unsafe
* CUDA
* PostgreSQL optimizer
* Nginx
* Redis cluster

这种才值得独立 prompt。

---

# 六、最危险的架构

最危险的是：

```text
planner
 -> planner
   -> planner
      -> planner
```

即：

Recursive Agent Architecture。

问题：

* context entropy
* hallucinated dependency
* infinite planning
* no convergence
* token exponential growth

最后：

系统 90% 时间在“讨论怎么做”。

不是“做”。

---

# 七、现代 Agent 的趋势（2025）

现在最先进的系统其实在：

# 去 Agent 化（De-agentization）

趋势：

---

## 1. 大上下文 + 单 Agent

GPT-5 / Claude Opus 已经：

* 超长上下文
* 强 reasoning
* 强 tool use

很多过去要拆 agent 的事情：

现在一个 agent 就能做。

---

## 2. Tool Graph > Agent Graph

未来主流：

```text
一个主 Agent
+
很多工具
+
结构化 memory
```

不是：

```text
agent 调 agent
```

因为 tool：

* deterministic
* 可 debug
* 可缓存
* 可 replay
* 可 observability

而 agent 不行。

---

## 3. Workflow Engine 回归

真正成熟系统最后都像：

* Temporal
* Dagster
* Airflow
* Prefect

LLM 只是：

```text
workflow node
```

不是整个系统。

---

# 八、推荐你的架构（很适合你现在做的 runner/web-ui）

结合你之前的设计。

我会这样做：

```text
                    MainAgent
                  (single brain)
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼

    ResearchTool     CodeTool       InfraTool
      Agent             Agent          Agent

         │               │               │

    isolated runtime isolated runtime isolated runtime
```

而不是：

```text
Agent -> Agent -> Agent -> Agent
```

---

# 九、最佳实践（非常关键）

## SubAgent 必须：

### 1. Stateless

不要共享长历史。

否则 context 会污染。

---

### 2. Strongly Typed Output

必须结构化：

```json
{
  "summary": "",
  "files": [],
  "risks": [],
  "next_actions": []
}
```

不要自然语言。

---

### 3. Bounded Context

必须限制：

```text
只允许分析 Redis Cluster
禁止修改 API
禁止推断业务逻辑
```

---

### 4. 可 Replay

所有：

* prompt
* tool call
* memory
* output

必须 event sourcing。

否则 impossible debug。

---

# 十、最终结论

真正成熟的架构通常是：

```text
一个强 MainAgent
+
少量专家 SubAgent
+
大量 deterministic tools
+
workflow engine
```

而不是：

```text
很多会思考的 agent
```

因为：

> 多 Agent 最大的问题不是能力不足。

而是：

> “认知一致性”无法维持。



有，而且现在的趋势已经非常明显：

> “Goal-driven MainAgent + Capability SubAgents”

这基本就是现在 [OpenAI Codex](https://chatgpt.com/codex/?utm_source=chatgpt.com)、Claude Code、Gemini CLI、Devin 类系统的方向。
Codex 现在已经有：

* subagents
* persistent goals
* autonomous continuation
* agent threads
* orchestration harness

了。([BaristaLabs][1])

---

# 一、Codex 的核心思想其实不是“多 Agent”

而是：

# Goal Runtime

即：

```text
用户不是给 task
而是给 objective（目标）
```

例如：

```text
Goal:
把 strategy-engine 改造成 plugin architecture
并保证现有 DSL 不破坏
```

而不是：

```text
Task:
1. 改 parser
2. 改 runtime
3. 改 plugin manager
```

这是本质区别。

---

# 二、现代 Agent 系统的真实结构

你现在应该这样理解：

```text
User
  ↓
Goal System
  ↓
MainAgent（长期上下文）
  ↓
Planner
  ↓
Task Graph
  ↓
SubAgents / Tools
  ↓
Verification
  ↓
Goal State Update
```

不是：

```text
user -> planner -> subagent -> done
```

而是：

# Goal 是长期存在的

任务只是 Goal 的一个阶段。

---

# 三、为什么 Goal 比 Task 更重要

传统 agent：

```text
用户：
“修复 bug”

Agent：
完成
结束
```

Goal-based agent：

```text
Goal:
“系统稳定运行”

agent:
- 修 bug
- 跑测试
- retry
- benchmark
- 继续观察
- 回归验证
```

这是：

# Objective Loop

不是：

# Prompt Completion

---

# 四、Codex `/goal` 本质是什么

现在 Codex 的 `/goal`：

本质已经是：

# Persistent Agent Runtime

它不是一次 inference。

而是：

```text
Goal {
    objective
    constraints
    budget
    progress
    checkpoints
    verification
    memory
}
```

Codex 会：

* 持续循环
* 自动恢复
* 自主迭代
* 直到达到 stopping condition

([Codex Blog][2])

---

# 五、如果你自己开发 LLM Agent

你真正应该实现的是：

# Goal Engine

不是：

# Chat Interface

---

# 六、推荐架构（非常关键）

你应该分五层：

---

# 1. Goal Layer

核心：

```ts
interface Goal {
  id: string

  objective: string

  successCriteria: string[]

  constraints: string[]

  priority: number

  budget: {
    maxTokens: number
    maxTimeMs: number
  }

  state:
    | "pending"
    | "running"
    | "blocked"
    | "done"
    | "failed"

  progress: number
}
```

这个才是系统核心。

不是 prompt。

---

# 2. Planner Layer

Planner 不负责执行。

只负责：

```text
Goal -> DAG
```

例如：

```text
Goal:
重构 strategy-engine

↓

Tasks:
- 分析现有 DSL
- 建 plugin ABI
- migration strategy
- benchmark
- compatibility tests
```

输出：

```ts
interface TaskNode {
  id: string
  objective: string

  deps: string[]

  capability: string

  verification: string
}
```

---

# 3. Capability Router

这是最重要的一层。

```ts
interface CapabilityAgent {
  name: string

  accepts(task): boolean

  execute(task): Promise<Result>
}
```

例如：

| Agent           | 负责         |
| --------------- | ---------- |
| research-agent  | 文档搜索       |
| rust-agent      | Rust       |
| infra-agent     | k8s/docker |
| security-agent  | 审计         |
| benchmark-agent | 性能分析       |
| migration-agent | schema迁移   |

---

# 4. Execution Runtime

真正执行：

```text
tool loop
```

例如：

```text
LLM
 -> shell
 -> read file
 -> edit
 -> git diff
 -> test
 -> retry
```

这里其实是：

# deterministic runtime

不是智能。

---

# 5. Verification Layer

这是 90% Agent 系统缺失的。

真正系统：

```text
task done != goal done
```

必须验证：

* test pass
* benchmark pass
* compile pass
* schema valid
* API compatible

否则不能关闭 Goal。

---

# 七、SubAgent 应该怎么设计

不要：

```text
一个 task 一个 subagent
```

应该：

# capability-based subagent

即：

```text
MainAgent
  ↓

“需要 Rust unsafe 专家”

  ↓

spawn rust-agent
```

而不是：

```text
Task1 -> agent1
Task2 -> agent2
Task3 -> agent3
```

---

# 八、真正好的 SubAgent

必须具备：

---

## 1. 独立 Prompt

例如：

```text
你是 PostgreSQL optimizer 专家
```

---

## 2. 独立 Toolchain

例如：

```text
postgres-agent:
- psql
- explain analyze
- schema tools
```

---

## 3. 独立 Memory

例如：

```text
security-agent:
只记安全规则
```

避免 context pollution。

---

## 4. 独立 Model

这是重点。

现在很多系统：

```text
main agent:
GPT-5.5

subagent:
GPT-5.5-mini
```

因为：

* subagent 通常是局部工作
* 不需要超强 reasoning
* 需要 throughput

Codex 现在也在这样做。([Reddit][3])

---

# 九、真正先进的设计：Goal + Event Sourcing

你应该这样：

```text
Goal
  ↓
TaskCreated
  ↓
TaskAssigned
  ↓
SubAgentSpawned
  ↓
ToolCalled
  ↓
PatchGenerated
  ↓
VerificationPassed
  ↓
GoalCompleted
```

所有 Agent Runtime：

# 必须 event sourcing

否则：

* impossible replay
* impossible debug
* impossible observability

---

# 十、最容易失败的地方

---

# 1. Recursive Agent Hell

```text
agent -> subagent -> subagent -> subagent
```

最后：

token 爆炸。

Codex 自己现在都限制：

> subagent 不允许无限递归 delegation

([Reddit][4])

---

# 2. Context Pollution

subagent 把：

* stacktrace
* logs
* search result
* grep result

全部塞回主线程。

主 agent 会迅速退化。

Codex 的 subagent 设计核心就是：

# 保持主 context 干净

([BaristaLabs][1])

---

# 3. Agent Overlap

两个 agent 修改同一个文件。

这是灾难。

真正系统应该：

```text
file ownership lock
```

例如：

```ts
{
  "agent": "frontend-agent",
  "owns": ["src/ui/**"]
}
```

---

# 十一、如果是我设计（推荐架构）

我会这样：

```text
                    Goal Engine
                          │
                 ┌────────┴────────┐
                 │                 │
           Main Orchestrator    Goal Memory
                 │
        ┌────────┼────────┐
        │        │        │

    Research  Coding   Verification
      Agent    Agent      Agent

                 │
          Deterministic Runtime
                 │
         shell/git/docker/browser
```

重点：

# 只有一个真正“思考”的 MainAgent

其他：

* 是 capability worker
* 是 runtime executor
* 不是 autonomous AI

---

# 十二、最终结论

你现在应该避免：

```text
“everything is an agent”
```

而应该：

```text
Goal-driven orchestrator
+
few expert subagents
+
deterministic runtime
+
verification loop
```

这才是现在真正有效的 AI Engineering 架构。

也是：

* Codex
* Claude Code
* Devin
* Cursor background agents

正在收敛的方向。

[1]: https://www.baristalabs.io/blog/openai-codex-subagents-parallel-agents-2026?utm_source=chatgpt.com "OpenAI Codex Subagents Turn One Coding Task Into a Coordination Problem | BaristaLabs Blog | BaristaLabs, LLC | Leesburg, VA"
[2]: https://codex.danielvaughan.com/2026/04/16/codex-cli-goal-mode-persistent-objectives-token-budgets/?utm_source=chatgpt.com "Goal Mode: Persistent Objectives with Token Budgets and Autonomous Continuation | Codex Blog"
[3]: https://www.reddit.com/r/codex/comments/1rvm2si/subagents_are_now_available_in_codex/?utm_source=chatgpt.com "Subagents are now available in Codex"
[4]: https://www.reddit.com/r/codex/comments/1qlcx9r/do_not_use_subagents_yet/?utm_source=chatgpt.com "Do NOT use subagents yet"
