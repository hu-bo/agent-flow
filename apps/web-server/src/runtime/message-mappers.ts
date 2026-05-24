import type { AgentEvent, ToolDefinition } from '@agent-flow/core';
import type { TokenUsage, UnifiedMessage } from '@agent-flow/core/messages';
import type {
  AdapterMessage,
  AdapterTokenUsage,
  MessagePart,
  ToolSpec,
} from '@agent-flow/model-adapters/types';
import type {
  ChatStreamEvent,
  ChatStreamMessageDeltaEvent,
  RuntimeChatInput,
} from '../contracts/api.js';
import type { parseApprovalRequiredErrorMessage } from '../lib/approval.js';
import { createTextMessage, createUnifiedMessage } from '../lib/messages.js';
import { isRuntimeDiagnosticMessage } from './runtime-diagnostics.js';

export const MODEL_TOOL_NAME_BY_INTERNAL = new Map<string, string>([
  ['fs.read', 'fs_read'],
  ['fs.write', 'fs_write'],
  ['fs.patch', 'fs_patch'],
  ['fs.list', 'fs_list'],
  ['fs.search', 'fs_search'],
  ['shell.exec', 'shell_exec'],
]);

export const INTERNAL_TOOL_NAME_BY_MODEL = new Map(
  [...MODEL_TOOL_NAME_BY_INTERNAL.entries()].map(([internal, model]) => [model, internal]),
);

export function isModelVisibleTool(tool: ToolDefinition): boolean {
  return MODEL_TOOL_NAME_BY_INTERNAL.has(tool.schema.name);
}

export function toModelToolSchema(schema: ToolDefinition['schema']['input']): ToolSpec['inputSchema'] {
  return {
    ...schema,
    additionalProperties: false,
  };
}

export function createAdapterAssistantMessage(parts: MessagePart[], parentId: string | null): AdapterMessage {
  return {
    id: `assistant_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    parentId,
    role: 'assistant',
    parts,
    createdAt: new Date().toISOString(),
  };
}

export function createAdapterToolMessage(
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

export function toAdapterMessages(messages: UnifiedMessage[]): AdapterMessage[] {
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

export function toAdapterParts(message: UnifiedMessage): MessagePart[] {
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

export function getAdapterText(parts: MessagePart[]): string {
  return parts
    .filter((part): part is Extract<MessagePart, { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

export function toUnifiedTokenUsage(usage: AdapterTokenUsage): TokenUsage {
  return {
    promptTokens: usage.inputTokens,
    completionTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
    cacheReadTokens: usage.cacheReadTokens,
    cacheWriteTokens: usage.cacheWriteTokens,
  };
}

export function toMessageEvent(message: UnifiedMessage): ChatStreamEvent {
  return {
    type: 'msg',
    msg: {
      ...message,
      content: [...message.content],
      metadata: cloneMessageMetadata(message.metadata),
    },
  };
}

export function toApprovalRequiredEvent(
  approval: NonNullable<ReturnType<typeof parseApprovalRequiredErrorMessage>>,
): ChatStreamEvent {
  return {
    type: 'approval_req',
    approval,
  };
}

export function toMessageDeltaEvent(
  message: UnifiedMessage,
  delta: string,
): ChatStreamMessageDeltaEvent {
  return {
    type: 'msg_delta',
    msg_id: message.uuid,
    delta,
  };
}

export function cloneMessageMetadata(metadata: UnifiedMessage['metadata']): UnifiedMessage['metadata'] {
  return {
    ...metadata,
    extensions:
      metadata.extensions && typeof metadata.extensions === 'object'
        ? { ...metadata.extensions }
        : metadata.extensions,
  };
}

export function toProgressMessage(
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
