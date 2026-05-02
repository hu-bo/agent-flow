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
            model: input.model,
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
        const shouldTrySemanticRuntime = shouldAttemptSemanticRuntime(input.message);

        if (!runnerDirective && !shouldTrySemanticRuntime) {
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

        if (!responseText) {
          const fallbackResponse = await this.generateModelResponse(input, recalled, parentUuid);
          queue.push(fallbackResponse);
          await span?.end({
            status: 'succeeded',
            mode: 'model-fallback',
            eventCount: result.events.length,
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
            model: input.model,
            requestId: input.requestId,
            error: message,
          },
        });
        await span?.fail(error);

        queue.push(
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
      model: input.model,
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
        modelId: input.modelId,
        model: input.model,
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
        model: input.model,
        provider: adapter.provider,
        finishReason: result.finishReason,
      },
    });

    return createTextMessage('assistant', fallbackText, {
      parentUuid,
      metadata: {
        modelId: String(input.modelId),
        provider: adapter.provider,
        tokenUsage: toUnifiedTokenUsage(result.usage),
        extensions: {
          modelId: input.modelId,
          model: input.model,
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
      model: input.model,
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
}): string | undefined {
  const { result } = args;
  const latestOutput = extractLatestOutput(result);

  if (result.status !== 'succeeded') {
    const detail = result.error || (latestOutput !== undefined ? formatUnknown(latestOutput) : 'unknown error');
    return `I couldn't complete the local task.\n\n${detail}`;
  }

  if (isPlaceholderOutput(latestOutput)) {
    return undefined;
  }

  const rendered = renderRuntimeOutput(latestOutput);
  if (rendered) {
    return rendered;
  }

  if (latestOutput !== undefined) {
    return formatUnknown(latestOutput);
  }

  return 'The local task finished successfully.';
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPlaceholderOutput(value: unknown): boolean {
  if (!isPlainObject(value)) {
    return false;
  }
  return value.mode === 'placeholder';
}

function getObjectString(value: Record<string, unknown>, key: string): string | undefined {
  const target = value[key];
  return typeof target === 'string' ? target : undefined;
}

function getObjectNumber(value: Record<string, unknown>, key: string): number | undefined {
  const target = value[key];
  return typeof target === 'number' && Number.isFinite(target) ? target : undefined;
}

function renderRuntimeOutput(output: unknown): string | undefined {
  if (output === null || output === undefined) {
    return undefined;
  }
  if (!isPlainObject(output)) {
    return formatUnknown(output);
  }

  if (Array.isArray(output.entries)) {
    return renderFsListOutput(output);
  }
  if (typeof output.content === 'string' && typeof output.path === 'string') {
    return renderFsReadOutput(output);
  }
  if (Array.isArray(output.matches)) {
    return renderFsSearchOutput(output);
  }
  if (Array.isArray(output.stdout) || Array.isArray(output.stderr)) {
    return renderShellExecOutput(output);
  }

  return formatUnknown(output);
}

function renderFsListOutput(output: Record<string, unknown>): string {
  const path = getObjectString(output, 'path') ?? '.';
  const total = getObjectNumber(output, 'total') ?? 0;
  const entries = Array.isArray(output.entries) ? output.entries : [];
  const previewLines = entries
    .slice(0, 40)
    .map((entry) => {
      if (!isPlainObject(entry)) {
        return `- ${formatUnknown(entry)}`;
      }
      const type = getObjectString(entry, 'type') ?? 'entry';
      const name = getObjectString(entry, 'name') ?? getObjectString(entry, 'path') ?? '(unknown)';
      const size = getObjectNumber(entry, 'size');
      const sizeLabel = typeof size === 'number' ? ` (${size} bytes)` : '';
      return `- [${type}] ${name}${sizeLabel}`;
    })
    .join('\n');

  const extra = total > 40 ? `\n... and ${total - 40} more.` : '';
  return [`Listed ${total} entries under: ${path}`, previewLines ? `\n${previewLines}${extra}` : ''].join('');
}

function renderFsReadOutput(output: Record<string, unknown>): string {
  const path = getObjectString(output, 'path') ?? '(unknown path)';
  const size = getObjectNumber(output, 'size');
  const sizeLabel = typeof size === 'number' ? `${size} bytes` : 'unknown size';
  const content = getObjectString(output, 'content') ?? '';
  const maxPreviewChars = 8000;
  const truncated = content.length > maxPreviewChars;
  const preview = truncated ? `${content.slice(0, maxPreviewChars)}\n\n... (truncated)` : content;

  return [`Read file: ${path} (${sizeLabel})`, '', preview || '(empty file)'].join('\n');
}

function renderFsSearchOutput(output: Record<string, unknown>): string {
  const path = getObjectString(output, 'path') ?? '.';
  const pattern = getObjectString(output, 'pattern') ?? '(pattern)';
  const total = getObjectNumber(output, 'total') ?? 0;
  const matches = Array.isArray(output.matches) ? output.matches : [];
  const previewLines = matches
    .slice(0, 40)
    .map((match) => {
      if (!isPlainObject(match)) {
        return `- ${formatUnknown(match)}`;
      }
      const file = getObjectString(match, 'path') ?? '(unknown file)';
      const line = getObjectNumber(match, 'line');
      const content = getObjectString(match, 'content') ?? '';
      const lineLabel = typeof line === 'number' ? `:${line}` : '';
      return `- ${file}${lineLabel} ${content}`;
    })
    .join('\n');
  const extra = total > 40 ? `\n... and ${total - 40} more.` : '';

  return [
    `Found ${total} matches for "${pattern}" under: ${path}`,
    previewLines ? `\n${previewLines}${extra}` : '',
  ].join('');
}

function renderShellExecOutput(output: Record<string, unknown>): string {
  const command = getObjectString(output, 'command') ?? 'command';
  const stdout = Array.isArray(output.stdout)
    ? output.stdout.filter((item): item is string => typeof item === 'string')
    : [];
  const stderr = Array.isArray(output.stderr)
    ? output.stderr.filter((item): item is string => typeof item === 'string')
    : [];

  const sections: string[] = [`Executed: ${command}`];
  if (stdout.length > 0) {
    sections.push(`STDOUT:\n${stdout.join('\n')}`);
  }
  if (stderr.length > 0) {
    sections.push(`STDERR:\n${stderr.join('\n')}`);
  }
  if (stdout.length === 0 && stderr.length === 0) {
    sections.push('(No output)');
  }
  return sections.join('\n\n');
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

function shouldAttemptSemanticRuntime(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) {
    return false;
  }

  if (isCapabilityQuestion(trimmed)) {
    return false;
  }

  if (/(list|ls|dir|tree|read|open|cat|show|search|find|grep)/i.test(trimmed)) {
    return true;
  }

  const zhKeywords = [
    '\u67e5\u770b',
    '\u770b\u770b',
    '\u770b\u4e0b',
    '\u8bfb\u53d6',
    '\u6253\u5f00',
    '\u5217\u51fa',
    '\u76ee\u5f55',
    '\u6587\u4ef6',
    '\u641c\u7d22',
    '\u67e5\u627e',
    '\u684c\u9762',
  ];
  return zhKeywords.some((keyword) => trimmed.includes(keyword));
}

function isCapabilityQuestion(message: string): boolean {
  const lowered = message.toLowerCase();
  const zhCapability = /你能|可以|能否|是否/.test(message);
  const zhQuestionEnding = /吗[？?]?$/.test(message);
  if (zhCapability && zhQuestionEnding) {
    return true;
  }

  const enCapability = /(can you|could you|are you able to|do you support)/i.test(lowered);
  const hasQuestionMark = /[?？]$/.test(message);
  return enCapability && hasQuestionMark;
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
        model:
          typeof message.metadata.extensions?.model === 'string'
            ? message.metadata.extensions.model
            : String(message.metadata.modelId ?? ''),
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
  if (event.type === 'step.started' || event.type === 'step.completed') {
    return undefined;
  }

  if (event.type === 'step.failed') {
    return createTextMessage(
      'assistant',
      `Step failed: ${String(event.payload.stepId ?? 'unknown')} - ${String(event.payload.error ?? 'unknown error')}`,
      {
        parentUuid,
        metadata: {
          modelId: String(input.modelId),
          provider: 'core-runtime',
          isMeta: true,
          extensions: {
            modelId: input.modelId,
            model: input.model,
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
      modelId: String(input.modelId),
      provider: 'core-runtime',
      isMeta: true,
      extensions: {
        modelId: input.modelId,
        model: input.model,
        streamEvent: `runner.event.${eventType}`,
        payload: event.payload,
      },
    },
  });
}
