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
  PlanExecutor,
  Replanner,
  Runner,
  RunnerEvent,
  RunnerSelectionStrategy,
  RunnerTask,
  Scheduler,
  ToolExecutorLike
} from '../../types/index.js';

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
  checkpointStore: CheckpointStore;
  runnerRouter: RunnerRouter;
  replanner?: Replanner;
  maxReplans?: number;
}

class StepExecutionError extends Error {
  constructor(
    message: string,
    public readonly step: AgentStep
  ) {
    super(message);
    this.name = 'StepExecutionError';
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

    yield await emit(
      createEvent(session.taskId, session.id, 'session.started', {
        planId: plan.id,
        strategy: plan.strategy
      })
    );

    const maxReplans = Math.max(0, this.options.maxReplans ?? 1);
    let activePlan = plan;
    let replanAttempt = 0;

    while (true) {
      try {
        await this.executePlanSteps(activePlan, request, session, context, executeOptions, outputs, checkpoints, emit);

        yield await emit(
          createEvent(session.taskId, session.id, 'session.completed', {
            checkpoints: checkpoints.length,
            replanCount: replanAttempt
          })
        );

        return {
          taskId: session.taskId,
          sessionId: session.id,
          status: 'succeeded',
          outputs,
          checkpoints,
          events
        };
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
            replanCount: replanAttempt
          })
        );

        return {
          taskId: session.taskId,
          sessionId: session.id,
          status: 'failed',
          outputs,
          checkpoints,
          events,
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
    emit: (event: AgentEvent) => Promise<AgentEvent>
  ): Promise<void> {
      const graph = this.options.graphBuilder.build(plan);
      const batches = this.options.scheduler.schedule(graph);

      for (const batch of batches) {
        for (const step of batch) {
          const resolvedInput = resolveStepInput(step.input, step.consumes, outputs);
          await emit(
            createEvent(session.taskId, session.id, 'step.started', {
              stepId: step.id,
              title: step.title,
              kind: step.kind
            })
          );

          try {
            await this.options.guardrails.runBefore({
              session,
              request,
              step
            });

            let output: unknown;

            if (step.kind === 'llm') {
              output = {
                mode: 'placeholder',
                goal: request.goal,
                contextTokens: context.tokenUsed,
                stepInput: resolvedInput
              };
            } else if (step.kind === 'tool') {
              if (!step.toolName) {
                throw new Error(`Step "${step.id}" is a tool step but has no toolName.`);
              }
              await emit(
                createEvent(session.taskId, session.id, 'tool.called', {
                  stepId: step.id,
                  tool: step.toolName
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
                  metadata: request.metadata
                },
                {
                  retries: 1
                }
              );

              await emit(
                createEvent(session.taskId, session.id, 'tool.result', {
                  stepId: step.id,
                  tool: step.toolName,
                  ok: toolResult.ok,
                  error: toolResult.error
                })
              );

              if (!toolResult.ok) {
                throw new Error(toolResult.error ?? `Tool "${step.toolName}" failed.`);
              }
              output = toolResult.output;
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
                    runnerEvent
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
                stepTitle: step.title
              }
            });
            checkpoints.push(checkpoint);

            await emit(
              createEvent(session.taskId, session.id, 'checkpoint.created', {
                stepId: step.id,
                checkpointId: checkpoint.id
              })
            );

            await emit(
              createEvent(session.taskId, session.id, 'step.completed', {
                stepId: step.id
              })
            );
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            await emit(
              createEvent(session.taskId, session.id, 'step.failed', {
                stepId: step.id,
                error: message
              })
            );
            throw new StepExecutionError(message, step);
          }
        }
      }
  }
}
