import {
  createAgent,
  type Runner,
  ToolExecutor,
  ToolRegistry,
  type AgentEvent,
  type AgentRunRequest,
  type AgentRunResult,
  type AgentRuntime,
  type ContextFragmentInput,
  type ToolDefinition,
  type ToolExecutorLike,
  type ToolRegistryLike,
} from '@agent-flow/core';
import type { TokenUsage, UnifiedMessage } from '@agent-flow/core/messages';
import type { StructuredLogger, Tracer } from '@agent-flow/events';
import { type MemoryService, type RecalledMemory } from '@agent-flow/memory';
import type {
  AdapterMessage,
  AdapterTokenUsage,
  FinishReason,
  MessagePart,
  ToolSpec,
} from '@agent-flow/model-adapters/types';
import { registerBuiltinTools } from '@agent-flow/tools-impl';
import type {
  ChatStreamEvent,
  ChatStreamMessageDeltaEvent,
  RuntimeChatInput,
  RuntimeGateway,
} from '../contracts/api.js';
import {
  extractApprovalRequiredFromError,
  parseApprovalRequiredErrorMessage,
} from '../lib/approval.js';
import { AsyncQueue } from '../lib/async-queue.js';
import { createTextMessage, createUnifiedMessage, summarizeMessages } from '../lib/messages.js';
import { CODING_EFFICIENCY_SYSTEM_PROMPT } from '../prompts/coding-efficiency.js';
import { createToolResultOutputEnhancer } from '../tools/result-output-enhancer.js';
import type { ModelAdapterService } from './model-adapter-service.js';
import { registerRunnerBackedTools } from './runner-backed-tools.js';
import type { RunnerDispatchService } from './runner-dispatch-service.js';

export interface CreateCoreAgentRuntimeOptions {
  cwd?: string;
  runners?: Runner[];
  runnerDispatchService?: RunnerDispatchService;
}

export interface CoreAgentRuntimeBundle {
  runtime: AgentRuntime;
  toolRegistry: ToolRegistry;
  toolExecutor: ToolExecutor;
}

export function createCoreAgentRuntimeBundle(options: CreateCoreAgentRuntimeOptions = {}): CoreAgentRuntimeBundle {
  const toolRegistry = new ToolRegistry();
  registerBuiltinTools(toolRegistry, {
    cwd: options.cwd ?? process.cwd(),
  });
  if (options.runnerDispatchService) {
    registerRunnerBackedTools(toolRegistry, options.runnerDispatchService);
  }
  const toolExecutor = new ToolExecutor(toolRegistry);
  const runtime = createAgent({
    toolRegistry,
    toolExecutor,
    runners: options.runners,
  });
  return {
    runtime,
    toolRegistry,
    toolExecutor,
  };
}

export function createCoreAgentRuntime(options: CreateCoreAgentRuntimeOptions = {}): AgentRuntime {
  return createCoreAgentRuntimeBundle(options).runtime;
}

export interface CoreRuntimeGatewayOptions {
  runtime: AgentRuntime;
  memoryService: MemoryService;
  modelAdapterService?: ModelAdapterService;
  toolRegistry?: ToolRegistryLike;
  toolExecutor?: ToolExecutorLike;
  logger?: StructuredLogger;
  tracer?: Tracer;
}

export class CoreRuntimeGateway implements RuntimeGateway {
  private readonly runtime: AgentRuntime;
  private readonly memoryService: MemoryService;
  private readonly modelAdapterService?: ModelAdapterService;
  private readonly toolRegistry?: ToolRegistryLike;
  private readonly toolExecutor?: ToolExecutorLike;
  private readonly logger?: StructuredLogger;
  private readonly tracer?: Tracer;

  constructor(options: CoreRuntimeGatewayOptions) {
    this.runtime = options.runtime;
    this.memoryService = options.memoryService;
    this.modelAdapterService = options.modelAdapterService;
    this.toolRegistry = options.toolRegistry;
    this.toolExecutor = options.toolExecutor;
    this.logger = options.logger;
    this.tracer = options.tracer;
  }

