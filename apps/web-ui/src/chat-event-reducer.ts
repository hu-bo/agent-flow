import type { TokenUsage, UnifiedMessage } from '@agent-flow/core/messages';
import type { ApprovalRequest, ChatStreamEvent, SpecDocType } from '@agent-flow/web-contracts';

export interface ChatEventState {
  messages: UnifiedMessage[];
  usageByMessageId: Record<string, TokenUsage>;
  specDocuments: Partial<Record<SpecDocType, string>>;
  pendingApproval: ApprovalRequest | null;
  done: boolean;
  error: { code: string; message: string; details?: unknown } | null;
}

export function createChatEventState(messages: UnifiedMessage[] = []): ChatEventState {
  return {
    messages,
    usageByMessageId: extractUsageByMessageId(messages),
    specDocuments: {},
    pendingApproval: null,
    done: false,
    error: null,
  };
}

export function reduceChatEvent(state: ChatEventState, event: ChatStreamEvent): ChatEventState {
  switch (event.type) {
    case 'message.upsert':
      return { ...state, messages: upsertMessage(state.messages, event.message) };
    case 'message.delta':
      return {
        ...state,
        messages: appendMessageDelta(state.messages, event.messageId, event.delta, event.turnId),
      };
    case 'spec.document':
      return {
        ...state,
        specDocuments: { ...state.specDocuments, [event.docType]: event.content },
      };
    case 'approval.requested':
      return { ...state, pendingApproval: event.approval };
    case 'approval.resolved':
      return state.pendingApproval?.requestId === event.requestId
        ? { ...state, pendingApproval: null }
        : state;
    case 'usage':
      return {
        ...state,
        usageByMessageId: { ...state.usageByMessageId, ...event.usageByMessageId },
      };
    case 'error':
      return { ...state, error: event.error, done: true };
    case 'done':
      return { ...state, done: true };
  }
}

function upsertMessage(messages: UnifiedMessage[], message: UnifiedMessage): UnifiedMessage[] {
  const index = messages.findIndex((item) => item.uuid === message.uuid);
  if (index < 0) return [...messages, message];
  if (messages[index] === message) return messages;
  const next = [...messages];
  next[index] = message;
  return next;
}

function appendMessageDelta(
  messages: UnifiedMessage[],
  messageId: string,
  delta: string,
  turnId?: string,
): UnifiedMessage[] {
  const index = messages.findIndex((item) => item.uuid === messageId);
  if (index < 0) {
    return [...messages, {
      uuid: messageId,
      parentUuid: null,
      role: 'assistant',
      type: 'text',
      text: delta,
      timestamp: '',
      metadata: turnId ? { turnId } : {},
    }];
  }
  const current = messages[index];
  if (current.type !== 'text') return messages;
  const next = [...messages];
  next[index] = { ...current, text: `${current.text}${delta}` };
  return next;
}

function extractUsageByMessageId(messages: UnifiedMessage[]): Record<string, TokenUsage> {
  return messages.reduce<Record<string, TokenUsage>>((result, message) => {
    const usage = message.metadata?.tokenUsage;
    if (usage) result[message.uuid] = usage;
    return result;
  }, {});
}

