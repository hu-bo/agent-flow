import {
  createAgent,
  type Runner,
  ToolRegistry,
  type AgentEvent,
  type AgentRunRequest,
  type AgentRunResult,
  type AgentRuntime,
  type ContextFragmentInput,
} from '@agent-flow/core';
import type { UnifiedMessage } from '@agent-flow/core/messages';
import type { StructuredLogger, Tracer } from '@agent-flow/events';
import { type MemoryService, type RecalledMemory } from '@agent-flow/memory';
import type { AdapterMessage, AdapterTokenUsage, MessagePart } from '@agent-flow/model-adapters/types';
import { registerBuiltinTools } from '@agent-flow/tools-impl';
import type { RuntimeChatInput, RuntimeGateway } from '../contracts/api.js';
import { AsyncQueue } from '../lib/async-queue.js';
import { createTextMessage, createUnifiedMessage, summarizeMessages } from '../lib/messages.js';
import type { ModelAdapterService } from './model-adapter-service.js';

export interface CreateCoreAgentRuntimeOptions {
  cwd?: string;
  runners?: Runner[];
}

export function createCoreAgentRuntime(options: CreateCoreAgentRuntimeOptions = {}): AgentRuntime {
  const toolRegistry = new ToolRegistry();
  registerBuiltinTools(toolRegistry, {
    cwd: options.cwd ?? process.cwd(),
  });
  return createAgent({
    toolRegistry,
    runners: options.runners,
  });
}

export interface CoreRuntimeGatewayOptions {
  runtime: AgentRuntime;
  memoryService: MemoryService;
  modelAdapterService?: ModelAdapterService;
  logger?: StructuredLogger;
  tracer?: Tracer;
}

export class CoreRuntimeGateway implements RuntimeGateway {
  private readonly runtime: AgentRuntime;
  private readonly memoryService: MemoryService;
  private readonly modelAdapterService?: ModelAdapterService;
  private readonly logger?: StructuredLogger;
  private readonly tracer?: Tracer;

  constructor(options: CoreRuntimeGatewayOptions) {
    this.runtime = options.runtime;
    this.memoryService = options.memoryService;
    this.modelAdapterService = options.modelAdapterService;
    this.logger = options.logger;
    this.tracer = options.tracer;
  }

  getRuntime() {
    return this.runtime;
  }

