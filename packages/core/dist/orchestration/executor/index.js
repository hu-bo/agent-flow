import { ObjectiveVerifierRegistry } from './objective-verifiers.js';
function readOutputByRef(outputs, ref) {
    const normalized = ref.trim();
    if (!normalized) {
        return undefined;
    }
    const [stepId, ...pathParts] = normalized.split('.');
    if (!stepId) {
        return undefined;
    }
    let current = outputs[stepId];
    for (const part of pathParts) {
        if (Array.isArray(current)) {
            const index = Number(part);
            if (!Number.isInteger(index) || index < 0 || index >= current.length) {
                return undefined;
            }
            current = current[index];
            continue;
        }
        if (typeof current !== 'object' || current === null) {
            return undefined;
        }
        if (!(part in current)) {
            return undefined;
        }
        current = current[part];
    }
    return current;
}
function resolveStepInput(stepInput, consumes, outputs) {
    const base = { ...(stepInput ?? {}) };
    if (!consumes) {
        return base;
    }
    for (const [key, ref] of Object.entries(consumes)) {
        const value = readOutputByRef(outputs, ref);
        if (value !== undefined) {
            base[key] = value;
        }
    }
    return base;
}
function normalizeOptionalMissingToolResult(step, input, result) {
    if (result.ok || !isOptionalMissingFsRead(step, input, result.error)) {
        return result;
    }
    const requestedPath = typeof input.path === 'string' ? input.path : '';
    return {
        name: result.name,
        ok: true,
        output: {
            path: parseOpenErrorPath(result.error) ?? requestedPath,
            size: 0,
            content: '',
            missing: true,
            error: result.error,
        },
    };
}
function isOptionalMissingFsRead(step, input, error) {
    if (step.toolName !== 'fs.read' || input.allowMissing !== true || !error) {
        return false;
    }
    const normalized = error.toLowerCase();
    return (normalized.includes('no such file or directory') ||
        normalized.includes('cannot find the file specified') ||
        normalized.includes('cannot find the path specified') ||
        normalized.includes('system cannot find the file specified') ||
        normalized.includes('enoent'));
}
function parseOpenErrorPath(error) {
    if (!error?.startsWith('open ')) {
        return undefined;
    }
    const separator = ': ';
    const end = error.lastIndexOf(separator);
    if (end <= 'open '.length) {
        return undefined;
    }
    return error.slice('open '.length, end);
}
let eventCounter = 0;
function nextEventId() {
    eventCounter += 1;
    return `evt_${Date.now()}_${eventCounter}`;
}
function createEvent(taskId, sessionId, type, payload) {
    return {
        id: nextEventId(),
        taskId,
        sessionId,
        type,
        timestamp: new Date().toISOString(),
        payload
    };
}
export class InlineRunner {
    id = 'inline-runner';
    kind = 'local';
    capabilities = {
        streaming: true,
        sandboxed: false
    };
    canRun(_task) {
        return true;
    }
    async *run(task, signal) {
        const startedAt = Date.now();
        if (signal?.aborted) {
            throw new Error('Runner task aborted.');
        }
        yield {
            type: 'started',
            timestamp: new Date().toISOString(),
            runnerId: this.id,
            task
        };
        yield {
            type: 'progress',
            timestamp: new Date().toISOString(),
            runnerId: this.id,
            message: `Executing: ${task.command}`,
            percent: 20
        };
        yield {
            type: 'stdout',
            timestamp: new Date().toISOString(),
            runnerId: this.id,
            chunk: `[inline] ${task.command} ${task.args.join(' ')}`.trim()
        };
        yield {
            type: 'result',
            timestamp: new Date().toISOString(),
            runnerId: this.id,
            result: {
                command: task.command,
                args: task.args,
                ok: true
            }
        };
        yield {
            type: 'completed',
            timestamp: new Date().toISOString(),
            runnerId: this.id,
            exitCode: 0,
            durationMs: Date.now() - startedAt
        };
    }
}
function serializeErrorForLog(error) {
    const base = {
        message: error instanceof Error ? error.message : String(error),
    };
    if (error instanceof Error) {
        base.name = error.name;
        base.stack = error.stack;
        const cause = error.cause;
        if (cause !== undefined) {
            base.cause = serializeErrorForLog(cause);
        }
        const extra = extractExtraErrorProps(error);
        if (extra) {
            base.extra = extra;
        }
        return base;
    }
    const extra = extractExtraErrorProps(error);
    if (extra) {
        base.extra = extra;
    }
    return base;
}
function extractExtraErrorProps(value) {
    if (!value || typeof value !== 'object') {
        return undefined;
    }
    const obj = value;
    const result = {};
    for (const key of Object.getOwnPropertyNames(obj)) {
        if (key === 'name' || key === 'message' || key === 'stack' || key === 'cause') {
            continue;
        }
        const lowered = key.toLowerCase();
        if (lowered.includes('key') ||
            lowered.includes('token') ||
            lowered.includes('secret') ||
            lowered.includes('authorization')) {
            continue;
        }
        result[key] = sanitizeErrorValue(obj[key]);
    }
    return Object.keys(result).length > 0 ? result : undefined;
}
function sanitizeErrorValue(value) {
    if (typeof value === 'string') {
        const max = 24_000;
        return value.length > max ? `${value.slice(0, max)}... (truncated)` : value;
    }
    if (Array.isArray(value)) {
        return value.slice(0, 50).map((item) => sanitizeErrorValue(item));
    }
    if (value && typeof value === 'object') {
        const obj = value;
        const out = {};
        let count = 0;
        for (const [k, v] of Object.entries(obj)) {
            if (count >= 50)
                break;
            const lowered = k.toLowerCase();
            if (lowered.includes('key') ||
                lowered.includes('token') ||
                lowered.includes('secret') ||
                lowered.includes('authorization')) {
                continue;
            }
            out[k] = sanitizeErrorValue(v);
            count += 1;
        }
        return out;
    }
    return value;
}
export class RunnerRouter {
    runners;
    strategy;
    roundRobinCursor = 0;
    inFlight = new Map();
    constructor(runners, strategy = 'round-robin') {
        this.runners = runners;
        this.strategy = strategy;
        if (runners.length === 0) {
            throw new Error('RunnerRouter requires at least one runner.');
        }
        for (const runner of runners) {
            this.inFlight.set(runner.id, 0);
        }
    }
    sortCandidates(candidates) {
        if (this.strategy === 'least-loaded') {
            return [...candidates].sort((left, right) => {
                const leftLoad = this.inFlight.get(left.id) ?? 0;
                const rightLoad = this.inFlight.get(right.id) ?? 0;
                return leftLoad - rightLoad;
            });
        }
        const cursor = this.roundRobinCursor % candidates.length;
        const ordered = [...candidates.slice(cursor), ...candidates.slice(0, cursor)];
        this.roundRobinCursor = (this.roundRobinCursor + 1) % candidates.length;
        return ordered;
    }
    candidates(task) {
        let candidates = this.runners.filter((runner) => runner.canRun(task));
        if (task.metadata?.preferredRunnerId && typeof task.metadata.preferredRunnerId === 'string') {
            candidates = candidates.filter((runner) => runner.id === task.metadata?.preferredRunnerId);
        }
        if (candidates.length === 0) {
            throw new Error(`No runner available for step "${task.stepId}".`);
        }
        return this.sortCandidates(candidates);
    }
    async *execute(task, signal) {
        const candidates = this.candidates(task);
        let lastError;
        for (const runner of candidates) {
            const load = this.inFlight.get(runner.id) ?? 0;
            this.inFlight.set(runner.id, load + 1);
            try {
                for await (const event of runner.run(task, signal)) {
                    yield event;
                }
                return;
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                yield {
                    type: 'error',
                    timestamp: new Date().toISOString(),
                    runnerId: runner.id,
                    error: lastError.message,
                    retryable: true
                };
            }
            finally {
                this.inFlight.set(runner.id, Math.max(0, (this.inFlight.get(runner.id) ?? 1) - 1));
            }
        }
        throw lastError ?? new Error(`All runners failed for step "${task.stepId}".`);
    }
}
class StepExecutionError extends Error {
    step;
    cause;
    constructor(message, step, cause) {
        super(message);
        this.step = step;
        this.name = 'StepExecutionError';
        this.cause = cause;
    }
}
const DEFAULT_RECOVERY_POLICY = {
    maxAttempts: 3,
    rejectDuplicateStrategies: true,
    pauseOnApprovalRequired: true,
};
function isRecoveryDecision(value) {
    return 'plan' in value && 'reflection' in value && 'strategy' in value;
}
function stableValue(value) {
    if (Array.isArray(value))
        return value.map(stableValue);
    if (!value || typeof value !== 'object')
        return value;
    return Object.fromEntries(Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, stableValue(item)]));
}
function hashText(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
}
function planStrategyFingerprint(plan) {
    const signature = plan.steps.map((step) => ({
        title: step.title,
        kind: step.kind,
        toolName: step.toolName,
        input: stableValue(step.input),
        consumes: stableValue(step.consumes),
        runner: step.runner
            ? {
                command: step.runner.command,
                args: step.runner.args ?? [],
                input: stableValue(step.runner.input),
            }
            : undefined,
    }));
    return `strategy_${hashText(JSON.stringify(signature))}`;
}
function normalizeFailureText(error) {
    return error
        .toLowerCase()
        .replace(/\b\d{4}-\d{2}-\d{2}t[^\s]+/g, '<timestamp>')
        .replace(/\b\d+ms\b/g, '<duration>')
        .replace(/\b\d{5,}\b/g, '<number>')
        .replace(/\s+/g, ' ')
        .trim();
}
function failureFingerprint(error, step) {
    return `failure_${hashText(`${step?.kind ?? 'verification'}:${step?.toolName ?? step?.title ?? 'objective'}:${normalizeFailureText(error)}`)}`;
}
function attemptOutputs(plan, outputs) {
    const ids = new Set(plan.steps.map((step) => step.id));
    return Object.fromEntries(Object.entries(outputs).filter(([stepId]) => ids.has(stepId)));
}
function persistedAttempts(checkpoints) {
    return checkpoints
        .filter((checkpoint) => checkpoint.metadata.recoveryAttempt === true)
        .map((checkpoint) => checkpoint.output)
        .filter((output) => Boolean(output) && typeof output === 'object' && typeof output.attemptId === 'string');
}
export class DefaultPlanExecutor {
    options;
    constructor(options) {
        this.options = options;
    }
    async *execute(plan, request, session, context, executeOptions = {}) {
        const events = [];
        const outputs = {};
        const checkpoints = [];
        const emit = async (event) => {
            events.push(event);
            if (executeOptions.onEvent) {
                await executeOptions.onEvent(event);
            }
            return event;
        };
        const configuredMaxAttempts = this.options.recoveryPolicy?.maxAttempts
            ?? (this.options.maxReplans === undefined ? DEFAULT_RECOVERY_POLICY.maxAttempts : this.options.maxReplans + 1);
        const recoveryPolicy = {
            ...DEFAULT_RECOVERY_POLICY,
            ...this.options.recoveryPolicy,
            maxAttempts: Math.max(1, Math.floor(configuredMaxAttempts)),
        };
        const storedCheckpoints = await this.options.checkpointStore.list(session.id);
        const attempts = persistedAttempts(storedCheckpoints);
        const triedStrategies = new Set(attempts.map((attempt) => attempt.strategyFingerprint));
        let activePlan = plan;
        const rootCompletionContract = plan.completionContract;
        let attemptNumber = attempts.length + 1;
        let activeStrategyFingerprint = planStrategyFingerprint(activePlan);
        let activeStrategy = {
            id: 'initial-strategy',
            fingerprint: activeStrategyFingerprint,
            summary: 'Execute the initial planner strategy.',
            changes: [],
            verification: plan.completionContract?.acceptance.verifierName ?? 'objective verifier',
        };
        let replanCount = 0;
        let latestVerification;
        yield await emit(createEvent(session.taskId, session.id, 'session.started', {
            planId: plan.id,
            strategy: plan.strategy,
            round: attemptNumber,
            maxRounds: recoveryPolicy.maxAttempts,
            recoveryPolicy,
            steps: plan.steps.map((step) => ({
                id: step.id,
                title: step.title,
                kind: step.kind,
                dependsOn: step.dependsOn,
                toolName: step.toolName,
                runner: step.runner
                    ? {
                        command: step.runner.command,
                        args: step.runner.args ?? [],
                        preferredRunnerId: step.runner.preferredRunnerId,
                        preferredRunnerKind: step.runner.preferredRunnerKind,
                    }
                    : undefined,
                input: step.input,
                consumes: step.consumes,
            })),
            metadata: plan.metadata ?? {},
            completionContract: plan.completionContract,
        }));
        while (true) {
            if (attemptNumber > recoveryPolicy.maxAttempts) {
                const reason = `Recovery exhausted after ${recoveryPolicy.maxAttempts} distinct strategies.`;
                yield await emit(createEvent(session.taskId, session.id, 'recovery.exhausted', {
                    attempts: attempts.length,
                    reason,
                }));
                yield await emit(createEvent(session.taskId, session.id, 'session.blocked', { reason }));
                return {
                    taskId: session.taskId,
                    sessionId: session.id,
                    status: 'blocked',
                    outputs,
                    checkpoints,
                    events,
                    rounds: attempts.length,
                    attempts,
                    verification: latestVerification,
                    error: reason,
                };
            }
            const attempt = {
                attemptId: `attempt_${session.id}_${attemptNumber}`,
                attempt: attemptNumber,
                planId: activePlan.id,
                strategyFingerprint: activeStrategyFingerprint,
                strategy: activeStrategy,
                status: 'running',
                startedAt: new Date().toISOString(),
            };
            attempts.push(attempt);
            triedStrategies.add(activeStrategyFingerprint);
            const attemptEventStart = events.length;
            const attemptCheckpointStart = checkpoints.length;
            yield await emit(createEvent(session.taskId, session.id, 'recovery.strategy_selected', {
                attemptId: attempt.attemptId,
                attempt: attemptNumber,
                planId: activePlan.id,
                strategyFingerprint: activeStrategyFingerprint,
                maxAttempts: recoveryPolicy.maxAttempts,
                strategy: attempt.strategy,
            }));
            let failedStep;
            let failureMessage;
            let recoveryTrigger = 'execution_failure';
            try {
                await this.executePlanSteps(activePlan, request, session, context, executeOptions, outputs, checkpoints, emit, attemptNumber, latestVerification);
                latestVerification = await this.verifyCompletion(activePlan, request, session, context, attemptOutputs(activePlan, outputs), checkpoints.slice(attemptCheckpointStart), events.slice(attemptEventStart), attemptNumber, emit);
                if (!latestVerification) {
                    latestVerification = {
                        status: 'failed',
                        verifierName: 'missing-completion-contract',
                        reason: 'The active plan did not produce an objective verification result.',
                        missingEvidence: ['completion-contract'],
                        nextAction: 'Create a recovery plan that preserves the original completion contract.',
                    };
                }
                attempt.verification = latestVerification;
                if (latestVerification.status === 'passed') {
                    attempt.status = 'passed';
                    attempt.endedAt = new Date().toISOString();
                    await this.recordAttemptCheckpoint(session, checkpoints, attempt, emit);
                    yield await emit(createEvent(session.taskId, session.id, 'session.completed', {
                        checkpoints: checkpoints.length,
                        replanCount,
                        rounds: attemptNumber,
                        attempts,
                        verification: latestVerification,
                    }));
                    return {
                        taskId: session.taskId,
                        sessionId: session.id,
                        status: 'succeeded',
                        outputs,
                        checkpoints,
                        events,
                        rounds: attemptNumber,
                        attempts,
                        verification: latestVerification,
                    };
                }
                if (latestVerification.status === 'blocked') {
                    attempt.status = 'blocked';
                    attempt.endedAt = new Date().toISOString();
                    await this.recordAttemptCheckpoint(session, checkpoints, attempt, emit);
                    yield await emit(createEvent(session.taskId, session.id, 'session.blocked', {
                        reason: latestVerification.reason ?? 'verification blocked',
                        rounds: attemptNumber,
                        verifierName: latestVerification.verifierName,
                        missingEvidence: latestVerification.missingEvidence ?? [],
                        nextAction: latestVerification.nextAction,
                        verification: latestVerification,
                    }));
                    return {
                        taskId: session.taskId,
                        sessionId: session.id,
                        status: 'blocked',
                        outputs,
                        checkpoints,
                        events,
                        rounds: attemptNumber,
                        attempts,
                        verification: latestVerification,
                        error: latestVerification.reason ?? 'Objective verification blocked completion.',
                    };
                }
                recoveryTrigger = 'verification_failure';
                failureMessage = latestVerification.reason ?? 'Objective verification failed.';
            }
            catch (error) {
                const stepError = error instanceof StepExecutionError ? error : undefined;
                failedStep = stepError?.step;
                failureMessage = error instanceof Error ? error.message : String(error);
            }
            const failure = failureMessage ?? 'Attempt failed without a concrete error.';
            attempt.status = 'failed';
            attempt.trigger = recoveryTrigger;
            attempt.failureFingerprint = failureFingerprint(failure, failedStep);
            attempt.endedAt = new Date().toISOString();
            if (!this.options.replanner) {
                const terminalStatus = recoveryTrigger === 'verification_failure' ? 'blocked' : 'failed';
                if (terminalStatus === 'blocked' && latestVerification) {
                    latestVerification = { ...latestVerification, status: 'blocked' };
                    attempt.verification = latestVerification;
                    attempt.status = 'blocked';
                }
                await this.recordAttemptCheckpoint(session, checkpoints, attempt, emit);
                yield await emit(createEvent(session.taskId, session.id, terminalStatus === 'blocked' ? 'session.blocked' : 'session.failed', {
                    error: failure,
                    reason: failure,
                    rounds: attemptNumber,
                    attempts,
                }));
                return {
                    taskId: session.taskId,
                    sessionId: session.id,
                    status: terminalStatus,
                    outputs,
                    checkpoints,
                    events,
                    rounds: attemptNumber,
                    attempts,
                    verification: latestVerification,
                    error: failure,
                };
            }
            if (attemptNumber >= recoveryPolicy.maxAttempts) {
                if (latestVerification) {
                    latestVerification = { ...latestVerification, status: 'blocked' };
                    attempt.verification = latestVerification;
                }
                attempt.status = 'blocked';
                await this.recordAttemptCheckpoint(session, checkpoints, attempt, emit);
                const reason = `Recovery exhausted after ${recoveryPolicy.maxAttempts} distinct strategies. Last failure: ${failure}`;
                yield await emit(createEvent(session.taskId, session.id, 'recovery.exhausted', {
                    attempts: attemptNumber,
                    reason,
                    failureFingerprint: attempt.failureFingerprint,
                }));
                yield await emit(createEvent(session.taskId, session.id, 'session.blocked', {
                    reason,
                    rounds: attemptNumber,
                    attempts,
                    verification: latestVerification,
                }));
                return {
                    taskId: session.taskId,
                    sessionId: session.id,
                    status: 'blocked',
                    outputs,
                    checkpoints,
                    events,
                    rounds: attemptNumber,
                    attempts,
                    verification: latestVerification,
                    error: reason,
                };
            }
            const recoveryFailedStep = failedStep ?? activePlan.steps.at(-1) ?? {
                id: `${activePlan.id}-objective-verification`,
                title: 'objective-verification',
                kind: 'llm',
                dependsOn: [],
            };
            const replanned = await this.options.replanner.replan({
                attempt: attemptNumber,
                trigger: recoveryTrigger,
                failedStep: recoveryFailedStep,
                failedPlan: activePlan,
                error: failure,
                request,
                session,
                context,
                outputs: attemptOutputs(activePlan, outputs),
                checkpoints: checkpoints.slice(attemptCheckpointStart),
                attempts: [...attempts],
                verification: latestVerification,
            });
            if (!replanned) {
                await this.recordAttemptCheckpoint(session, checkpoints, attempt, emit);
                const reason = `No safe recovery strategy was available. Last failure: ${failure}`;
                yield await emit(createEvent(session.taskId, session.id, 'session.blocked', { reason, attempts }));
                return {
                    taskId: session.taskId,
                    sessionId: session.id,
                    status: 'blocked',
                    outputs,
                    checkpoints,
                    events,
                    rounds: attemptNumber,
                    attempts,
                    verification: latestVerification,
                    error: reason,
                };
            }
            const decision = isRecoveryDecision(replanned) ? replanned : undefined;
            const nextPlan = decision?.plan ?? replanned;
            nextPlan.completionContract = nextPlan.completionContract ?? activePlan.completionContract ?? rootCompletionContract;
            const nextStrategy = decision?.strategy ?? {
                id: `strategy_${attemptNumber + 1}`,
                fingerprint: planStrategyFingerprint(nextPlan),
                summary: `Recovery strategy after ${recoveryTrigger}.`,
                changes: ['Use the replanner-provided executable plan.'],
                verification: nextPlan.completionContract?.acceptance.verifierName ?? 'objective verifier',
            };
            const nextFingerprint = nextStrategy.fingerprint || planStrategyFingerprint(nextPlan);
            if (recoveryPolicy.rejectDuplicateStrategies && triedStrategies.has(nextFingerprint)) {
                attempt.reflection = decision?.reflection;
                await this.recordAttemptCheckpoint(session, checkpoints, attempt, emit);
                const reason = `Recovery stalled because the replanner repeated strategy ${nextFingerprint}.`;
                yield await emit(createEvent(session.taskId, session.id, 'recovery.exhausted', {
                    reason,
                    strategyFingerprint: nextFingerprint,
                    attempts,
                }));
                yield await emit(createEvent(session.taskId, session.id, 'session.blocked', { reason, attempts }));
                return {
                    taskId: session.taskId,
                    sessionId: session.id,
                    status: 'blocked',
                    outputs,
                    checkpoints,
                    events,
                    rounds: attemptNumber,
                    attempts,
                    verification: latestVerification,
                    error: reason,
                };
            }
            attempt.reflection = decision?.reflection ?? {
                summary: failure,
                cause: recoveryTrigger,
                evidence: latestVerification?.evidence ?? [],
                failureFingerprint: attempt.failureFingerprint,
            };
            await this.recordAttemptCheckpoint(session, checkpoints, attempt, emit);
            yield await emit(createEvent(session.taskId, session.id, 'recovery.reflected', {
                attemptId: attempt.attemptId,
                attempt: attemptNumber,
                trigger: recoveryTrigger,
                reflection: attempt.reflection,
            }));
            yield await emit(createEvent(session.taskId, session.id, 'session.replanned', {
                attempt: attemptNumber,
                fromPlanId: activePlan.id,
                toPlanId: nextPlan.id,
                failedStepId: failedStep?.id,
                error: failure,
                strategy: nextStrategy,
            }));
            replanCount += 1;
            activePlan = nextPlan;
            activeStrategyFingerprint = nextFingerprint;
            activeStrategy = nextStrategy;
            attemptNumber += 1;
        }
    }
    async executePlanSteps(plan, request, session, context, executeOptions, outputs, checkpoints, emit, round, previousVerification) {
        const graph = this.options.graphBuilder.build(plan);
        const batches = this.options.scheduler.schedule(graph);
        for (const batch of batches) {
            for (const step of batch) {
                const baseResolvedInput = resolveStepInput(step.input, step.consumes, outputs);
                const resolvedInput = step.kind === 'llm'
                    ? {
                        ...baseResolvedInput,
                        recoveryLoop: {
                            round,
                            maxRounds: Math.max(1, plan.completionContract?.maxRounds ?? 1),
                            verifierName: plan.completionContract?.acceptance.verifierName,
                            previousVerification: previousVerification
                                ? {
                                    status: previousVerification.status,
                                    reason: previousVerification.reason,
                                    missingEvidence: previousVerification.missingEvidence ?? [],
                                    evidence: previousVerification.evidence ?? [],
                                    nextAction: previousVerification.nextAction,
                                    completionSignalObserved: previousVerification.completionSignalObserved ?? false,
                                }
                                : undefined,
                        },
                    }
                    : baseResolvedInput;
                await emit(createEvent(session.taskId, session.id, 'step.started', {
                    stepId: step.id,
                    title: step.title,
                    kind: step.kind,
                    round,
                }));
                try {
                    await this.options.guardrails.runBefore({
                        session,
                        request,
                        step
                    });
                    let output;
                    const emitStepEvent = async (type, payload) => {
                        await emit(createEvent(session.taskId, session.id, type, {
                            stepId: step.id,
                            title: step.title,
                            kind: step.kind,
                            round,
                            ...payload,
                        }));
                        if (type === 'approval_request') {
                            await emit(createEvent(session.taskId, session.id, 'session.paused', {
                                stepId: step.id,
                                attempt: round,
                                reason: 'Waiting for high-risk Runner approval.',
                                requestId: payload.requestId,
                                runnerId: payload.runnerId,
                            }));
                        }
                    };
                    if (step.kind === 'llm') {
                        if (this.options.llmExecutor) {
                            output = await this.options.llmExecutor.execute({
                                request,
                                session,
                                step,
                                input: resolvedInput,
                                context,
                                outputs: { ...outputs },
                                signal: executeOptions.signal,
                                onEvent: emitStepEvent
                            });
                        }
                        else {
                            output = {
                                mode: 'placeholder',
                                goal: request.goal,
                                contextTokens: context.tokenUsed,
                                stepInput: resolvedInput
                            };
                        }
                    }
                    else if (step.kind === 'tool') {
                        if (!step.toolName) {
                            throw new Error(`Step "${step.id}" is a tool step but has no toolName.`);
                        }
                        await emit(createEvent(session.taskId, session.id, 'tool.called', {
                            stepId: step.id,
                            title: step.title,
                            kind: step.kind,
                            tool: step.toolName,
                            input: resolvedInput,
                            round,
                        }));
                        const toolResult = await this.options.toolExecutor.execute({
                            name: step.toolName,
                            input: resolvedInput
                        }, {
                            taskId: session.taskId,
                            sessionId: session.id,
                            stepId: step.id,
                            signal: executeOptions.signal,
                            metadata: request.metadata,
                            onEvent: emitStepEvent
                        }, {
                            retries: 1
                        });
                        const normalizedToolResult = normalizeOptionalMissingToolResult(step, resolvedInput, toolResult);
                        await emit(createEvent(session.taskId, session.id, 'tool.result', {
                            stepId: step.id,
                            title: step.title,
                            kind: step.kind,
                            tool: step.toolName,
                            ok: normalizedToolResult.ok,
                            error: normalizedToolResult.error,
                            output: normalizedToolResult.output,
                            round,
                        }));
                        if (!normalizedToolResult.ok) {
                            throw new Error(normalizedToolResult.error ?? `Tool "${step.toolName}" failed.`);
                        }
                        output = normalizedToolResult.output;
                    }
                    else {
                        if (!step.runner) {
                            throw new Error(`Step "${step.id}" is a runner step but has no runner config.`);
                        }
                        const resolvedRunnerInput = resolveStepInput(step.runner.input ?? step.input, step.consumes, outputs);
                        const runnerTask = {
                            taskId: session.taskId,
                            sessionId: session.id,
                            stepId: step.id,
                            command: step.runner.command,
                            args: step.runner.args ?? [],
                            timeoutMs: step.runner.timeoutMs,
                            env: step.runner.env,
                            input: resolvedRunnerInput,
                            stream: step.runner.stream ?? true,
                            metadata: {
                                ...request.metadata,
                                preferredRunnerId: step.runner.preferredRunnerId,
                                preferredRunnerKind: step.runner.preferredRunnerKind
                            }
                        };
                        let runnerOutput = undefined;
                        let runnerFailure;
                        for await (const runnerEvent of this.options.runnerRouter.execute(runnerTask, executeOptions.signal)) {
                            await emit(createEvent(session.taskId, session.id, 'runner.event', {
                                stepId: step.id,
                                runnerEvent,
                                round,
                            }));
                            if (runnerEvent.type === 'result') {
                                runnerOutput = runnerEvent.result;
                            }
                            else if (runnerEvent.type === 'error') {
                                runnerFailure = runnerEvent.error;
                            }
                            else if (runnerEvent.type === 'completed' && runnerEvent.exitCode !== 0) {
                                runnerFailure = `Runner command exited with code ${runnerEvent.exitCode}.`;
                            }
                            else if (runnerEvent.type === 'approval_request') {
                                await emit(createEvent(session.taskId, session.id, 'session.paused', {
                                    stepId: step.id,
                                    attempt: round,
                                    reason: 'Waiting for high-risk Runner approval.',
                                    requestId: runnerEvent.requestId,
                                    runnerId: runnerEvent.runnerId,
                                }));
                            }
                        }
                        if (runnerFailure)
                            throw new Error(runnerFailure);
                        output = runnerOutput;
                    }
                    await this.options.guardrails.runAfter({
                        session,
                        request,
                        step,
                        output
                    });
                    outputs[step.id] = output;
                    const checkpoint = await this.options.checkpointStore.save({
                        sessionId: session.id,
                        stepId: step.id,
                        output,
                        metadata: {
                            taskId: session.taskId,
                            stepTitle: step.title,
                            recoveryLoop: {
                                round,
                            },
                        }
                    });
                    checkpoints.push(checkpoint);
                    await emit(createEvent(session.taskId, session.id, 'checkpoint.created', {
                        stepId: step.id,
                        title: step.title,
                        kind: step.kind,
                        checkpointId: checkpoint.id,
                        round,
                        ...(step.kind === 'llm' ? { output } : {})
                    }));
                    await emit(createEvent(session.taskId, session.id, 'step.completed', {
                        stepId: step.id,
                        title: step.title,
                        kind: step.kind,
                        round,
                    }));
                }
                catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    await emit(createEvent(session.taskId, session.id, 'step.failed', {
                        stepId: step.id,
                        title: step.title,
                        kind: step.kind,
                        error: message,
                        errorDetails: serializeErrorForLog(error),
                        round,
                    }));
                    throw new StepExecutionError(message, step, error);
                }
            }
        }
    }
    async verifyCompletion(plan, request, session, context, outputs, checkpoints, events, round, emit) {
        const registry = this.options.objectiveVerifierRegistry ?? new ObjectiveVerifierRegistry();
        const verification = await registry.verify({
            plan,
            request,
            session,
            context,
            outputs,
            checkpoints,
            events,
            round,
        });
        if (!verification) {
            return undefined;
        }
        await emit(createEvent(session.taskId, session.id, 'session.verification', {
            round,
            status: verification.status,
            verifierName: verification.verifierName,
            reason: verification.reason,
            missingEvidence: verification.missingEvidence ?? [],
            evidence: verification.evidence ?? [],
            nextAction: verification.nextAction,
            completionSignalObserved: verification.completionSignalObserved ?? false,
        }));
        return verification;
    }
    async recordAttemptCheckpoint(session, checkpoints, attempt, emit) {
        const checkpoint = await this.options.checkpointStore.save({
            sessionId: session.id,
            stepId: attempt.attemptId,
            output: attempt,
            metadata: {
                taskId: session.taskId,
                stepTitle: attempt.attemptId,
                recoveryAttempt: true,
                attempt: attempt.attempt,
                status: attempt.status,
                strategyFingerprint: attempt.strategyFingerprint,
                failureFingerprint: attempt.failureFingerprint,
            },
        });
        checkpoints.push(checkpoint);
        await emit(createEvent(session.taskId, session.id, 'checkpoint.created', {
            stepId: attempt.attemptId,
            title: attempt.attemptId,
            kind: 'llm',
            checkpointId: checkpoint.id,
            round: attempt.attempt,
            recoveryAttempt: true,
            output: attempt,
        }));
    }
}
//# sourceMappingURL=index.js.map