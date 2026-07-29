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
import type { ApprovalRequiredPayload } from '../lib/approval.js';
import { createUnifiedMessage } from '../lib/messages.js';
import { isRuntimeDiagnosticMessage } from './runtime-diagnostics.js';

export const MODEL_TOOL_NAME_BY_INTERNAL = new Map<string, string>([
  ['fs.read', 'fs_read'],
  ['fs.write', 'fs_write'],
  ['fs.patch', 'fs_patch'],
  ['fs.multiPatch', 'fs_multi_patch'],
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
    } else if (part.type === 'thinking') {
      // Thinking cards are visible execution summaries, not prompt context for the next model turn.
      continue;
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

export function toThinkingEvent(message: UnifiedMessage): ChatStreamEvent {
  return {
    type: 'thinking',
    msg: {
      ...message,
      content: [...message.content],
      metadata: cloneMessageMetadata(message.metadata),
    },
  };
}

export function toApprovalRequiredEvent(
  approval: ApprovalRequiredPayload,
): ChatStreamEvent {
  return {
    type: 'approval_req',
    approval,
  };
}

export function toRuntimeEvent(event: AgentEvent): ChatStreamEvent | undefined {
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
  const payload = asRecord(event.payload) ?? {};
  const stepId = readString(payload.stepId);

  if (event.type === 'session.started') {
    return createProgressToolCallMessage(input, parentUuid, event.id, 'agent.session', {
      status: 'started',
      planId: readString(payload.planId) ?? 'unknown',
      strategy: readString(payload.strategy) ?? 'unknown',
    }, {
      streamEvent: event.type,
      payload: event.payload,
    });
  }

  if (event.type === 'session.replanned') {
    return createProgressToolResultMessage(
      input,
      parentUuid,
      event.id,
      'agent.replan',
      {
        status: 'replanned',
        attempt: payload.attempt,
        fromPlanId: readString(payload.fromPlanId),
        toPlanId: readString(payload.toPlanId),
        failedStepId: readString(payload.failedStepId),
        error: readString(payload.error),
      },
      false,
      {
        streamEvent: event.type,
        payload: event.payload,
      },
    );
  }

  if (event.type === 'session.verification') {
    return createProgressToolResultMessage(
      input,
      parentUuid,
      event.id,
      'agent.verification',
      {
        status: readString(payload.status) ?? 'unknown',
        round: payload.round,
        verifierName: readString(payload.verifierName),
        reason: readString(payload.reason),
        runner_id: readString(payload.runnerId),
        scope_type: readString(payload.scopeType),
        scope_id: readString(payload.scopeId),
        scope_label: readString(payload.scopeLabel),
        missingEvidence: payload.missingEvidence,
        evidence: payload.evidence,
        nextAction: readString(payload.nextAction),
        completionSignalObserved: payload.completionSignalObserved === true,
      },
      payload.status === 'blocked',
      {
        streamEvent: event.type,
        payload: event.payload,
      },
    );
  }

  if (event.type === 'session.completed') {
    return createProgressToolResultMessage(input, parentUuid, event.id, 'agent.session', {
      status: 'completed',
      checkpoints: payload.checkpoints,
      replanCount: payload.replanCount,
      rounds: payload.rounds,
      verification: payload.verification,
    }, false, {
      streamEvent: event.type,
      payload: event.payload,
    });
  }

  if (event.type === 'session.blocked') {
    return createProgressToolResultMessage(input, parentUuid, event.id, 'agent.session', {
      status: 'blocked',
      reason: readString(payload.reason) ?? 'verification blocked',
      rounds: payload.rounds,
      verifierName: readString(payload.verifierName),
      missingEvidence: payload.missingEvidence,
      nextAction: readString(payload.nextAction),
      verification: payload.verification,
    }, true, {
      streamEvent: event.type,
      payload: event.payload,
    });
  }

  if (event.type === 'session.failed') {
    return createProgressToolResultMessage(input, parentUuid, event.id, 'agent.session', {
      status: 'failed',
      error: readString(payload.error) ?? 'unknown error',
      replanCount: payload.replanCount,
      rounds: payload.rounds,
      verification: payload.verification,
      details: payload,
    }, true, {
      streamEvent: event.type,
      payload: event.payload,
    });
  }

  if (event.type === 'checkpoint.created') {
    return createProgressToolResultMessage(
      input,
      parentUuid,
      stepId ?? event.id,
      'agent.checkpoint',
      {
        status: 'created',
        stepId,
        title: readString(payload.title),
        kind: readString(payload.kind),
        checkpointId: readString(payload.checkpointId),
        ...(payload.output !== undefined ? { output: payload.output } : {}),
      },
      false,
      {
        streamEvent: event.type,
        payload: event.payload,
      },
    );
  }

  if (event.type === 'step.started') {
    return createProgressToolCallMessage(input, parentUuid, stepId ?? event.id, 'agent.step', {
      status: 'started',
      stepId: stepId ?? 'unknown',
      title: readString(payload.title) ?? 'step',
      kind: readString(payload.kind) ?? 'unknown',
    }, {
      streamEvent: event.type,
      payload: event.payload,
    });
  }

  if (event.type === 'step.completed') {
    return createProgressToolResultMessage(input, parentUuid, stepId ?? event.id, 'agent.step', {
      status: 'completed',
      stepId: stepId ?? 'unknown',
      title: readString(payload.title) ?? 'step',
      kind: readString(payload.kind) ?? 'unknown',
    }, false, {
      streamEvent: event.type,
      payload: event.payload,
    });
  }

  if (event.type === 'step.failed') {
    return createProgressToolResultMessage(input, parentUuid, stepId ?? event.id, 'agent.step', {
      status: 'failed',
      stepId: stepId ?? 'unknown',
      title: readString(payload.title) ?? 'step',
      kind: readString(payload.kind) ?? 'unknown',
      error: readString(payload.error) ?? 'unknown error',
      errorDetails: payload.errorDetails ?? undefined,
    }, true, {
      streamEvent: event.type,
      payload: event.payload,
    });
  }

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
        payload: event.payload,
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
        payload: event.payload,
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
        session_id: readString(payload.session_id),
        cmd: readString(payload.cmd),
        workdir: readString(payload.workdir),
        risk: readString(payload.risk) ?? 'high',
        reason: readString(payload.reason),
      },
      false,
      {
        streamEvent: event.type,
        payload: event.payload,
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
        session_id: readString(payload.session_id),
        cmd: readString(payload.cmd),
        workdir: readString(payload.workdir),
        ticketId: readString(payload.ticketId),
        authorizationSource: readString(payload.authorizationSource),
        grantId: readString(payload.grantId),
        reason: readString(payload.reason),
      },
      payload.approved !== true,
      {
        streamEvent: event.type,
        payload: event.payload,
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
        payload: event.payload,
      },
    );
  }

  // Keep runner sub-events visible for detailed trace UI; the client should aggregate them.
  if (eventType === 'stdout' || eventType === 'stderr' || eventType === 'progress') {
    return createProgressToolResultMessage(
      input,
      parentUuid,
      runnerToolCallId,
      'runner.exec',
      runnerEvent,
      false,
      {
        streamEvent: `runner.event.${eventType}`,
        payload: event.payload,
      },
    );
  }

  return createProgressToolResultMessage(
    input,
    parentUuid,
    runnerToolCallId,
    'runner.exec',
    runnerEvent,
    eventType === 'error',
    {
      streamEvent: `runner.event.${eventType}`,
      payload: event.payload,
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
  return createUnifiedMessage({
    role: 'tool',
    parentUuid,
    content: [
      {
        type: 'tool-call',
        toolCallId,
        toolName,
        input: toolInput,
      },
    ],
    metadata: {
      modelId: String(input.modelId),
      provider: 'core-runtime',
      isMeta: true,
      extensions: {
        modelId: input.modelId,
        model: input.model,
        ...extensions,
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
  return createUnifiedMessage({
    role: 'tool',
    parentUuid,
    content: [
      {
        type: 'tool-result',
        toolCallId,
        toolName,
        output,
        isError,
      },
    ],
    metadata: {
      modelId: String(input.modelId),
      provider: 'core-runtime',
      isMeta: true,
      extensions: {
        modelId: input.modelId,
        model: input.model,
        ...extensions,
      },
    },
  });
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}