  getRuntime() {
    return this.runtime;
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
          const finalResponse = await this.streamModelResponse(input, recalled, parentUuid, (event) => {
            queue.push(event);
          });
          if (!finalResponse) {
            const response = await this.generateModelResponse(input, recalled, parentUuid);
            queue.push(toMessageEvent(response));
            await span?.end({
              status: 'succeeded',
              mode: 'model-generation',
            });
          } else {
            await span?.end({
              status: 'succeeded',
              mode: 'model-stream',
            });
          }
          return;
        }

        const eventCountByType = new Map<string, number>();
        const runRequest = buildAgentRequest(input, recalled, runnerDirective);

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
          const fallbackResponse = await this.generateModelResponse(input, recalled, parentUuid);
          queue.push(toMessageEvent(fallbackResponse));
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
                },
              },
            }),
          ),
        );

        await span?.end({
          status: result.status,
          eventCount: result.events.length,
        });
      } catch (error) {
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
      } finally {
        queue.close();
      }
    })();

    for await (const event of queue) {
      yield event;
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


  private async streamModelResponse(
    input: RuntimeChatInput,
    recalled: RecalledMemory[],
    parentUuid: string | null,
    onEvent: (event: ChatStreamEvent) => void,
  ): Promise<UnifiedMessage | null> {
    if (!this.modelAdapterService) {
      throw new Error('Model adapter service is not configured for chat generation.');
    }

    const adapter = await this.modelAdapterService.createAdapter(input.modelId);
    const messages = toAdapterMessages(input.history);
    const tools = this.getModelToolSpecs();
    const message = createTextMessage('assistant', '', {
      parentUuid,
      metadata: {
        modelId: String(input.modelId),
        provider: adapter.provider,
        extensions: {
          modelId: input.modelId,
          model: input.model,
          requestId: input.requestId,
          streamState: 'streaming',
        },
      },
    });

    let responseText = '';
    let finishReason: FinishReason = 'stop';
    let usage: AdapterTokenUsage | undefined;
    let hasStreamed = false;
    let streamCompleted = false;
    let finalMessage = message;

    try {
      for (let round = 0; round < MAX_MODEL_TOOL_ROUNDS; round += 1) {
        responseText = '';
        const toolCalls: ModelToolCall[] = [];
        const assistantParts: MessagePart[] = [];
        const currentMessage = round === 0 ? message : createTextMessage('assistant', '', {
          parentUuid,
          metadata: {
            modelId: String(input.modelId),
            provider: adapter.provider,
            extensions: {
              modelId: input.modelId,
              model: input.model,
              requestId: input.requestId,
              streamState: 'streaming',
              toolRound: round,
            },
          },
        });
        finalMessage = currentMessage;

        for await (const event of adapter.stream({
          model: input.model,
          messages,
          systemPrompt: buildSystemPrompt(input, recalled),
          tools,
          toolChoice: tools.length > 0 ? 'auto' : 'none',
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
        })) {
          if (event.type === 'text-delta') {
            if (event.delta.length === 0) {
              continue;
            }
            responseText += event.delta;
            hasStreamed = true;
            currentMessage.timestamp = new Date().toISOString();
            currentMessage.metadata = {
              ...currentMessage.metadata,
              extensions: {
                ...(currentMessage.metadata.extensions ?? {}),
                streamState: 'streaming',
                finishReason,
              },
            };
            onEvent(
              toMessageDeltaEvent(currentMessage, event.delta),
            );
          } else if (event.type === 'tool-call-end') {
            toolCalls.push({
              callId: event.callId,
              toolName: event.toolName,
              args: event.args,
            });
          } else if (event.type === 'finish') {
            finishReason = event.finishReason;
            usage = event.usage;
          } else if (event.type === 'error') {
            throw new Error(event.message);
          }
        }

        if (responseText.trim().length > 0) {
          assistantParts.push({ type: 'text', text: responseText });
        }

        for (const toolCall of toolCalls) {
          assistantParts.push({
            type: 'tool-call',
            callId: toolCall.callId,
            toolName: toolCall.toolName,
            args: toolCall.args,
          });
        }

        if (assistantParts.length > 0) {
          messages.push(createAdapterAssistantMessage(assistantParts, messages.at(-1)?.id ?? null));
        }

        if (toolCalls.length === 0) {
          streamCompleted = true;
          break;
        }

        const toolResultParts = await Promise.all(
          toolCalls.map((toolCall, index) => this.executeModelToolCall(input, toolCall, index)),
        );
        messages.push(createAdapterToolMessage(toolResultParts, messages.at(-1)?.id ?? null));
        hasStreamed = true;
      }
    } catch (error) {
      if (error instanceof ApprovalRequiredError) {
        throw error;
      }
      if (!hasStreamed) {
        return null;
      }
      throw error;
    }

    if (!streamCompleted) {
      return null;
    }

    if (responseText.trim().length === 0) {
      responseText = 'The model returned no text for this turn.';
    }
    finalMessage.content = [{ type: 'text', text: responseText }];
    finalMessage.timestamp = new Date().toISOString();
    finalMessage.metadata = {
      ...finalMessage.metadata,
      ...(usage ? { tokenUsage: toUnifiedTokenUsage(usage) } : {}),
      extensions: {
        ...(finalMessage.metadata.extensions ?? {}),
        streamState: 'done',
        finishReason,
      },
    };
    onEvent(toMessageEvent({ ...finalMessage, content: [...finalMessage.content], metadata: { ...finalMessage.metadata } }));

    this.logger?.info('chat.turn.completed', 'model chat stream completed', {
      attributes: {
        sessionId: input.session.sessionId,
        modelId: input.modelId,
        model: input.model,
        provider: adapter.provider,
        finishReason,
      },
    });

    return finalMessage;
  }

  private getModelToolSpecs(): ToolSpec[] {
    if (!this.toolRegistry) {
      return [];
    }

    return this.toolRegistry
      .list()
      .filter(isModelVisibleTool)
      .map((tool) => ({
        name: MODEL_TOOL_NAME_BY_INTERNAL.get(tool.schema.name) ?? tool.schema.name,
        description: tool.schema.description,
        inputSchema: toModelToolSchema(tool.schema.input),
      }));
  }

  private async executeModelToolCall(
    input: RuntimeChatInput,
    toolCall: ModelToolCall,
    index: number,
  ): Promise<Extract<MessagePart, { type: 'tool-result' }>> {
    const internalToolName = INTERNAL_TOOL_NAME_BY_MODEL.get(toolCall.toolName) ?? toolCall.toolName;
    const toolInput = isPlainObject(toolCall.args) ? toolCall.args : {};
    const stepId = `model_tool_${index + 1}`;
    const metadata = buildToolContextMetadata(input);
    if (!this.toolExecutor) {
      return {
        type: 'tool-result',
        callId: toolCall.callId,
        toolName: toolCall.toolName,
        result: { error: 'Tool executor is not configured.' },
        isError: true,
      };
    }

    const outputEnhancer = await createToolResultOutputEnhancer({
      toolExecutor: this.toolExecutor,
      toolName: internalToolName,
      toolInput,
      toolContext: {
        taskId: input.requestId,
        sessionId: input.session.sessionId,
        stepId,
        metadata,
      },
    });

    const result = await this.toolExecutor.execute(
      {
        name: internalToolName,
        input: toolInput,
      },
      {
        taskId: input.requestId,
        sessionId: input.session.sessionId,
        stepId,
        metadata,
      },
      {
        retries: 0,
      },
    );
    if (!result.ok) {
      const approval = parseApprovalRequiredErrorMessage(result.error ?? '');
      if (approval) {
        throw new ApprovalRequiredError(approval);
      }
    }

    let output: unknown = result.ok ? result.output : { error: result.error ?? 'Tool execution failed.' };
    if (result.ok && outputEnhancer) {
      output = await outputEnhancer.finalize(output);
    }

    return {
      type: 'tool-result',
      callId: toolCall.callId,
      toolName: toolCall.toolName,
      result: output,
      isError: !result.ok,
    };
  }
}

