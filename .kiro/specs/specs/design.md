Spec 三阶段方案
目标：mode=spec 会话按固定流程运行，确保“先澄清需求，再出设计，最后生成最细粒度任务清单”。

1) 流程定义
固定阶段：requirements -> design -> tasks
仅 mode=spec 启用该流程，mode=vibe 保持现有行为
阶段推进规则：
新建 Spec 会话：phase=requirements
requirements 输出后：awaitingConfirm=true
第一次确认：进入 design 并自动产出设计稿
design 输出后：awaitingConfirm=true
第二次确认：进入 tasks 并自动产出 Task Breakdown
tasks 阶段再次确认：幂等返回，不重复生成
2) 数据模型与状态字段
在会话内存态增加 Spec workflow 字段（v1 不做 DB migration）：

mode: 'vibe' | 'spec'
specWorkflow?:
phase: 'requirements' | 'design' | 'tasks'
awaitingConfirm: boolean
requirementsMsgId?: string
designMsgId?: string
taskListMsgId?: string
3) 后端接口与服务改造
新增接口：

GET /api/spec/:session_id/state
返回当前 phase/awaitingConfirm 和关联消息 ID
POST /api/spec/:session_id/confirm
推进到下一阶段并触发自动产出
非 Spec 会话返回 409
服务层改造：

新增 SpecWorkflowService（或并入 ChatService，推荐独立）
负责阶段状态迁移、确认逻辑、幂等处理
负责三阶段内容生成模板
createSession 支持 mode，默认 vibe
streamTurn/runTurn/retry 在 Spec 会话中读取并维护 specWorkflow 状态
4) 三阶段输出契约（Markdown）
requirements 阶段
参考结构：

# Requirements
## 背景
## 目标
## 需求
### 需求1
### 需求2
design 阶段
固定结构：

# Design
## Solution 1
## Solution 2
tasks 阶段（最终产物）
固定结构：

# Task Breakdown
## 必选任务 (Required Tasks)
## 可选任务 (Optional Tasks)

单 task 必须可在一个工作会话内闭环
不允许“后续再设计/再讨论”表述
跨模块跨责任边界必须拆分 task
5) 前端交互改造
仅 Spec 会话显示阶段条：Requirements -> Design -> Tasks
当 awaitingConfirm=true 显示 Confirm & Continue 按钮
点击按钮调用 POST /api/spec/:session_id/confirm
tasks 阶段显示“任务清单已就绪”状态与一键复制 Markdown
Vibe 会话不显示阶段条/确认按钮，不改现有聊天体验
6) 测试计划
后端：

Spec 会话初始为 requirements
两次确认后进入 tasks
tasks 再确认幂等
非 Spec 会话调用 confirm 返回 409
GET state 可正确恢复阶段状态
内容契约：

tasks 输出必须包含 Required/Optional 两个区块
每个 task 必填字段完整
触发禁词（再讨论/再设计）时判定不合格并重生成
前端：

Spec/Vibe 渲染分流正确
confirm 按钮有 loading+防重复提交
刷新后阶段与稿件可恢复展示
7) 实施顺序（建议）
后端类型与 session schema 扩展（mode + specWorkflow）
SpecWorkflowService + state/confirm API
Chat/Session 读写流程接入 Spec 状态机
前端阶段条与确认按钮
内容契约校验与回归测试
8) 默认假设
最终产物只需 Markdown
v1 以内存会话态实现
mode=spec 三阶段是强约束流程，不支持跳阶段

前端：E:\Project\my-project\agent-flow\apps\web-ui\README.md
后端：E:\Project\my-project\agent-flow\apps\web-server\README.md