import {
  createAgent,
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
import { registerBuiltinTools } from '@agent-flow/tools-impl';
import type { RuntimeChatInput, RuntimeGateway } from '../contracts/api.js';
import { createTextMessage, summarizeMessages } from '../lib/messages.js';

export interface CreateCoreAgentRuntimeOptions {
  cwd?: string;
}

export function createCoreAgentRuntime(options: CreateCoreAgentRuntimeOptions = {}): AgentRuntime {
  const toolRegistry = new ToolRegistry();
  registerBuiltinTools(toolRegistry, {
    cwd: options.cwd ?? process.cwd(),
  });
  return createAgent({
    toolRegistry,
  });
}

export interface CoreRuntimeGatewayOptions {
  runtime: AgentRuntime;
  memoryService: MemoryService;
  logger?: StructuredLogger;
  tracer?: Tracer;
}

export class CoreRuntimeGateway implements RuntimeGateway {
  private readonly runtime: AgentRuntime;
  private readonly memoryService: MemoryService;
  private readonly logger?: StructuredLogger;
  private readonly tracer?: Tracer;

  constructor(options: CoreRuntimeGatewayOptions) {
    this.runtime = options.runtime;
    this.memoryService = options.memoryService;
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

    try {
      const recalled = await this.memoryService.recall(input.message, {
        sessionId: input.session.sessionId,
        includeSessionMemory: true,
        limit: 4,
      });
      const runnerDirective = parseRunnerDirective(input.message);
      const eventCountByType = new Map<string, number>();

      const runRequest = buildAgentRequest(input, recalled, runnerDirective);
      const result = await this.runtime.run(runRequest, {
        onEvent: async (event) => {
          eventCountByType.set(event.type, (eventCountByType.get(event.type) ?? 0) + 1);
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

      yield createTextMessage('assistant', responseText, {
        parentUuid: input.history.at(-1)?.uuid ?? null,
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
      });

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

      yield createTextMessage(
        'assistant',
        `Core runtime execution failed:\n${message}`,
        {
          parentUuid: input.history.at(-1)?.uuid ?? null,
          metadata: {
            modelId: input.modelId,
            provider: 'core-runtime',
            extensions: {
              requestId: input.requestId,
              error: message,
            },
          },
        },
      );
    }
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
  const recentHistory = input.history.slice(-8);
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
      sessionId: input.session.sessionId,
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
