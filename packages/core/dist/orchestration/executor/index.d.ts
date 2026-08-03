import type { AgentEvent, AgentPlan, AgentRunRequest, AgentRunResult, AgentSession, CheckpointStore, ContextEnvelope, ExecutePlanOptions, GraphBuilder, Guardrails, LlmStepExecutorLike, PlanExecutor, RecoveryPolicy, Replanner, Runner, RunnerEvent, RunnerSelectionStrategy, RunnerTask, Scheduler, ToolExecutorLike } from '../../types/index.js';
import { ObjectiveVerifierRegistry } from './objective-verifiers.js';
export declare class InlineRunner implements Runner {
    readonly id = "inline-runner";
    readonly kind: "local";
    readonly capabilities: {
        streaming: boolean;
        sandboxed: boolean;
    };
    canRun(_task: RunnerTask): boolean;
    run(task: RunnerTask, signal?: AbortSignal): AsyncIterable<RunnerEvent>;
}
export declare class RunnerRouter {
    private readonly runners;
    private readonly strategy;
    private roundRobinCursor;
    private readonly inFlight;
    constructor(runners: Runner[], strategy?: RunnerSelectionStrategy);
    private sortCandidates;
    private candidates;
    execute(task: RunnerTask, signal?: AbortSignal): AsyncIterable<RunnerEvent>;
}
export interface DefaultPlanExecutorOptions {
    graphBuilder: GraphBuilder;
    scheduler: Scheduler;
    guardrails: Guardrails;
    toolExecutor: ToolExecutorLike;
    llmExecutor?: LlmStepExecutorLike;
    checkpointStore: CheckpointStore;
    runnerRouter: RunnerRouter;
    replanner?: Replanner;
    recoveryPolicy?: Partial<RecoveryPolicy>;
    maxReplans?: number;
    objectiveVerifierRegistry?: ObjectiveVerifierRegistry;
}
export declare class DefaultPlanExecutor implements PlanExecutor {
    private readonly options;
    constructor(options: DefaultPlanExecutorOptions);
    execute(plan: AgentPlan, request: AgentRunRequest, session: AgentSession, context: ContextEnvelope, executeOptions?: ExecutePlanOptions): AsyncGenerator<AgentEvent, AgentRunResult>;
    private executePlanSteps;
    private verifyCompletion;
    private recordAttemptCheckpoint;
}