interface RunnerDirective {
  command: string;
  args: string[];
}

interface ModelToolCall {
  callId: string;
  toolName: string;
  args: unknown;
}

class ApprovalRequiredError extends Error {
  readonly approval: NonNullable<ReturnType<typeof parseApprovalRequiredErrorMessage>>;

  constructor(approval: NonNullable<ReturnType<typeof parseApprovalRequiredErrorMessage>>) {
    super(
      `Approval required before running high-risk command "${approval.cmd}" in "${approval.workdir}".`,
    );
    this.name = 'ApprovalRequiredError';
    this.approval = approval;
  }
}

const MODEL_TOOL_NAME_BY_INTERNAL = new Map<string, string>([
  ['fs.read', 'fs_read'],
  ['fs.write', 'fs_write'],
  ['fs.patch', 'fs_patch'],
  ['fs.list', 'fs_list'],
  ['fs.search', 'fs_search'],
  ['shell.exec', 'shell_exec'],
]);

const INTERNAL_TOOL_NAME_BY_MODEL = new Map(
  [...MODEL_TOOL_NAME_BY_INTERNAL.entries()].map(([internal, model]) => [model, internal]),
);

const MAX_MODEL_TOOL_ROUNDS = 4;

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

function buildToolContextMetadata(input: RuntimeChatInput): Record<string, unknown> {
  return {
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
  };
}

