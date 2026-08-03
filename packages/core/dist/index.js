import { ContextBuilder } from './context/builder/index.js';
import { DefaultContextLoader } from './context/loader/index.js';
import { KeywordContextSelector } from './context/selector/index.js';
import { FixedTokenWindowManager } from './context/window/index.js';
import { DefaultPlanExecutor, InlineRunner, RunnerRouter } from './orchestration/executor/index.js';
import { ObjectiveVerifierRegistry } from './orchestration/executor/objective-verifiers.js';
import { DagGraphBuilder } from './orchestration/graph/index.js';
import { CommandBlocklistGuardrail, GuardrailChain } from './orchestration/guardrails/index.js';
import { CapabilityPlanner, CodingReplanner } from './orchestration/planner/index.js';
import { TopologicalScheduler } from './orchestration/scheduler/index.js';
import { LayeredPromptSystemLoader } from './prompt/system-loader/index.js';
import { BracesVariableRenderer } from './prompt/variables/index.js';
import { InMemoryCheckpointStore } from './state/checkpoint/index.js';
import { InMemoryReplayStore } from './state/replay/index.js';
import { InMemorySessionStore } from './state/session/index.js';
import { ToolExecutor } from './tools/executor/index.js';
import { ToolRegistry } from './tools/registry/index.js';
export * from './types/index.js';
export * from './orchestration/planner/index.js';
export * from './orchestration/executor/index.js';
export * from './orchestration/scheduler/index.js';
export * from './orchestration/graph/index.js';
export * from './orchestration/guardrails/index.js';
export * from './context/builder/index.js';
export * from './context/loader/index.js';
export * from './context/selector/index.js';
export * from './context/window/index.js';
export * from './tools/registry/index.js';
export * from './tools/schema/index.js';
export * from './tools/executor/index.js';
export * from './prompt/system-loader/index.js';
export * from './prompt/variables/index.js';
export * from './state/session/index.js';
export * from './state/checkpoint/index.js';
export * from './state/replay/index.js';
let taskCounter = 0;
function nextTaskId() {
    taskCounter += 1;
    return `task_${Date.now()}_${taskCounter}`;
}
class DefaultAgentRuntime {
    planner;
    contextBuilder;
    executor;
    sessionStore;
    replayStore;
    checkpointStore;
    constructor(planner, contextBuilder, executor, sessionStore, replayStore, checkpointStore) {
        this.planner = planner;
        this.contextBuilder = contextBuilder;
        this.executor = executor;
        this.sessionStore = sessionStore;
        this.replayStore = replayStore;
        this.checkpointStore = checkpointStore;
    }
    async run(request, options = {}) {
        const taskId = request.taskId ?? nextTaskId();
        const session = await this.sessionStore.create(taskId, request.metadata ?? {});
        const runningSession = await this.sessionStore.update(session.id, {
            status: 'running',
            lastRequest: {
                ...request,
                taskId
            }
        });
        return this.executeWithSession(runningSession, { ...request, taskId }, options);
    }
    async resume(sessionId, requestOverride = {}, options = {}) {
        const existing = await this.sessionStore.get(sessionId);
        if (!existing) {
            throw new Error(`Session "${sessionId}" not found.`);
        }
        if (!existing.lastRequest) {
            throw new Error(`Session "${sessionId}" has no request snapshot for resume.`);
        }
        const request = {
            ...existing.lastRequest,
            ...requestOverride,
            taskId: existing.taskId
        };
        const runningSession = await this.sessionStore.update(sessionId, {
            status: 'running',
            lastRequest: request
        });
        return this.executeWithSession(runningSession, request, options);
    }
    async executeWithSession(session, request, options) {
        const context = await this.contextBuilder.build(request);
        const plan = await this.planner.plan(request, context);
        const requestWithPlan = {
            ...request,
            plan
        };
        const events = [];
        const seenEventIds = new Set();
        const recordEvent = async (event) => {
            if (seenEventIds.has(event.id)) {
                return;
            }
            seenEventIds.add(event.id);
            events.push(event);
            await this.replayStore.append(session.id, event);
            if (options.onEvent) {
                await options.onEvent(event);
            }
        };
        const stream = this.executor.execute(plan, requestWithPlan, session, context, {
            signal: options.signal,
            onEvent: recordEvent
        });
        let result;
        while (true) {
            const next = await stream.next();
            if (next.done) {
                result = next.value;
                break;
            }
            await recordEvent(next.value);
        }
        if (!result) {
            throw new Error('Execution stream ended without a result.');
        }
        const checkpoints = await this.checkpointStore.list(session.id);
        // The executor may record more granular events (step/tool/runner) than it yields.
        // Prefer the executor's internal event list when available so callers can debug failures.
        const finalEvents = Array.isArray(result.events) && result.events.length > events.length
            ? result.events
            : events;
        const finalResult = {
            ...result,
            events: finalEvents,
            checkpoints
        };
        await this.sessionStore.update(session.id, {
            status: finalResult.status
        });
        return finalResult;
    }
}
export function createAgent(options = {}) {
    const maxContextTokens = options.maxContextTokens ?? 8_000;
    const toolRegistry = options.toolRegistry ?? new ToolRegistry();
    const toolExecutor = options.toolExecutor ?? new ToolExecutor(toolRegistry);
    const sessionStore = options.sessionStore ?? new InMemorySessionStore();
    const checkpointStore = options.checkpointStore ?? new InMemoryCheckpointStore();
    const replayStore = options.replayStore ?? new InMemoryReplayStore();
    const contextBuilder = options.contextBuilder ??
        new ContextBuilder(new DefaultContextLoader(), new KeywordContextSelector(), new FixedTokenWindowManager(), {
            maxTokens: maxContextTokens
        });
    const planner = options.planner ?? new CapabilityPlanner({
        workflowTriageAgent: options.workflowTriageAgent,
    });
    const replanner = options.replanner ?? new CodingReplanner();
    const guardrails = options.guardrails ?? new GuardrailChain([new CommandBlocklistGuardrail()]);
    const graphBuilder = options.graphBuilder ?? new DagGraphBuilder();
    const scheduler = options.scheduler ?? new TopologicalScheduler();
    const runners = options.runners ?? [new InlineRunner()];
    const runnerRouter = new RunnerRouter(runners, options.runnerSelection ?? 'round-robin');
    const executor = options.executor ??
        new DefaultPlanExecutor({
            graphBuilder,
            scheduler,
            guardrails,
            toolExecutor,
            llmExecutor: options.llmExecutor,
            checkpointStore,
            runnerRouter,
            replanner,
            recoveryPolicy: options.recoveryPolicy,
            maxReplans: options.maxReplans,
            objectiveVerifierRegistry: new ObjectiveVerifierRegistry(options.objectiveVerifiers),
        });
    const promptLoader = options.promptLoader ?? new LayeredPromptSystemLoader();
    const promptRenderer = options.promptRenderer ?? new BracesVariableRenderer();
    void promptLoader;
    void promptRenderer;
    return new DefaultAgentRuntime(planner, contextBuilder, executor, sessionStore, replayStore, checkpointStore);
}
export class Agent {
    runtime;
    constructor(options = {}) {
        this.runtime = createAgent(options);
    }
    run(request, options) {
        return this.runtime.run(request, options);
    }
    resume(sessionId, requestOverride, options) {
        return this.runtime.resume(sessionId, requestOverride, options);
    }
}
