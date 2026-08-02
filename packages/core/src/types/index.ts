export type PlanStrategy = 'plan' | 'react' | 'tree';
export type AgentStepKind = 'llm' | 'tool' | 'runner';
export type RunnerKind = 'local' | 'remote' | 'sandbox';
export type RunnerSelectionStrategy = 'round-robin' | 'least-loaded';
export type AgentStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'blocked' | 'cancelled' | 'paused';

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
  consumes?: Record<string, string>;
  toolName?: string;
  runner?: RunnerTaskSpec;
}

export interface CompletionAcceptance {
  verifierName: string;
  requireCompletionSignal?: boolean;
  requiredEvidence?: RequiredEvidenceKind[];
}

export type RequiredEvidenceKind =
  | 'tool-success'
  | 'runner-success'
  | 'workspace-inspection'
  | 'workspace-change'
  | 'verification';

export interface RecoveryPolicy {
  /** Total number of distinct strategies, including the initial plan. */
  maxAttempts: number;
  rejectDuplicateStrategies?: boolean;
  pauseOnApprovalRequired?: boolean;
}

export type RecoveryTrigger = 'execution_failure' | 'verification_failure' | 'stalled';

export type AttemptStatus = 'running' | 'failed' | 'passed' | 'blocked' | 'paused';

export interface StructuredReflection {
  summary: string;
  cause: string;
  failedAssumption?: string;
  evidence: string[];
  failureFingerprint: string;
}

export interface RecoveryStrategy {
  id: string;
  fingerprint: string;
  summary: string;
  changes: string[];
  verification: string;
  requiresApproval?: boolean;
}

export interface AttemptSummary {
  attemptId: string;
  attempt: number;
  planId: string;
  strategyFingerprint: string;
  status: AttemptStatus;
  trigger?: RecoveryTrigger;
  failureFingerprint?: string;
  reflection?: StructuredReflection;
  strategy?: RecoveryStrategy;
  verification?: ObjectiveVerificationResult;
  startedAt: string;
  endedAt?: string;
}

export interface RecoveryDecision {
  plan: AgentPlan;
  reflection: StructuredReflection;
  strategy: RecoveryStrategy;
}

export interface CompletionContract {
  objective: string;
  completionSignal?: string;
  maxRounds: number;
  acceptance: CompletionAcceptance;
}

export interface AgentPlan {
  id: string;
  strategy: PlanStrategy;
  steps: AgentStep[];
  metadata?: Record<string, unknown>;
  completionContract?: CompletionContract;
}

export interface Planner {
  plan(request: AgentRunRequest, context: ContextEnvelope): Promise<AgentPlan>;
}

export interface WorkflowTriageSignals {
  wantsVerification: boolean;
  complexityScore: number;
  shouldDecompose: boolean;
  isCodingTask: boolean;
  codingTaskType: 'bugfix' | 'feature' | 'refactor' | 'generic';
}

export interface WorkflowTriageInput {
  request: AgentRunRequest;
  context: ContextEnvelope;
  userMessage: string;
  semanticToolCandidate?: {
    title: string;
    toolName: string;
    input: Record<string, unknown>;
  };
  signals: WorkflowTriageSignals;
}

export interface WorkflowTriageDecision {
  workflow: 'repo-understanding' | 'coding' | 'generic';
  reason?: string;
}

export interface WorkflowTriageAgent {
  readonly name?: string;
  triage(input: WorkflowTriageInput): Promise<WorkflowTriageDecision | undefined>;
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

export interface LlmStepRequest {
  request: AgentRunRequest;
  session: AgentSession;
  step: AgentStep;
  input: Record<string, unknown>;
  context: ContextEnvelope;
  outputs: Record<string, unknown>;
  signal?: AbortSignal;
  onEvent?: ToolContext['onEvent'];
}

export type LlmStepOutputPhase = 'analysis' | 'implementation' | 'verification';

export interface LlmStepStructuredSections {
  analysis?: string;
  implementation?: string;
  verification?: string;
}

export interface StructuredLlmStepOutput {
  mode: 'llm-step';
  stepId: string;
  title: string;
  phase: LlmStepOutputPhase;
  text: string;
  sections: LlmStepStructuredSections;
  completionSignal?: string;
  nextAction?: string;
  incompleteReason?: string;
  evidence?: string[];
  toolAttempts?: ToolAttemptSummary[];
  finishReason?: string;
  usage?: unknown;
}

export interface ToolAttemptSummary {
  toolName: string;
  ok: boolean;
  error?: string;
  durationMs?: number;
}

export interface LlmStepExecutorLike {
  execute(request: LlmStepRequest): Promise<unknown>;
}

export interface RunnerCapabilities {
  streaming: boolean;
  sandboxed: boolean;
  isolationLevel?: 'guarded-host' | 'container' | 'os-sandbox';
}

export interface RunnerEventBase {
  type: string;
  timestamp: string;
  runnerId: string;
  executionId?: string;
  attempt?: number;
  sequence?: number;
}

export interface RunnerStartedEvent extends RunnerEventBase {
  type: 'started';
  task: RunnerTask;
}

export interface RunnerStdoutEvent extends RunnerEventBase {
  type: 'stdout';
  chunk: string;
  chunkSequence?: number;
  byteOffset?: number;
  truncated?: boolean;
}

export interface RunnerStderrEvent extends RunnerEventBase {
  type: 'stderr';
  chunk: string;
  chunkSequence?: number;
  byteOffset?: number;
  truncated?: boolean;
}

export interface RunnerProgressEvent extends RunnerEventBase {
  type: 'progress';
  message: string;
  percent?: number;
}

export interface RunnerResultEvent extends RunnerEventBase {
  type: 'result';
  result: unknown;
  stdoutBytes?: number;
  stderrBytes?: number;
  outputTruncated?: boolean;
}

export interface RunnerErrorEvent extends RunnerEventBase {
  type: 'error';
  error: string;
  retryable: boolean;
  failureType?: string;
  code?: string;
}

export interface RunnerApprovalRequestEvent extends RunnerEventBase {
  type: 'approval_request';
  requestId: string;
  sessionId: string;
  scopeType?: 'project' | 'chat';
  scopeId?: string;
  scopeLabel?: string;
  command: string;
  workingDir: string;
  risk: 'low' | 'medium' | 'high';
  reason?: string;
}

export interface RunnerApprovalResponseEvent extends RunnerEventBase {
  type: 'approval_response';
  requestId: string;
  sessionId: string;
  command: string;
  workingDir: string;
  approved: boolean;
  decision: 'once' | 'always' | 'deny';
  persistentGrantId?: string;
  reason?: string;
}

export interface RunnerCompletedEvent extends RunnerEventBase {
  type: 'completed';
  exitCode: number;
  durationMs: number;
  status?: 'succeeded' | 'failed' | 'cancelled' | 'timed_out' | 'rejected';
  failureType?: string;
  message?: string;
  stdoutBytes?: number;
  stderrBytes?: number;
  outputTruncated?: boolean;
}

export type RunnerEvent =
  | RunnerStartedEvent
  | RunnerStdoutEvent
  | RunnerStderrEvent
  | RunnerProgressEvent
  | RunnerResultEvent
  | RunnerErrorEvent
  | RunnerApprovalRequestEvent
  | RunnerApprovalResponseEvent
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
  type?: 'object' | 'string' | 'number' | 'integer' | 'boolean' | 'array';
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
  risk?: 'low' | 'medium' | 'high';
  access?: 'read' | 'write' | 'execute' | 'network' | 'git';
  approval?: 'never' | 'on_write' | 'always';
}