function isModelVisibleTool(tool: ToolDefinition): boolean {
  return MODEL_TOOL_NAME_BY_INTERNAL.has(tool.schema.name);
}

function toModelToolSchema(schema: ToolDefinition['schema']['input']): ToolSpec['inputSchema'] {
  return {
    ...schema,
    additionalProperties: false,
  };
}

function createAdapterAssistantMessage(parts: MessagePart[], parentId: string | null): AdapterMessage {
  return {
    id: `assistant_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    parentId,
    role: 'assistant',
    parts,
    createdAt: new Date().toISOString(),
  };
}

function createAdapterToolMessage(
  parts: Extract<MessagePart, { type: 'tool-result' }>[],
  parentId: string | null,
): AdapterMessage {
  return {
    id: `tool_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    parentId,
    role: 'tool',
    parts,
    createdAt: new Date().toISOString(),
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

function buildSystemPrompt(input: RuntimeChatInput, recalled: RecalledMemory[]): string {
  const lines = [
    input.session.systemPrompt?.trim() || CODING_EFFICIENCY_SYSTEM_PROMPT,
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

function toUnifiedTokenUsage(usage: AdapterTokenUsage): TokenUsage {
  return {
    promptTokens: usage.inputTokens,
    completionTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
    cacheReadTokens: usage.cacheReadTokens,
    cacheWriteTokens: usage.cacheWriteTokens,
  };
}

function extractApprovalFromAgentRunResult(
  result: AgentRunResult,
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

function toMessageEvent(message: UnifiedMessage): ChatStreamEvent {
  return {
    type: 'msg',
    msg: {
      ...message,
      content: [...message.content],
      metadata: cloneMessageMetadata(message.metadata),
    },
  };
}

function toApprovalRequiredEvent(
  approval: NonNullable<ReturnType<typeof parseApprovalRequiredErrorMessage>>,
): ChatStreamEvent {
  return {
    type: 'approval_req',
    approval,
  };
}

function toMessageDeltaEvent(
  message: UnifiedMessage,
  delta: string,
): ChatStreamMessageDeltaEvent {
  return {
    type: 'msg_delta',
    msg_id: message.uuid,
    delta,
  };
}

function cloneMessageMetadata(metadata: UnifiedMessage['metadata']): UnifiedMessage['metadata'] {
  return {
    ...metadata,
    extensions:
      metadata.extensions && typeof metadata.extensions === 'object'
        ? { ...metadata.extensions }
        : metadata.extensions,
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
