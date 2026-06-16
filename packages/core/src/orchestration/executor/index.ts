import type {
  AgentStep,
  AgentEvent,
  AgentPlan,
  AgentRunRequest,
  AgentRunResult,
  AgentSession,
  CheckpointRecord,
  CheckpointStore,
  ContextEnvelope,
  ExecutePlanOptions,
  GraphBuilder,
  Guardrails,
  LlmStepExecutorLike,
  ObjectiveVerificationResult,
  PlanExecutor,
  Replanner,
  Runner,
  RunnerEvent,
  RunnerSelectionStrategy,
  RunnerTask,
  Scheduler,
  ToolExecutorLike,
  ToolResult
} from '../../types/index.js';
import { ObjectiveVerifierRegistry } from './objective-verifiers.js';

function readOutputByRef(outputs: Record<string, unknown>, ref: string): unknown {
  const normalized = ref.trim();
  if (!normalized) {
    return undefined;
  }

  const [stepId, ...pathParts] = normalized.split('.');
  if (!stepId) {
    return undefined;
  }

  let current: unknown = outputs[stepId];
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
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

function resolveStepInput(stepInput: Record<string, unknown> | undefined, consumes: Record<string, string> | undefined, outputs: Record<string, unknown>): Record<string, unknown> {
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

function normalizeOptionalMissingToolResult(
  step: AgentStep,
  input: Record<string, unknown>,
  result: ToolResult
): ToolResult {
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

function isOptionalMissingFsRead(
  step: AgentStep,
  input: Record<string, unknown>,
  error: string | undefined
): boolean {
  if (step.toolName !== 'fs.read' || input.allowMissing !== true || !error) {
    return false;
  }

  const normalized = error.toLowerCase();
  return (
    normalized.includes('no such file or directory') ||
    normalized.includes('cannot find the file specified') ||
    normalized.includes('cannot find the path specified') ||
    normalized.includes('system cannot find the file specified') ||
    normalized.includes('enoent')
  );
}

function parseOpenErrorPath(error: string | undefined): string | undefined {
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

function nextEventId(): string {
  eventCounter += 1;
  return `evt_${Date.now()}_${eventCounter}`;
}

function createEvent(
  taskId: string,
  sessionId: string,
  type: AgentEvent['type'],
  payload: Record<string, unknown>
): AgentEvent {
  return {
    id: nextEventId(),
    taskId,
    sessionId,
    type,
    timestamp: new Date().toISOString(),
    payload
  };
}

export class InlineRunner implements Runner {
  readonly id = 'inline-runner';
  readonly kind = 'local' as const;
  readonly capabilities = {
    streaming: true,
    sandboxed: false
  };

  canRun(_task: RunnerTask): boolean {
    return true;
  }

  async *run(task: RunnerTask, signal?: AbortSignal): AsyncIterable<RunnerEvent> {
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

function serializeErrorForLog(error: unknown): Record<string, unknown> {
  const base: Record<string, unknown> = {
    message: error instanceof Error ? error.message : String(error),
  };

  if (error instanceof Error) {
    base.name = error.name;
    base.stack = error.stack;
    const cause = (error as unknown as { cause?: unknown }).cause;
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

function extractExtraErrorProps(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const obj = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const key of Object.getOwnPropertyNames(obj)) {
    if (key === 'name' || key === 'message' || key === 'stack' || key === 'cause') {
      continue;
    }

    const lowered = key.toLowerCase();
    if (
      lowered.includes('key') ||
      lowered.includes('token') ||
      lowered.includes('secret') ||
      lowered.includes('authorization')
    ) {
      continue;
    }

    result[key] = sanitizeErrorValue(obj[key]);
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function sanitizeErrorValue(value: unknown): unknown {
  if (typeof value === 'string') {
    const max = 24_000;
    return value.length > max ? `${value.slice(0, max)}... (truncated)` : value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => sanitizeErrorValue(item));
  }

  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    let count = 0;
    for (const [k, v] of Object.entries(obj)) {
      if (count >= 50) break;
      const lowered = k.toLowerCase();
      if (
        lowered.includes('key') ||
        lowered.includes('token') ||
        lowered.includes('secret') ||
        lowered.includes('authorization')
      ) {
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
  private roundRobinCursor = 0;
  private readonly inFlight = new Map<string, number>();

  constructor(
    private readonly runners: Runner[],
    private readonly strategy: RunnerSelectionStrategy = 'round-robin'
  ) {
    if (runners.length === 0) {
      throw new Error('RunnerRouter requires at least one runner.');
    }
    for (const runner of runners) {
      this.inFlight.set(runner.id, 0);
    }
  }

  private sortCandidates(candidates: Runner[]): Runner[] {
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

  private candidates(task: RunnerTask): Runner[] {
    let candidates = this.runners.filter((runner) => runner.canRun(task));
    if (task.metadata?.preferredRunnerId && typeof task.metadata.preferredRunnerId === 'string') {
      candidates = candidates.filter((runner) => runner.id === task.metadata?.preferredRunnerId);
    }
    if (candidates.length === 0) {
      throw new Error(`No runner available for step "${task.stepId}".`);
    }
    return this.sortCandidates(candidates);
  }

  async *execute(task: RunnerTask, signal?: AbortSignal): AsyncIterable<RunnerEvent> {
    const candidates = this.candidates(task);
    let lastError: Error | undefined;

    for (const runner of candidates) {
      const load = this.inFlight.get(runner.id) ?? 0;
      this.inFlight.set(runner.id, load + 1);
      try {
        for await (const event of runner.run(task, signal)) {
          yield event;
        }
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        yield {
          type: 'error',
          timestamp: new Date().toISOString(),
          runnerId: runner.id,
          error: lastError.message,
          retryable: true
        };
      } finally {
        this.inFlight.set(runner.id, Math.max(0, (this.inFlight.get(runner.id) ?? 1) - 1));
      }
    }

    throw lastError ?? new Error(`All runners failed for step "${task.stepId}".`);
  }
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
  maxReplans?: number;
  objectiveVerifierRegistry?: ObjectiveVerifierRegistry;
}

class StepExecutionError extends Error {
  readonly cause?: unknown;

  constructor(
    message: string,
    public readonly step: AgentStep,
    cause?: unknown
  ) {
    super(message);
    this.name = 'StepExecutionError';
    this.cause = cause;
  }
}

export class DefaultPlanExecutor implements PlanExecutor {
  constructor(private readonly options: DefaultPlanExecutorOptions) {}

  async *execute(
    plan: AgentPlan,
    request: AgentRunRequest,
    session: AgentSession,
    context: ContextEnvelope,
    executeOptions: ExecutePlanOptions = {}
  ): AsyncGenerator<AgentEvent, AgentRunResult> {
    const events: AgentEvent[] = [];
    const outputs: Record<string, unknown> = {};
    const checkpoints: CheckpointRecord[] = [];

    const emit = async (event: AgentEvent): Promise<AgentEvent> => {
      events.push(event);
      if (executeOptions.onEvent) {
        await executeOptions.onEvent(event);
      }
      return event;
    };
    const maxReplans = Math.max(0, this.options.maxReplans ?? 1);
    let activePlan = plan;
    let replanAttempt = 0;
    const maxRounds = Math.max(1, activePlan.completionContract?.maxRounds ?? 1);

    yield await emit(
      createEvent(session.taskId, session.id, 'session.started', {
        planId: plan.id,
        strategy: plan.strategy,
        round: 1,
        maxRounds,
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
      })
    );
    let round = 1;
    let latestVerification: ObjectiveVerificationResult | undefined;

    while (true) {
      try {
        const roundStartCheckpointCount = checkpoints.length;
        await this.executePlanSteps(
          activePlan,
          request,
          session,
          context,
          executeOptions,
          outputs,
          checkpoints,
          emit,
          round,
          latestVerification,
        );

        latestVerification = await this.verifyCompletion(
          activePlan,
          request,
          session,
          context,
          outputs,
          checkpoints,
          events,
          round,
          emit,
        );

        if (!latestVerification || latestVerification.status === 'passed') {
          yield await emit(
            createEvent(session.taskId, session.id, 'session.completed', {
              checkpoints: checkpoints.length,
              replanCount: replanAttempt,
              rounds: round,
              verification: latestVerification,
            })
          );

          return {
            taskId: session.taskId,
            sessionId: session.id,
            status: 'succeeded',
            outputs,
            checkpoints,
            events,
            rounds: round,
            verification: latestVerification,
          };
        }

        if (latestVerification.status === 'blocked') {
          yield await emit(
            createEvent(session.taskId, session.id, 'session.blocked', {
              reason: latestVerification.reason ?? 'verification blocked',
              rounds: round,
              verifierName: latestVerification.verifierName,
              missingEvidence: latestVerification.missingEvidence ?? [],
              nextAction: latestVerification.nextAction,
              verification: latestVerification,
            })
          );

          return {
            taskId: session.taskId,
            sessionId: session.id,
            status: 'blocked',
            outputs,
            checkpoints,
            events,
            rounds: round,
            verification: latestVerification,
            error: latestVerification.reason ?? 'Objective verification blocked completion.',
          };
        }

        if (round >= maxRounds) {
          const blockedVerification: ObjectiveVerificationResult = {
            ...latestVerification,
            status: 'blocked',
            reason:
              latestVerification.reason ??
              `Objective did not pass verification within ${maxRounds} rounds.`,
            nextAction:
              latestVerification.nextAction ??
              'Needs user input or a stronger verification strategy before continuing.',
          };
          latestVerification = blockedVerification;

          yield await emit(
            createEvent(session.taskId, session.id, 'session.blocked', {
              reason: blockedVerification.reason,
              rounds: round,
              verifierName: blockedVerification.verifierName,
              missingEvidence: blockedVerification.missingEvidence ?? [],
              nextAction: blockedVerification.nextAction,
              verification: blockedVerification,
            })
          );

          return {
            taskId: session.taskId,
            sessionId: session.id,
            status: 'blocked',
            outputs,
            checkpoints,
            events,
            rounds: round,
            verification: blockedVerification,
            error: blockedVerification.reason,
          };
        }

        await this.recordRoundCheckpoint(
          session,
          checkpoints,
          round,
          latestVerification,
          emit,
        );
        round += 1;
        if (checkpoints.length === roundStartCheckpointCount) {
          yield await emit(
            createEvent(session.taskId, session.id, 'session.blocked', {
              reason: 'Verification failed without producing new evidence.',
              rounds: round - 1,
              verifierName: latestVerification.verifierName,
              missingEvidence: latestVerification.missingEvidence ?? [],
              nextAction: latestVerification.nextAction,
              verification: latestVerification,
            })
          );

          return {
            taskId: session.taskId,
            sessionId: session.id,
            status: 'blocked',
            outputs,
            checkpoints,
            events,
            rounds: round - 1,
            verification: latestVerification,
            error: 'Verification failed without producing new evidence.',
          };
        }
      } catch (error) {
        const stepError = error instanceof StepExecutionError ? error : undefined;
        const message = error instanceof Error ? error.message : String(error);

        if (stepError && this.options.replanner && replanAttempt < maxReplans) {
          const nextPlan = await this.options.replanner.replan({
            attempt: replanAttempt + 1,
            failedStep: stepError.step,
            failedPlan: activePlan,
            error: message,
            request,
            session,
            context,
            outputs: { ...outputs },
            checkpoints: [...checkpoints]
          });

          if (nextPlan) {
            replanAttempt += 1;
            yield await emit(
              createEvent(session.taskId, session.id, 'session.replanned', {
                attempt: replanAttempt,
                fromPlanId: activePlan.id,
                toPlanId: nextPlan.id,
                failedStepId: stepError.step.id,
                error: message
              })
            );
            activePlan = nextPlan;
            continue;
          }
        }

        yield await emit(
          createEvent(session.taskId, session.id, 'session.failed', {
            error: message,
            replanCount: replanAttempt,
            rounds: round,
            verification: latestVerification,
          })
        );

        return {
          taskId: session.taskId,
          sessionId: session.id,
          status: 'failed',
          outputs,
          checkpoints,
          events,
          rounds: round,
          verification: latestVerification,
          error: message
        };
      }
    }
  }

  private async executePlanSteps(
    plan: AgentPlan,
    request: AgentRunRequest,
    session: AgentSession,
    context: ContextEnvelope,
    executeOptions: ExecutePlanOptions,
    outputs: Record<string, unknown>,
    checkpoints: CheckpointRecord[],
    emit: (event: AgentEvent) => Promise<AgentEvent>,
    round: number,
    previousVerification?: ObjectiveVerificationResult,
  ): Promise<void> {
      const graph = this.options.graphBuilder.build(plan);
      const batches = this.options.scheduler.schedule(graph);

      for (const batch of batches) {
        for (const step of batch) {
          const baseResolvedInput = resolveStepInput(step.input, step.consumes, outputs);
          const resolvedInput =
            step.kind === 'llm'
              ? {
                  ...baseResolvedInput,
                  ralphLoop: {
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
          await emit(
            createEvent(session.taskId, session.id, 'step.started', {
              stepId: step.id,
              title: step.title,
              kind: step.kind,
              round,
            })
          );

          try {
            await this.options.guardrails.runBefore({
              session,
              request,
              step
            });

            let output: unknown;
            const emitStepEvent = async (
              type: AgentEvent['type'],
              payload: Record<string, unknown>
            ) => {
              await emit(
                createEvent(session.taskId, session.id, type, {
                  stepId: step.id,
                  title: step.title,
                  kind: step.kind,
                  round,
                  ...payload,
                })
              );
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
              } else {
                output = {
                  mode: 'placeholder',
                  goal: request.goal,
                  contextTokens: context.tokenUsed,
                  stepInput: resolvedInput
                };
              }
            } else if (step.kind === 'tool') {
              if (!step.toolName) {
                throw new Error(`Step "${step.id}" is a tool step but has no toolName.`);
              }
              await emit(
                createEvent(session.taskId, session.id, 'tool.called', {
                stepId: step.id,
                title: step.title,
                kind: step.kind,
                tool: step.toolName,
                input: resolvedInput,
                round,
              })
              );
              const toolResult = await this.options.toolExecutor.execute(
                {
                  name: step.toolName,
                  input: resolvedInput
                },
                {
                  taskId: session.taskId,
                  sessionId: session.id,
                  stepId: step.id,
                  signal: executeOptions.signal,
                  metadata: request.metadata,
                  onEvent: emitStepEvent
                },
                {
                  retries: 1
                }
              );

              const normalizedToolResult = normalizeOptionalMissingToolResult(step, resolvedInput, toolResult);

              await emit(
                createEvent(session.taskId, session.id, 'tool.result', {
                  stepId: step.id,
                  title: step.title,
                  kind: step.kind,
                  tool: step.toolName,
                  ok: normalizedToolResult.ok,
                  error: normalizedToolResult.error,
                  output: normalizedToolResult.output,
                  round,
                })
              );

              if (!normalizedToolResult.ok) {
                throw new Error(normalizedToolResult.error ?? `Tool "${step.toolName}" failed.`);
              }
              output = normalizedToolResult.output;
            } else {
              if (!step.runner) {
                throw new Error(`Step "${step.id}" is a runner step but has no runner config.`);
              }

              const resolvedRunnerInput = resolveStepInput(
                step.runner.input ?? step.input,
                step.consumes,
                outputs
              );

              const runnerTask: RunnerTask = {
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

              let runnerOutput: unknown = undefined;
              for await (const runnerEvent of this.options.runnerRouter.execute(runnerTask, executeOptions.signal)) {
                await emit(
                  createEvent(session.taskId, session.id, 'runner.event', {
                    stepId: step.id,
                    runnerEvent,
                    round,
                  })
                );
                if (runnerEvent.type === 'result') {
                  runnerOutput = runnerEvent.result;
                }
              }
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
                ralphLoop: {
                  round,
                },
              }
            });
            checkpoints.push(checkpoint);

            await emit(
              createEvent(session.taskId, session.id, 'checkpoint.created', {
                stepId: step.id,
                title: step.title,
                kind: step.kind,
                checkpointId: checkpoint.id,
                round,
                ...(step.kind === 'llm' ? { output } : {})
              })
            );

            await emit(
              createEvent(session.taskId, session.id, 'step.completed', {
                stepId: step.id,
                title: step.title,
                kind: step.kind,
                round,
              })
            );
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            await emit(
              createEvent(session.taskId, session.id, 'step.failed', {
                stepId: step.id,
                title: step.title,
                kind: step.kind,
                error: message,
                errorDetails: serializeErrorForLog(error),
                round,
              })
            );
            throw new StepExecutionError(message, step, error);
          }
        }
      }
  }

  private async verifyCompletion(
    plan: AgentPlan,
    request: AgentRunRequest,
    session: AgentSession,
    context: ContextEnvelope,
    outputs: Record<string, unknown>,
    checkpoints: CheckpointRecord[],
    events: AgentEvent[],
    round: number,
    emit: (event: AgentEvent) => Promise<AgentEvent>,
  ): Promise<ObjectiveVerificationResult | undefined> {
    const registry =
      this.options.objectiveVerifierRegistry ?? new ObjectiveVerifierRegistry();
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

    await emit(
      createEvent(session.taskId, session.id, 'session.verification', {
        round,
        status: verification.status,
        verifierName: verification.verifierName,
        reason: verification.reason,
        missingEvidence: verification.missingEvidence ?? [],
        evidence: verification.evidence ?? [],
        nextAction: verification.nextAction,
        completionSignalObserved: verification.completionSignalObserved ?? false,
      }),
    );

    return verification;
  }

  private async recordRoundCheckpoint(
    session: AgentSession,
    checkpoints: CheckpointRecord[],
    round: number,
    verification: ObjectiveVerificationResult,
    emit: (event: AgentEvent) => Promise<AgentEvent>,
  ): Promise<void> {
    const checkpoint = await this.options.checkpointStore.save({
      sessionId: session.id,
      stepId: `ralph-round-${round}`,
      output: {
        round,
        verification,
      },
      metadata: {
        taskId: session.taskId,
        stepTitle: `ralph-round-${round}`,
        ralphLoop: {
          round,
          acceptanceStatus: verification.status,
          verifierName: verification.verifierName,
          missingEvidence: verification.missingEvidence ?? [],
          nextAction: verification.nextAction,
        },
      },
    });
    checkpoints.push(checkpoint);

    await emit(
      createEvent(session.taskId, session.id, 'checkpoint.created', {
        stepId: `ralph-round-${round}`,
        title: `ralph-round-${round}`,
        kind: 'llm',
        checkpointId: checkpoint.id,
        round,
        output: {
          mode: 'llm-step',
          stepId: `ralph-round-${round}`,
          title: `ralph-round-${round}`,
          phase: 'verification',
          text: verification.reason ?? `Verification ${verification.status}.`,
          sections: {
            verification: verification.reason ?? `Verification ${verification.status}.`,
          },
          nextAction: verification.nextAction,
          incompleteReason: verification.reason,
          evidence: verification.evidence ?? [],
        },
      }),
    );
  }
}
