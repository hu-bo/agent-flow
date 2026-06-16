import type { AgentEvent, AgentRuntime } from '@agent-flow/core';
import type { StructuredLogger, Tracer } from '@agent-flow/events';
import type { MemoryService, RecalledMemory } from '@agent-flow/memory';
import type { ChatStreamEvent, RuntimeChatInput } from '../contracts/api.js';
import { AsyncQueue } from '../lib/async-queue.js';
import { createTextMessage } from '../lib/messages.js';
import { toMessageEvent, toProgressMessage, toRuntimeEvent, toThinkingEvent } from './message-mappers.js';
import { ModelChatDriver } from './model-chat-driver.js';
import { buildAgentRequest } from './runtime-request-builder.js';
import { parseRunnerDirective, resolveRuntimeMode } from './runtime-router.js';
import { isRuntimeDiagnosticText } from './runtime-diagnostics.js';
import { extractRuntimeStepTraces, extractRuntimeSteps, renderAssistantText } from './runtime-renderers.js';
import { buildRuntimeThinkingMessage } from './runtime-thinking.js';
import {
  MAX_AUTONOMOUS_MODEL_TOOL_ROUNDS,
  type RunnerDirective,
  type RuntimeMode,
  type RuntimeModelContext,
} from './runtime-types.js';

export interface RuntimeTurnEngineOptions {
  runtime: AgentRuntime;
  memoryService: MemoryService;
  modelChatDriver: ModelChatDriver;
  logger?: StructuredLogger;
  tracer?: Tracer;
}

type RuntimeTurnSpan = Awaited<ReturnType<Tracer['startSpan']>>;

interface RuntimeEventProducerContext {
  input: RuntimeChatInput;
  queue: AsyncQueue<ChatStreamEvent>;
  parentUuid: string | null;
  span?: RuntimeTurnSpan;
}

export class RuntimeTurnEngine {
  private readonly runtime: AgentRuntime;
  private readonly memoryService: MemoryService;
  private readonly modelChatDriver: ModelChatDriver;
  private readonly logger?: StructuredLogger;
  private readonly tracer?: Tracer;

  constructor(options: RuntimeTurnEngineOptions) {
    this.runtime = options.runtime;
    this.memoryService = options.memoryService;
    this.modelChatDriver = options.modelChatDriver;
    this.logger = options.logger;
    this.tracer = options.tracer;
  }

  async *streamChat(input: RuntimeChatInput): AsyncGenerator<ChatStreamEvent> {
    const span = this.tracer
      ? await this.tracer.startSpan('chat.turn', {
          attributes: {
            sessionId: input.session.sessionId,
            modelId: input.modelId,
            model: input.model,
            requestId: input.requestId,
          },
        })
      : undefined;

    const queue = new AsyncQueue<ChatStreamEvent>();
    const parentUuid = input.history.at(-1)?.uuid ?? null;
    const producer = this.produceChatEvents({
      input,
      queue,
      parentUuid,
      span,
    });

    for await (const event of queue) {
      yield event;
    }

    await producer;
  }

  private async produceChatEvents(context: RuntimeEventProducerContext): Promise<void> {
    try {
      const recalled = await this.recallTurnMemory(context.input);
      const runnerDirective = parseRunnerDirective(context.input.message);
      const runtimeMode = resolveRuntimeMode(context.input, runnerDirective);

      if (runtimeMode === 'chat') {
        await this.handleChatMode(context, recalled);
        return;
      }

      await this.handleRuntimeMode(context, recalled, runnerDirective, runtimeMode);
    } catch (error) {
      await this.handleTurnFailure(context, error);
    } finally {
      context.queue.close();
    }
  }

  private async recallTurnMemory(input: RuntimeChatInput): Promise<RecalledMemory[]> {
    const recalledRaw = await this.memoryService.recall(input.message, {
      sessionId: input.session.sessionId,
      includeSessionMemory: true,
      limit: 4,
    });
    return recalledRaw.filter((memory) => !isRuntimeDiagnosticText(memory.text));
  }

  private async handleChatMode(
    context: RuntimeEventProducerContext,
    recalled: RecalledMemory[],
  ): Promise<void> {
    const { input, parentUuid, queue, span } = context;
    const finalResponse = await this.modelChatDriver.streamModelResponse(input, recalled, parentUuid, (event) => {
      queue.push(event);
    });

    if (!finalResponse) {
      const response = await this.modelChatDriver.generateModelResponse(input, recalled, parentUuid);
      queue.push(toMessageEvent(response));
      await span?.end({
        status: 'succeeded',
        mode: 'model-generation',
      });
      return;
    }

    await span?.end({
      status: 'succeeded',
      mode: 'model-stream',
    });
  }