export interface ToolContext {
  taskId: string;
  sessionId: string;
  stepId: string;
  signal?: AbortSignal;
  metadata?: Record<string, unknown>;
  onEvent?: (type: AgentEvent['type'], payload: Record<string, unknown>) => void | Promise<void>;
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

export interface ReplanContext {
  attempt: number;
  trigger?: RecoveryTrigger;
  failedStep: AgentStep;
  failedPlan: AgentPlan;
  error: string;
  request: AgentRunRequest;
  session: AgentSession;
  context: ContextEnvelope;
  outputs: Record<string, unknown>;
  checkpoints: CheckpointRecord[];
  attempts?: AttemptSummary[];
  verification?: ObjectiveVerificationResult;
}

export interface Replanner {
  replan(ctx: ReplanContext): Promise<RecoveryDecision | AgentPlan | undefined>;
}

export type ObjectiveVerificationStatus = 'passed' | 'failed' | 'blocked';

export interface ObjectiveVerificationResult {
  status: ObjectiveVerificationStatus;
  verifierName: string;
  reason?: string;
  missingEvidence?: string[];
  evidence?: string[];
  nextAction?: string;
  completionSignalObserved?: boolean;
}

export interface ObjectiveVerificationContext {
  plan: AgentPlan;
  request: AgentRunRequest;
  session: AgentSession;
  context: ContextEnvelope;
  outputs: Record<string, unknown>;
  checkpoints: CheckpointRecord[];
  events: AgentEvent[];
  round: number;
  completionContract: CompletionContract;
}

export interface ObjectiveVerifier {
  readonly name: string;
  verify(context: ObjectiveVerificationContext): Promise<ObjectiveVerificationResult>;
}

export interface AgentEvent {
  id: string;
  taskId: string;
  sessionId: string;
  type:
    | 'session.started'
    | 'session.verification'
    | 'session.completed'
    | 'session.replanned'
    | 'session.paused'
    | 'session.blocked'
    | 'session.failed'
    | 'step.started'
    | 'step.completed'
    | 'step.failed'
    | 'tool.called'
    | 'tool.result'
    | 'approval_request'
    | 'approval_response'
    | 'runner.event'
    | 'recovery.reflected'
    | 'recovery.strategy_selected'
    | 'recovery.exhausted'
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
  rounds?: number;
  verification?: ObjectiveVerificationResult;
  attempts?: AttemptSummary[];
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
  workflowTriageAgent?: WorkflowTriageAgent;
  graphBuilder?: GraphBuilder;
  scheduler?: Scheduler;
  executor?: PlanExecutor;
  guardrails?: Guardrails;
  contextBuilder?: ContextBuilderLike;
  toolRegistry?: ToolRegistryLike;
  toolExecutor?: ToolExecutorLike;
  llmExecutor?: LlmStepExecutorLike;
  promptLoader?: PromptSystemLoader;
  promptRenderer?: PromptVariableRenderer;
  sessionStore?: SessionStore;
  checkpointStore?: CheckpointStore;
  replayStore?: ReplayStore;
  runners?: Runner[];
  runnerSelection?: RunnerSelectionStrategy;
  maxContextTokens?: number;
  replanner?: Replanner;
  recoveryPolicy?: Partial<RecoveryPolicy>;
  /** @deprecated Use recoveryPolicy.maxAttempts. */
  maxReplans?: number;
  objectiveVerifiers?: ObjectiveVerifier[];
}