  async *streamChat(input: RuntimeChatInput): AsyncGenerator<UnifiedMessage> {
    const span = this.tracer
      ? await this.tracer.startSpan('chat.turn', {
          attributes: {
            sessionId: input.session.sessionId,
            modelId: input.modelId,
            requestId: input.requestId,
          },
        })
      : undefined;

    const queue = new AsyncQueue<UnifiedMessage>();
    const parentUuid = input.history.at(-1)?.uuid ?? null;

    void (async () => {
      try {
        const recalledRaw = await this.memoryService.recall(input.message, {
          sessionId: input.session.sessionId,
          includeSessionMemory: true,
          limit: 4,
        });
        const recalled = recalledRaw.filter((memory) => !isRuntimeDiagnosticText(memory.text));
        const runnerDirective = parseRunnerDirective(input.message);

        if (!runnerDirective) {
          const response = await this.generateModelResponse(input, recalled, parentUuid);
          queue.push(response);
          await span?.end({
            status: 'succeeded',
            mode: 'model-generation',
          });
          return;
        }

        const eventCountByType = new Map<string, number>();
        const runRequest = buildAgentRequest(input, recalled, runnerDirective);

        const result = await this.runtime.run(runRequest, {
          onEvent: async (event) => {
            eventCountByType.set(event.type, (eventCountByType.get(event.type) ?? 0) + 1);
            const progressMessage = toProgressMessage(input, parentUuid, event);
            if (progressMessage) {
              queue.push(progressMessage);
            }
          },
        });

        const responseText = renderAssistantText({
          input,
          result,
          recalled,
          eventCountByType,
          runnerDirective,
        });

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
          createTextMessage('assistant', responseText, {
            parentUuid,
            metadata: {
              modelId: input.modelId,
              provider: 'core-runtime',
              extensions: {
                requestId: input.requestId,
                taskId: result.taskId,
                coreSessionId: result.sessionId,
                status: result.status,
                eventCount: result.events.length,
              },
            },
          }),
        );

        await span?.end({
          status: result.status,
          eventCount: result.events.length,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger?.error('chat.turn.failed', 'core runtime turn failed', {
          attributes: {
            sessionId: input.session.sessionId,
            modelId: input.modelId,
            requestId: input.requestId,
            error: message,
          },
        });
        await span?.fail(error);

        queue.push(
          createTextMessage('assistant', `Core runtime execution failed:\n${message}`, {
            parentUuid,
            metadata: {
              modelId: input.modelId,
              provider: 'core-runtime',
              extensions: {
                requestId: input.requestId,
                error: message,
              },
            },
          }),
        );
      } finally {
        queue.close();
      }
    })();

    for await (const message of queue) {
      yield message;
    }
  }

  private async generateModelResponse(
    input: RuntimeChatInput,
    recalled: RecalledMemory[],
    parentUuid: string | null,
  ): Promise<UnifiedMessage> {
    if (!this.modelAdapterService) {
      throw new Error('Model adapter service is not configured for chat generation.');
    }

    const adapter = await this.modelAdapterService.createAdapter(input.modelId);
    const messages = toAdapterMessages(input.history);
    const result = await adapter.generate({
      model: input.modelId,
      messages,
      systemPrompt: buildSystemPrompt(input, recalled),
      config: {
        maxOutputTokens: resolveMaxOutputTokens(input.reasoningEffort),
        temperature: 0.7,
      },
      metadata: {
        requestId: input.requestId,
        sessionId: input.session.sessionId,
        userId: input.userId,
      },
    });

    const responseText = getAdapterText(result.message.parts).trim();
    const fallbackText =
      responseText.length > 0
        ? responseText
        : 'The model returned no text for this turn.';

    this.logger?.info('chat.turn.completed', 'model chat turn completed', {
      attributes: {
        sessionId: input.session.sessionId,
        modelId: input.modelId,
        provider: adapter.provider,
        finishReason: result.finishReason,
      },
    });

    return createTextMessage('assistant', fallbackText, {
      parentUuid,
      metadata: {
        modelId: input.modelId,
        provider: adapter.provider,
        tokenUsage: toUnifiedTokenUsage(result.usage),
        extensions: {
          requestId: input.requestId,
          finishReason: result.finishReason,
        },
      },
    });
  }
}

interface RunnerDirective {
  command: string;
  args: string[];
}

function buildAgentRequest(
  input: RuntimeChatInput,
  recalled: RecalledMemory[],
  runnerDirective: RunnerDirective | undefined,
): AgentRunRequest {
  const recentHistory = input.history
    .filter((message) => !message.metadata?.isMeta && !isRuntimeDiagnosticMessage(message))
    .slice(-8);
  const initialContext: ContextFragmentInput[] = [
    ...recentHistory.map((message, index) => ({
      source: `history:${message.uuid}`,
      content: toContextText(message),
      priority: 10 + index,
      metadata: {
        role: message.role,
      },
    })),
    ...recalled.map((memory) => ({
      source: `memory:${memory.source}:${memory.id}`,
      content: memory.text,
      priority: 100,
      metadata: {
        score: memory.score,
        source: memory.source,
      },
    })),
  ];

  if (input.attachments.length > 0) {
    for (const attachment of input.attachments) {
      initialContext.push({
        source: `attachment:${attachment.mimeType}`,
        content: `Attachment mime=${attachment.mimeType}, base64Length=${attachment.data.length}`,
        priority: 40,
      });
    }
  }

  const historySummary = summarizeMessages(recentHistory);
  const goalParts: string[] = [`User request:\n${input.message}`];
  if (historySummary) {
    goalParts.push(`Recent history:\n${historySummary}`);
  }
  if (recalled.length > 0) {
    goalParts.push(
      `Relevant memory:\n${recalled
        .map((memory) => `- (${memory.source}, score=${memory.score.toFixed(2)}) ${memory.text}`)
        .join('\n')}`,
    );
  }
  if (runnerDirective) {
    goalParts.push(`Runner directive:\ncommand=${runnerDirective.command}\nargs=${runnerDirective.args.join(' ')}`);
  }

  return {
    goal: goalParts.join('\n\n'),
    strategy: 'plan',
    initialContext,
    runnerCommand: runnerDirective?.command,
    runnerArgs: runnerDirective?.args,
    metadata: {
      modelId: input.modelId,
      requestId: input.requestId,
      userId: input.userId,
      sessionId: input.session.sessionId,
      sessionCwd: input.session.cwd,
      cwd: input.session.cwd,
      userMessage: input.message,
      preferredRunnerId: input.preferredRunnerId,
      approveRiskyOps: Boolean(input.approveRiskyOps),
      approvalTicket:
        typeof input.approvalTicket === 'string' && input.approvalTicket.trim().length > 0
          ? input.approvalTicket.trim()
          : undefined,
      reasoningEffort: input.reasoningEffort ?? 'medium',
      attachmentCount: input.attachments.length,
    },
  };
}

function renderAssistantText(args: {
  input: RuntimeChatInput;
  result: AgentRunResult;
  recalled: RecalledMemory[];
  eventCountByType: Map<string, number>;
  runnerDirective: RunnerDirective | undefined;
}): string {
  const { input, result, recalled, eventCountByType, runnerDirective } = args;
  const latestOutput = extractLatestOutput(result);
  const eventSummary = [...eventCountByType.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([name, count]) => `${name}: ${count}`)
    .join(', ');

  const lines = [
    result.status === 'succeeded'
      ? 'Core runtime executed successfully.'
      : `Core runtime finished with status: ${result.status}.`,
    `Model: ${input.modelId}.`,
    runnerDirective
      ? `Runner command: ${runnerDirective.command} ${runnerDirective.args.join(' ')}`.trim()
      : 'No runner command was requested in this turn.',
    recalled.length > 0 ? `Memory hits used: ${recalled.length}.` : 'No recalled memory was injected.',
    `Agent events: ${result.events.length}${eventSummary ? ` (${eventSummary})` : ''}.`,
  ];

  if (latestOutput !== undefined) {
    lines.push(`Latest output:\n${formatUnknown(latestOutput)}`);
  }
  if (result.error) {
    lines.push(`Error detail: ${result.error}`);
  }

  return lines.join('\n\n');
}

function extractLatestOutput(result: AgentRunResult): unknown {
  const outputEntries = Object.entries(result.outputs);
  if (outputEntries.length === 0) {
    return undefined;
  }
  return outputEntries[outputEntries.length - 1]?.[1];
}

function formatUnknown(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function toContextText(message: UnifiedMessage): string {
  const text = message.content
    .map((part) => {
      if (part.type === 'text') return part.text;
      if (part.type === 'file') return `[file ${part.mimeType}, base64Length=${part.data.length}]`;
      if (part.type === 'tool-call') return `[tool-call ${part.toolName}]`;
      if (part.type === 'tool-result') return `[tool-result ${part.toolName}]`;
      if (part.type === 'image') {
        if (part.source.type === 'url') {
          return `[image url=${part.source.url}]`;
        }
        return `[image base64Length=${part.source.data.length}]`;
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');

  return `${message.role}: ${text}`.trim();
}

function parseRunnerDirective(message: string): RunnerDirective | undefined {
  const trimmed = message.trim();
  if (!trimmed.toLowerCase().startsWith('/run ')) {
    return undefined;
  }

  const commandLine = trimmed.slice(5).trim();
  if (!commandLine) {
    return undefined;
  }

  const tokens = tokenizeCommandLine(commandLine);
  if (tokens.length === 0) {
    return undefined;
  }

  return {
    command: tokens[0],
    args: tokens.slice(1),
  };
}

function tokenizeCommandLine(commandLine: string): string[] {
  const tokens = commandLine.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
  return tokens
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => {
      if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
        return token.slice(1, -1);
      }
      return token;
    });
}

function buildSystemPrompt(input: RuntimeChatInput, recalled: RecalledMemory[]): string {
  const lines = [
    input.session.systemPrompt?.trim() ||
      'You are Agent Flow, a helpful AI assistant. Answer the user directly and naturally.',
  ];

  if (recalled.length > 0) {
    lines.push(
      [
        'Relevant memory for this conversation:',
        ...recalled.map((memory) => `- ${memory.text}`),
      ].join('\n'),
    );
  }

  return lines.join('\n\n');
}

function toAdapterMessages(messages: UnifiedMessage[]): AdapterMessage[] {
  return messages
    .filter((message) => !message.metadata?.isMeta && !isRuntimeDiagnosticMessage(message))
    .map<AdapterMessage>((message) => ({
      id: message.uuid,
      parentId: message.parentUuid,
      role: message.role,
      createdAt: message.timestamp,
      parts: toAdapterParts(message),
      meta: {
        model: message.metadata.modelId,
        provider: message.metadata.provider,
      },
    }))
    .filter((message) => message.parts.length > 0);
}

function isRuntimeDiagnosticMessage(message: UnifiedMessage): boolean {
  if (message.metadata.provider !== 'core-runtime') {
    return false;
  }
  const text = message.content
    .filter((part): part is Extract<UnifiedMessage['content'][number], { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('\n');
  return isRuntimeDiagnosticText(text);
}

function isRuntimeDiagnosticText(text: string): boolean {
  return (
    text.includes('Core runtime executed successfully.') ||
    text.includes('Core runtime finished with status:') ||
    text.includes('No runner command was requested in this turn.') ||
    text.includes('Latest output:') ||
    text.includes('"mode": "placeholder"')
  );
}

function toAdapterParts(message: UnifiedMessage): MessagePart[] {
  const parts: MessagePart[] = [];
  for (const part of message.content) {
    if (part.type === 'text' && part.text.trim().length > 0) {
      parts.push({ type: 'text', text: part.text });
    } else if (part.type === 'image') {
      if (part.source.type === 'base64') {
        parts.push({
          type: 'image',
          source: {
            kind: 'base64',
            mediaType: part.source.mediaType,
            data: part.source.data,
          },
        });
      } else {
        parts.push({
          type: 'image',
          source: {
            kind: 'url',
            url: part.source.url,
          },
        });
      }
    } else if (part.type === 'file') {
      parts.push({
        type: 'text',
        text: `[Attached file: mime=${part.mimeType}, base64Length=${part.data.length}]`,
      });
    } else if (part.type === 'tool-call') {
      parts.push({
        type: 'tool-call',
        callId: part.toolCallId,
        toolName: part.toolName,
        args: part.input,
      });
    } else if (part.type === 'tool-result') {
      parts.push({
        type: 'tool-result',
        callId: part.toolCallId,
        toolName: part.toolName,
        result: part.output,
        isError: part.isError,
      });
    }
  }

  if (message.role === 'user' && parts.length === 0) {
    parts.push({ type: 'text', text: '[empty user message]' });
  }

  return parts;
}

function getAdapterText(parts: MessagePart[]): string {
  return parts
    .filter((part): part is Extract<MessagePart, { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

function resolveMaxOutputTokens(reasoningEffort: RuntimeChatInput['reasoningEffort']): number {
  if (reasoningEffort === 'high') return 4096;
  if (reasoningEffort === 'low') return 1024;
  return 2048;
}

function toUnifiedTokenUsage(usage: AdapterTokenUsage) {
  return {
    promptTokens: usage.inputTokens,
    completionTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
    cacheReadTokens: usage.cacheReadTokens,
    cacheWriteTokens: usage.cacheWriteTokens,
  };
}

function toProgressMessage(
  input: RuntimeChatInput,
  parentUuid: string | null,
  event: AgentEvent,
): UnifiedMessage | undefined {
  if (event.type === 'step.started') {
    return createTextMessage(
      'assistant',
      `Step started: ${String(event.payload.title ?? event.payload.stepId ?? 'unknown')}`,
      {
        parentUuid,
        metadata: {
          modelId: input.modelId,
          provider: 'core-runtime',
          isMeta: true,
          extensions: {
            streamEvent: 'step.started',
            payload: event.payload,
          },
        },
      },
    );
  }

  if (event.type === 'step.completed') {
    return createTextMessage('assistant', `Step completed: ${String(event.payload.stepId ?? 'unknown')}`, {
      parentUuid,
      metadata: {
        modelId: input.modelId,
        provider: 'core-runtime',
        isMeta: true,
        extensions: {
          streamEvent: 'step.completed',
          payload: event.payload,
        },
      },
    });
  }

  if (event.type === 'step.failed') {
    return createTextMessage(
      'assistant',
      `Step failed: ${String(event.payload.stepId ?? 'unknown')} - ${String(event.payload.error ?? 'unknown error')}`,
      {
        parentUuid,
        metadata: {
          modelId: input.modelId,
          provider: 'core-runtime',
          isMeta: true,
          extensions: {
            streamEvent: 'step.failed',
            payload: event.payload,
          },
        },
      },
    );
  }

  if (event.type !== 'runner.event') {
    return undefined;
  }

  const runnerEvent = (event.payload as { runnerEvent?: unknown }).runnerEvent;
  if (!runnerEvent || typeof runnerEvent !== 'object') {
    return undefined;
  }

  const eventType =
    typeof (runnerEvent as { type?: unknown }).type === 'string'
      ? (runnerEvent as { type: string }).type
      : 'unknown';

  return createUnifiedMessage({
    role: 'tool',
    parentUuid,
    content: [
      {
        type: 'tool-result',
        toolCallId: event.id,
        toolName: `runner.${eventType}`,
        output: runnerEvent,
        isError: eventType === 'error',
      },
    ],
    metadata: {
      modelId: input.modelId,
      provider: 'core-runtime',
      isMeta: true,
      extensions: {
        streamEvent: `runner.event.${eventType}`,
        payload: event.payload,
      },
    },
  });
}