  private async handleRuntimeMode(
    context: RuntimeEventProducerContext,
    recalled: RecalledMemory[],
    runnerDirective: RunnerDirective | undefined,
    runtimeMode: Exclude<RuntimeMode, 'chat'>,
  ): Promise<void> {
    const { input, parentUuid, queue, span } = context;
    const eventCountByType = new Map<string, number>();
    const seenEventIds = new Set<string>();
    const runtimeEvents: AgentEvent[] = [];
    const thinkingStartedAt = Date.now();
    const runRequest = buildAgentRequest(input, recalled, runnerDirective, runtimeMode);
    const recordRuntimeEvent = (event: AgentEvent): boolean => {
      if (seenEventIds.has(event.id)) {
        return false;
      }
      seenEventIds.add(event.id);
      runtimeEvents.push(event);
      eventCountByType.set(event.type, (eventCountByType.get(event.type) ?? 0) + 1);
      return true;
    };
    const emitRuntimeProgress = (event: AgentEvent) => {
      const progressMessage = toProgressMessage(input, parentUuid, event);
      if (progressMessage) {
        queue.push(toMessageEvent(progressMessage));
      }
    };
    const emitThinkingSnapshot = (result?: Awaited<ReturnType<AgentRuntime['run']>>) => {
      queue.push(
        toThinkingEvent(
          buildRuntimeThinkingMessage({
            input,
            parentUuid,
            runtimeMode,
            runnerDirective,
            events: runtimeEvents,
            result,
            startedAt: thinkingStartedAt,
          }),
        ),
      );
    };

    const result = await this.runtime.run(runRequest, {
      onEvent: async (event) => {
        const isNew = recordRuntimeEvent(event);
        // Emit raw runtime events for end-to-end traceability. Enable via LOG_LEVEL=debug.
        void this.logger?.debug('runtime.event', 'core runtime event', {
          traceId: span?.traceId,
          spanId: span?.spanId,
          attributes: {
            sessionId: input.session.sessionId,
            requestId: input.requestId,
            eventType: event.type,
            payload: event.payload,
          },
        });
        const runtimeStreamEvent = toRuntimeEvent(event);
        if (runtimeStreamEvent) {
          queue.push(runtimeStreamEvent);
        }
        emitRuntimeProgress(event);
        if (isNew && shouldRefreshThinking(event)) {
          emitThinkingSnapshot();
        }
      },
    });

    // Some executors expose fine-grained events only on the final result. Flush any events
    // missed by live onEvent delivery so the UI can always reconstruct the runtime trace.
    for (const event of result.events) {
      const isNew = recordRuntimeEvent(event);
      if (!isNew) {
        continue;
      }
      const runtimeStreamEvent = toRuntimeEvent(event);
      if (runtimeStreamEvent) {
        queue.push(runtimeStreamEvent);
      }
      emitRuntimeProgress(event);
      if (shouldRefreshThinking(event)) {
        emitThinkingSnapshot();
      }
    }
    emitThinkingSnapshot(result);

    const responseText = renderAssistantText({
      input,
      result,
      recalled,
      eventCountByType,
      runnerDirective,
    });

    if (!responseText) {
      await this.streamAutonomousModelFallback(context, recalled, {
        result,
        eventCountByType,
        runnerDirective,
      });
      return;
    }

    const eventTypeCounts = buildEventTypeCounts(result.events);
    const failure = result.status === 'succeeded' ? undefined : buildRuntimeFailureSummary(result);

    if (result.status === 'succeeded') {
      this.logger?.info('chat.turn.completed', 'core runtime turn completed', {
        attributes: {
          sessionId: input.session.sessionId,
          taskId: result.taskId,
          coreSessionId: result.sessionId,
          status: result.status,
          eventCount: result.events.length,
          eventTypeCounts,
        },
      });
    } else {
      this.logger?.error('chat.turn.failed', 'core runtime turn failed', {
        attributes: {
          sessionId: input.session.sessionId,
          modelId: input.modelId,
          model: input.model,
          requestId: input.requestId,
          taskId: result.taskId,
          coreSessionId: result.sessionId,
          status: result.status,
          error: result.error ?? failure?.reason ?? 'unknown runtime failure',
          eventCount: result.events.length,
          eventTypeCounts,
          failure,
        },
      });
      console.log('[core-runtime] chat.turn.failed', {
        requestId: input.requestId,
        sessionId: input.session.sessionId,
        taskId: result.taskId,
        coreSessionId: result.sessionId,
        status: result.status,
        error: result.error,
        failure,
        lastEvents: result.events.slice(-8).map((event) => ({
          type: event.type,
          payload: sanitizeErrorValue(event.payload),
        })),
      });
    }

    queue.push(
      toMessageEvent(
        createTextMessage('assistant', responseText, {
          parentUuid,
          metadata: {
            modelId: String(input.modelId),
            provider: 'core-runtime',
            extensions: {
              requestId: input.requestId,
              modelId: input.modelId,
              model: input.model,
              taskId: result.taskId,
              coreSessionId: result.sessionId,
              status: result.status,
              eventCount: result.events.length,
              rounds: result.rounds,
              verification: result.verification,
              runtimeMode,
              plannedSteps: extractRuntimeSteps(result),
              plannedStepDetails: extractRuntimeStepTraces(result),
              ...(failure ? { failure } : {}),
            },
          },
        }),
      ),
    );

    await span?.end({
      status: result.status,
      eventCount: result.events.length,
    });
  }

