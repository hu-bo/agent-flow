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
import { createToolExecutionMessage } from '../lib/messages.js';
import { isRuntimeDiagnosticMessage } from './runtime-diagnostics.js';

export const MODEL_TOOL_NAME_BY_INTERNAL = new Map<string, string>([
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

  if (message.type === 'text') {
    if (message.text.trim().length > 0) {
      parts.push({ type: 'text', text: message.text });
    }
    for (const file of message.attachments ?? []) {
      parts.push({
        type: 'text',
        text: `[Attached file: mime=${file.mimeType}, base64Length=${file.data.length}]`,
      });
    }
  } else if (message.type === 'image') {
    if (message.source.type === 'base64') {
      parts.push({
        type: 'image',
        source: {
          kind: 'base64',
          mediaType: message.source.mediaType,
          data: message.source.data,
        },
      });
    } else {
      parts.push({
        type: 'image',
        source: {
          kind: 'url',
          url: message.source.url,
        },
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
      metadata: cloneMessageMetadata(message.metadata),
    },
  };
}

export function toThinkingEvent(message: UnifiedMessage): ChatStreamEvent {
  return {
    type: 'thinking',
    msg: {
      ...message,
      metadata: cloneMessageMetadata(message.metadata),
    },
  };
}

export function toRuntimeEvent(event: AgentEvent): ChatStreamEvent | undefined {
  if (event.type !== 'approval_request' && event.type !== 'approval_response') {
    return undefined;
  }

  return {
    type: 'runtime_event',
    event: {
      ...event,
      payload: { ...event.payload },
    },
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

function cloneMessageMetadata(metadata: UnifiedMessage['metadata']): UnifiedMessage['metadata'] {
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
  if (!isProductProgressEvent(event)) {
    return undefined;
  }

  const payload = asRecord(event.payload) ?? {};
  const stepId = readString(payload.stepId);

  if (event.type === 'tool.called') {
    const toolCallId = stepId ?? event.id;
    const toolName = readString(payload.tool) ?? 'unknown.tool';
    return createProgressToolCallMessage(
      input,
      parentUuid,
      toolCallId,
      toolName,
      payload.input ?? {},
      {
        streamEvent: event.type,
        stepId,
        title: readString(payload.title),
      },
    );
  }

  if (event.type === 'tool.result') {
    const toolCallId = stepId ?? event.id;
    const toolName = readString(payload.tool) ?? 'unknown.tool';
    const isError = payload.ok !== true;
    return createProgressToolResultMessage(
      input,
      parentUuid,
      toolCallId,
      toolName,
      payload.output ?? {
        ok: payload.ok === true,
        error: readString(payload.error),
      },
      isError,
      {
        streamEvent: event.type,
        stepId,
        title: readString(payload.title),
      },
    );
  }

  if (event.type === 'approval_request') {
    return createProgressToolResultMessage(
      input,
      parentUuid,
      readString(payload.requestId) ?? event.id,
      'runner.approval',
      {
        status: 'pending',
        requestId: readString(payload.requestId),
        sessionId: readString(payload.sessionId),
        command: readString(payload.command),
        workingDir: readString(payload.workingDir),
        risk: readString(payload.risk) ?? 'high',
        reason: readString(payload.reason),
      },
      false,
      {
        streamEvent: event.type,
        stepId: readString(payload.requestId),
        title: 'Approval request',
      },
    );
  }

  if (event.type === 'approval_response') {
    return createProgressToolResultMessage(
      input,
      parentUuid,
      readString(payload.requestId) ?? event.id,
      'runner.approval',
      {
        status: payload.approved === true ? 'approved' : 'denied',
        requestId: readString(payload.requestId),
        sessionId: readString(payload.sessionId),
        command: readString(payload.command),
        workingDir: readString(payload.workingDir),
        decision: readString(payload.decision),
        persistentGrantId: readString(payload.persistentGrantId),
        reason: readString(payload.reason),
      },
      payload.approved !== true,
      {
        streamEvent: event.type,
        stepId: readString(payload.requestId),
        title: 'Approval response',
      },
    );
  }

  if (event.type !== 'runner.event') {
    return undefined;
  }

  const runnerEvent = asRecord(payload.runnerEvent);
  if (!runnerEvent) {
    return undefined;
  }

  const eventType = readString(runnerEvent.type) ?? 'unknown';
  const runnerToolCallId = stepId ?? event.id;
  if (eventType === 'started') {
    const task = asRecord(runnerEvent.task);
    const command = readString(task?.command);
    const args = Array.isArray(task?.args) ? task.args.map((value) => String(value)) : [];
    return createProgressToolCallMessage(
      input,
      parentUuid,
      runnerToolCallId,
      'runner.exec',
      {
        command,
        args,
        task: runnerEvent.task ?? null,
      },
      {
        streamEvent: `runner.event.${eventType}`,
        stepId,
        title: readString(payload.title),
      },
    );
  }

  if (eventType === 'progress') {
    return createProgressToolResultMessage(
      input,
      parentUuid,
      runnerToolCallId,
      'runner.exec',
      runnerEvent,
      false,
      {
        streamEvent: `runner.event.${eventType}`,
        stepId,
        title: readString(payload.title),
      },
    );
  }

  return createProgressToolResultMessage(
    input,
    parentUuid,
    runnerToolCallId,
    'runner.exec',
    runnerEvent,
    isRunnerFailureEvent(eventType, runnerEvent),
    {
      streamEvent: `runner.event.${eventType}`,
      stepId,
      title: readString(payload.title),
    },
  );
}

function createProgressToolCallMessage(
  input: RuntimeChatInput,
  parentUuid: string | null,
  toolCallId: string,
  toolName: string,
  toolInput: unknown,
  extensions: Record<string, unknown>,
): UnifiedMessage {
  const stepId = readString(extensions.stepId);
  return createToolExecutionMessage({
    uuid: progressMessageId(input.requestId, toolName, toolCallId),
    parentUuid,
    status: 'running',
    title: readString(extensions.title),
    stepId,
    tool: {
      callId: toolCallId,
      name: toolName,
      input: toolInput,
    },
    metadata: {
      modelId: String(input.modelId),
      provider: 'core-runtime',
      isMeta: true,
      turnId: input.turnId,
      extensions: {
        modelId: input.modelId,
        model: input.model,
        requestId: input.requestId,
        streamEvent: extensions.streamEvent,
      },
    },
  });
}

function createProgressToolResultMessage(
  input: RuntimeChatInput,
  parentUuid: string | null,
  toolCallId: string,
  toolName: string,
  output: unknown,
  isError: boolean,
  extensions: Record<string, unknown>,
): UnifiedMessage {
  const stepId = readString(extensions.stepId);
  const safeOutput = sanitizeProgressOutput(toolName, output);
  return createToolExecutionMessage({
    uuid: progressMessageId(input.requestId, toolName, toolCallId),
    parentUuid,
    status: isError ? 'error' : 'success',
    title: readString(extensions.title),
    stepId,
    tool: {
      callId: toolCallId,
      name: toolName,
      output: safeOutput,
      error: isError ? readString(asRecord(output)?.error) ?? readString(output) ?? `Tool execution failed: ${toolName}` : null,
    },
    metadata: {
      modelId: String(input.modelId),
      provider: 'core-runtime',
      isMeta: true,
      turnId: input.turnId,
      extensions: {
        modelId: input.modelId,
        model: input.model,
        requestId: input.requestId,
        streamEvent: extensions.streamEvent,
      },
    },
  });
}

function isProductProgressEvent(event: AgentEvent): boolean {
  if (
    event.type === 'tool.called' ||
    event.type === 'tool.result' ||
    event.type === 'approval_request' ||
    event.type === 'approval_response'
  ) {
    return true;
  }

  if (event.type !== 'runner.event') {
    return false;
  }

  const runnerEvent = asRecord(event.payload.runnerEvent);
  const runnerType = readString(runnerEvent?.type);
  return (
    runnerType === 'started' ||
    runnerType === 'progress' ||
    runnerType === 'result' ||
    runnerType === 'error' ||
    runnerType === 'completed'
  );
}

function isRunnerFailureEvent(eventType: string, runnerEvent: Record<string, unknown>): boolean {
  if (eventType === 'error') {
    return true;
  }
  if (eventType !== 'completed') {
    return false;
  }

  const status = readString(runnerEvent.status);
  return status === 'failed' || status === 'timed_out' || status === 'rejected' || status === 'cancelled';
}

function sanitizeProgressOutput(toolName: string, output: unknown): unknown {
  if (toolName === 'runner.approval') {
    return output;
  }
  if (toolName === 'fs.read') {
    return sanitizeRecordOutput(output, new Set(['content', 'size', 'bytesRead', 'byteOffset', 'byteLength']));
  }
  if (toolName === 'fs.list') {
    return sanitizeFsListOutput(output);
  }
  if (toolName === 'shell.exec' || toolName === 'runner.exec') {
    return sanitizeShellProgressOutput(output);
  }
  return sanitizeRecordOutput(output, new Set(['content', 'size', 'bytesRead', 'byteOffset', 'byteLength']));
}

function sanitizeShellProgressOutput(output: unknown): unknown {
  const rec = asRecord(output);
  if (!rec) {
    return output;
  }
  const sanitized = sanitizeRecordOutput(output, new Set(['stdoutBytes', 'stderrBytes', 'byteOffset'])) as Record<string, unknown>;
  if (isFileReadCommand(rec)) {
    hideStdout(sanitized);
  }

  const nestedResult = asRecord(sanitized.result);
  if (nestedResult && (isFileReadCommand(nestedResult) || isFileReadCommand(rec))) {
    hideStdout(nestedResult);
  }
  return sanitized;
}

function sanitizeFsListOutput(output: unknown): unknown {
  const rec = asRecord(output);
  if (!rec || !Array.isArray(rec.entries)) {
    return sanitizeRecordOutput(output, new Set(['size']));
  }
  return {
    ...rec,
    entries: rec.entries.map((entry) => sanitizeRecordOutput(entry, new Set(['size']))),
  };
}

function sanitizeRecordOutput(output: unknown, hiddenKeys: Set<string>): unknown {
  if (Array.isArray(output)) {
    return output.map((item) => sanitizeRecordOutput(item, hiddenKeys));
  }
  const rec = asRecord(output);
  if (!rec) {
    return output;
  }
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rec)) {
    if (hiddenKeys.has(key)) {
      continue;
    }
    next[key] = sanitizeRecordOutput(value, hiddenKeys);
  }
  return next;
}

function isFileReadCommand(output: Record<string, unknown>): boolean {
  const command = readString(output.command)?.toLowerCase() ?? '';
  const args = Array.isArray(output.args) ? output.args.map((arg) => String(arg).toLowerCase()) : [];
  const commandLine = [command, ...args].join(' ');
  const executable = command.replace(/\\/g, '/').split('/').pop() ?? command;
  if (executable === 'cat' || executable === 'type' || executable === 'get-content') {
    return true;
  }
  if ((executable === 'powershell.exe' || executable === 'powershell' || executable === 'pwsh.exe' || executable === 'pwsh') && args.some((arg) => arg.includes('get-content'))) {
    return true;
  }
  if ((executable === 'cmd.exe' || executable === 'cmd') && /\btype\b/.test(commandLine)) {
    return true;
  }
  if ((executable === 'sh' || executable === 'bash' || executable === 'zsh') && /\bcat\b/.test(commandLine)) {
    return true;
  }
  if (commandLine.includes('get-content')) {
    return true;
  }
  return false;
}

function hideStdout(output: Record<string, unknown>): void {
  const stdout = output.stdout;
  if (stdout !== undefined) {
    output.stdout = summarizeHiddenStream(stdout);
  }
}

function summarizeHiddenStream(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.trim() ? '[file content hidden]' : value;
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? [`[file content hidden: ${value.length} chunk(s)]`] : value;
  }
  return '[file content hidden]';
}

function progressMessageId(requestId: string, toolName: string, toolCallId: string): string {
  return `tool_${sanitizeMessageId(`${requestId}_${toolName}_${toolCallId}`)}`;
}

function sanitizeMessageId(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 120) || `${Date.now()}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}
