export type PlanStrategy = 'plan' | 'react' | 'tree';
export type AgentStepKind = 'llm' | 'tool' | 'runner';
export type RunnerKind = 'local' | 'remote' | 'sandbox';
export type RunnerSelectionStrategy = 'round-robin' | 'least-loaded';
export type AgentStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled' | 'paused';

export interface ContextFragmentInput {
  source: string;
  content: string;
  priority?: number;
  metadata?: Record<string, unknown>;
}

export interface ContextFragment {
  id: string;
  source: string;
  content: string;
  priority: number;
  metadata: Record<string, unknown>;
  tokenEstimate: number;
}

export interface ContextEnvelope {
  fragments: ContextFragment[];
  tokenBudget: number;
  tokenUsed: number;
  truncated: boolean;
}

export interface AgentRunRequest {
  taskId?: string;
  goal: string;
  strategy?: PlanStrategy;
  initialContext?: ContextFragmentInput[];
  metadata?: Record<string, unknown>;
  variables?: Record<string, string>;
  runnerCommand?: string;
  runnerArgs?: string[];
  plan?: AgentPlan;
}

export interface RunnerTaskSpec {
  command: string;
  args?: string[];
  preferredRunnerId?: string;
  preferredRunnerKind?: RunnerKind;
  timeoutMs?: number;
  stream?: boolean;
  env?: Record<string, string>;
  input?: Record<string, unknown>;
}

export interface AgentStep {
  id: string;
  title: string;
  kind: AgentStepKind;
  dependsOn: string[];
  input?: Record<string, unknown>;
  toolName?: string;
  runner?: RunnerTaskSpec;
}

export interface AgentPlan {
  id: string;
  strategy: PlanStrategy;
  steps: AgentStep[];
  metadata?: Record<string, unknown>;
}

export interface Planner {
  plan(request: AgentRunRequest, context: ContextEnvelope): Promise<AgentPlan>;
}

export interface TaskGraphNode {
  step: AgentStep;
  incoming: string[];
  outgoing: string[];
}

export interface TaskGraph {
  planId: string;
  nodes: Record<string, TaskGraphNode>;
  roots: string[];
}

export interface GraphBuilder {
  build(plan: AgentPlan): TaskGraph;
}

export interface Scheduler {
  schedule(graph: TaskGraph): AgentStep[][];
}

export interface RunnerTask {
  taskId: string;
  sessionId: string;
  stepId: string;
  command: string;
  args: string[];
  timeoutMs?: number;
  env?: Record<string, string>;
  stream: boolean;
  input?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface RunnerCapabilities {
  streaming: boolean;
  sandboxed: boolean;
}

export interface RunnerEventBase {
  type: string;
  timestamp: string;
  runnerId: string;
}

export interface RunnerStartedEvent extends RunnerEventBase {
  type: 'started';
  task: RunnerTask;
}

export interface RunnerStdoutEvent extends RunnerEventBase {
  type: 'stdout';
  chunk: string;
}

export interface RunnerStderrEvent extends RunnerEventBase {
  type: 'stderr';
  chunk: string;
}

export interface RunnerProgressEvent extends RunnerEventBase {
  type: 'progress';
  message: string;
  percent?: number;
}

export interface RunnerResultEvent extends RunnerEventBase {
  type: 'result';
  result: unknown;
}

export interface RunnerErrorEvent extends RunnerEventBase {
  type: 'error';
  error: string;
  retryable: boolean;
}

export interface RunnerCompletedEvent extends RunnerEventBase {
  type: 'completed';
  exitCode: number;
  durationMs: number;
}

export type RunnerEvent =
  | RunnerStartedEvent
  | RunnerStdoutEvent
  | RunnerStderrEvent
  | RunnerProgressEvent
  | RunnerResultEvent
  | RunnerErrorEvent
  | RunnerCompletedEvent;

export interface Runner {
  readonly id: string;
  readonly kind: RunnerKind;
  readonly capabilities: RunnerCapabilities;
  canRun(task: RunnerTask): boolean;
  run(task: RunnerTask, signal?: AbortSignal): AsyncIterable<RunnerEvent>;
}

export interface GuardrailBeforeContext {
  session: AgentSession;
  request: AgentRunRequest;
  step: AgentStep;
}

export interface GuardrailAfterContext extends GuardrailBeforeContext {
  output: unknown;
}

export interface GuardrailPolicy {
  readonly name: string;
  beforeStep?(ctx: GuardrailBeforeContext): Promise<void>;
  afterStep?(ctx: GuardrailAfterContext): Promise<void>;
}

export interface Guardrails {
  runBefore(ctx: GuardrailBeforeContext): Promise<void>;
  runAfter(ctx: GuardrailAfterContext): Promise<void>;
}

export interface JsonSchema {
  type?: 'object' | 'string' | 'number' | 'boolean' | 'array';
  required?: string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  description?: string;
}

export interface ToolSchema {
  name: string;
  description: string;
  input: JsonSchema;
  output?: JsonSchema;
}

export interface ToolContext {
  taskId: string;
  sessionId: string;
  stepId: string;
  signal?: AbortSignal;
  metadata?: Record<string, unknown>;
}

export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  schema: ToolSchema;
  execute(input: TInput, context: ToolContext): Promise<TOutput>;
}

