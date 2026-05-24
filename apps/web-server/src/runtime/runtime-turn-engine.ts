import type { AgentRuntime } from '@agent-flow/core';
import type { StructuredLogger, Tracer } from '@agent-flow/events';
import type { MemoryService, RecalledMemory } from '@agent-flow/memory';
import type { ChatStreamEvent, RuntimeChatInput } from '../contracts/api.js';
import { extractApprovalRequiredFromError, parseApprovalRequiredErrorMessage } from '../lib/approval.js';
import { AsyncQueue } from '../lib/async-queue.js';
import { createTextMessage } from '../lib/messages.js';
import { ApprovalRequiredError } from './approval-error.js';
import { toApprovalRequiredEvent, toMessageEvent, toProgressMessage } from './message-mappers.js';
import { ModelChatDriver } from './model-chat-driver.js';
import { buildAgentRequest } from './runtime-request-builder.js';
import { parseRunnerDirective, resolveRuntimeMode } from './runtime-router.js';
import { isRuntimeDiagnosticText } from './runtime-diagnostics.js';
import { extractRuntimeSteps, renderAssistantText } from './runtime-renderers.js';
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
    const runRequest = buildAgentRequest(input, recalled, runnerDirective, runtimeMode);

    const result = await this.runtime.run(runRequest, {
      onEvent: async (event) => {
        eventCountByType.set(event.type, (eventCountByType.get(event.type) ?? 0) + 1);
        const progressMessage = toProgressMessage(input, parentUuid, event);
        if (progressMessage) {
          queue.push(toMessageEvent(progressMessage));
        }
      },
    });
    const approvalFromResult = extractApprovalFromAgentRunResult(result);
    if (approvalFromResult) {
      queue.push(toApprovalRequiredEvent(approvalFromResult));
      await span?.end({
        status: 'succeeded',
        mode: 'approval-required',
        eventCount: result.events.length,
      });
      return;
    }

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

    this.logger?.info('chat.turn.completed', 'core runtime turn completed', {
      attributes: {
        sessionId: input.session.sessionId,
        taskId: result.taskId,
        coreSessionId: result.sessionId,
        status: result.status,
        eventCount: result.events.length,
      },
    });

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
              runtimeMode,
              plannedSteps: extractRuntimeSteps(result),
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
    const approval = extractApprovalFromUnknown(error);
    if (approval) {
      queue.push(toApprovalRequiredEvent(approval));
      await span?.end({
        status: 'succeeded',
        mode: 'approval-required',
      });
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    this.logger?.error('chat.turn.failed', 'core runtime turn failed', {
      attributes: {
        sessionId: input.session.sessionId,
        modelId: input.modelId,
        model: input.model,
        requestId: input.requestId,
        error: message,
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

function extractApprovalFromAgentRunResult(
  result: Awaited<ReturnType<AgentRuntime['run']>>,
): NonNullable<ReturnType<typeof parseApprovalRequiredErrorMessage>> | null {
  if (typeof result.error !== 'string') {
    return null;
  }
  return parseApprovalRequiredErrorMessage(result.error);
}

function extractApprovalFromUnknown(
  error: unknown,
): NonNullable<ReturnType<typeof parseApprovalRequiredErrorMessage>> | null {
  if (error instanceof ApprovalRequiredError) {
    return error.approval;
  }
  return extractApprovalRequiredFromError(error);
}