  private async streamAutonomousModelFallback(
    context: RuntimeEventProducerContext,
    recalled: RecalledMemory[],
    runtimeContext: RuntimeModelContext,
  ): Promise<void> {
    const { input, parentUuid, queue, span } = context;
    const finalResponse = await this.modelChatDriver.streamModelResponse(
      input,
      recalled,
      parentUuid,
      (event) => {
        queue.push(event);
      },
      {
        runtime: runtimeContext,
        maxToolRounds: MAX_AUTONOMOUS_MODEL_TOOL_ROUNDS,
      },
    );
    if (!finalResponse) {
      const fallbackResponse = await this.modelChatDriver.generateModelResponse(input, recalled, parentUuid, {
        runtime: runtimeContext,
      });
      queue.push(toMessageEvent(fallbackResponse));
    }
    await span?.end({
      status: 'succeeded',
      mode: 'autonomous-model-fallback',
      eventCount: runtimeContext.result.events.length,
    });
  }

  private async handleTurnFailure(
    context: RuntimeEventProducerContext,
    error: unknown,
  ): Promise<void> {
    const { input, parentUuid, queue, span } = context;
    const message = error instanceof Error ? error.message : String(error);
    this.logger?.error('chat.turn.failed', 'core runtime turn failed', {
      attributes: {
        sessionId: input.session.sessionId,
        modelId: input.modelId,
        model: input.model,
        requestId: input.requestId,
        error: message,
        errorDetails: serializeErrorForLog(error),
      },
    });
    await span?.fail(error);

    queue.push(
      toMessageEvent(
        createTextMessage('assistant', `Core runtime execution failed:\n${message}`, {
          parentUuid,
          metadata: {
            modelId: String(input.modelId),
            provider: 'core-runtime',
            extensions: {
              requestId: input.requestId,
              modelId: input.modelId,
              model: input.model,
              error: message,
            },
          },
        }),
      ),
    );
  }
}

function shouldRefreshThinking(event: AgentEvent): boolean {
  return (
    event.type === 'session.started' ||
    event.type === 'session.replanned' ||
    event.type === 'session.completed' ||
    event.type === 'session.failed' ||
    event.type === 'approval_request' ||
    event.type === 'approval_response' ||
    event.type === 'step.completed' ||
    event.type === 'step.failed' ||
    event.type === 'tool.result' ||
    event.type === 'checkpoint.created'
  );
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

function buildEventTypeCounts(events: AgentEvent[]): Record<string, number> {
  const counts = new Map<string, number>();
  for (const event of events) {
    counts.set(event.type, (counts.get(event.type) ?? 0) + 1);
  }
  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

function buildRuntimeFailureSummary(result: Awaited<ReturnType<AgentRuntime['run']>>): Record<string, unknown> {
  const latestEvent = result.events.at(-1);
  const sessionFailed = findLatestEvent(result.events, 'session.failed');
  const stepFailed = findLatestEvent(result.events, 'step.failed');
  const runnerErrorEvent = findLatestRunnerErrorEvent(result.events);
  const latestOutput = extractLatestOutput(result.outputs);

  const summary: Record<string, unknown> = {
    reason: result.error ?? readErrorFromPayload(sessionFailed?.payload) ?? readErrorFromPayload(stepFailed?.payload),
    latestEventType: latestEvent?.type,
    latestEventPayload: latestEvent ? sanitizeErrorValue(latestEvent.payload) : undefined,
    sessionFailed: sessionFailed ? sanitizeErrorValue(sessionFailed.payload) : undefined,
    stepFailed: stepFailed ? sanitizeErrorValue(stepFailed.payload) : undefined,
    runnerError: runnerErrorEvent ? sanitizeErrorValue(runnerErrorEvent.payload.runnerEvent) : undefined,
    latestOutput: latestOutput === undefined ? undefined : sanitizeErrorValue(latestOutput),
  };

  for (const key of Object.keys(summary)) {
    if (summary[key] === undefined) {
      delete summary[key];
    }
  }

  return summary;
}

function findLatestEvent(events: AgentEvent[], type: AgentEvent['type']): AgentEvent | undefined {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const current = events[index];
    if (current?.type === type) {
      return current;
    }
  }
  return undefined;
}

function findLatestRunnerErrorEvent(events: AgentEvent[]): AgentEvent | undefined {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const current = events[index];
    if (!current || current.type !== 'runner.event') {
      continue;
    }
    const runnerEvent = current.payload.runnerEvent;
    if (!runnerEvent || typeof runnerEvent !== 'object') {
      continue;
    }
    if ((runnerEvent as { type?: unknown }).type === 'error') {
      return current;
    }
  }
  return undefined;
}

function extractLatestOutput(outputs: Record<string, unknown>): unknown {
  const entries = Object.entries(outputs);
  if (entries.length === 0) {
    return undefined;
  }
  return entries[entries.length - 1]?.[1];
}

function readErrorFromPayload(payload: Record<string, unknown> | undefined): string | undefined {
  const raw = payload?.error;
  return typeof raw === 'string' && raw.trim().length > 0 ? raw : undefined;
}