export interface ToolRegistryLike {
  register<TInput, TOutput>(tool: ToolDefinition<TInput, TOutput>): void;
  get(name: string): ToolDefinition | undefined;
  list(): ToolDefinition[];
}

export interface ToolExecuteOptions {
  retries?: number;
  retryDelayMs?: number;
}

export interface ToolCall {
  name: string;
  input: unknown;
}

export interface ToolResult {
  name: string;
  ok: boolean;
  output?: unknown;
  error?: string;
}

export interface ToolExecutorLike {
  execute(call: ToolCall, context: ToolContext, options?: ToolExecuteOptions): Promise<ToolResult>;
}

export interface ContextLoader {
  load(request: AgentRunRequest): Promise<ContextFragment[]>;
}

export interface ContextSelector {
  select(fragments: ContextFragment[], request: AgentRunRequest): Promise<ContextFragment[]>;
}

export interface TokenWindowManager {
  apply(fragments: ContextFragment[], maxTokens: number): ContextEnvelope;
}

export interface ContextBuilderLike {
  build(request: AgentRunRequest): Promise<ContextEnvelope>;
}

export interface PromptLayer {
  id: string;
  content: string;
}

export interface PromptSystemLoader {
  load(layers: PromptLayer[]): Promise<string>;
}

export interface PromptVariableRenderer {
  render(template: string, variables: Record<string, string>): string;
}

export interface AgentSession {
  id: string;
  taskId: string;
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
  lastRequest?: AgentRunRequest;
}

export interface SessionStore {
  create(taskId: string, metadata?: Record<string, unknown>): Promise<AgentSession>;
  get(sessionId: string): Promise<AgentSession | undefined>;
  update(sessionId: string, patch: Partial<Omit<AgentSession, 'id' | 'taskId' | 'createdAt'>>): Promise<AgentSession>;
}

export interface CheckpointRecord {
  id: string;
  sessionId: string;
  stepId: string;
  createdAt: string;
  output: unknown;
  metadata: Record<string, unknown>;
}

export interface CheckpointStore {
  save(record: Omit<CheckpointRecord, 'id' | 'createdAt'>): Promise<CheckpointRecord>;
  list(sessionId: string): Promise<CheckpointRecord[]>;
  latest(sessionId: string): Promise<CheckpointRecord | undefined>;
}

export interface ReplayEventRecord {
  id: string;
  sessionId: string;
  cursor: number;
  event: AgentEvent;
  createdAt: string;
}

export interface ReplayStore {
  append(sessionId: string, event: AgentEvent): Promise<ReplayEventRecord>;
  list(sessionId: string, cursor?: number): Promise<ReplayEventRecord[]>;
}

export interface AgentEvent {
  id: string;
  taskId: string;
  sessionId: string;
  type:
    | 'session.started'
    | 'session.completed'
    | 'session.failed'
    | 'step.started'
    | 'step.completed'
    | 'step.failed'
    | 'tool.called'
    | 'tool.result'
    | 'runner.event'
    | 'checkpoint.created';
  timestamp: string;
  payload: Record<string, unknown>;
}

export interface AgentRunResult {
  taskId: string;
  sessionId: string;
  status: AgentStatus;
  outputs: Record<string, unknown>;
  checkpoints: CheckpointRecord[];
  events: AgentEvent[];
  error?: string;
}

export interface ExecutePlanOptions {
  onEvent?: (event: AgentEvent) => void | Promise<void>;
  signal?: AbortSignal;
}

export interface PlanExecutor {
  execute(
    plan: AgentPlan,
    request: AgentRunRequest,
    session: AgentSession,
    context: ContextEnvelope,
    options?: ExecutePlanOptions
  ): AsyncGenerator<AgentEvent, AgentRunResult>;
}

export interface AgentRunOptions {
  signal?: AbortSignal;
  onEvent?: (event: AgentEvent) => void | Promise<void>;
}

export interface AgentRuntime {
  run(request: AgentRunRequest, options?: AgentRunOptions): Promise<AgentRunResult>;
  resume(
    sessionId: string,
    requestOverride?: Partial<Omit<AgentRunRequest, 'goal'>>,
    options?: AgentRunOptions
  ): Promise<AgentRunResult>;
}

export interface CreateAgentOptions {
  planner?: Planner;
  graphBuilder?: GraphBuilder;
  scheduler?: Scheduler;
  executor?: PlanExecutor;
  guardrails?: Guardrails;
  contextBuilder?: ContextBuilderLike;
  toolRegistry?: ToolRegistryLike;
  toolExecutor?: ToolExecutorLike;
  promptLoader?: PromptSystemLoader;
  promptRenderer?: PromptVariableRenderer;
  sessionStore?: SessionStore;
  checkpointStore?: CheckpointStore;
  replayStore?: ReplayStore;
  runners?: Runner[];
  runnerSelection?: RunnerSelectionStrategy;
  maxContextTokens?: number;
}
