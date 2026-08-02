import type { ChatMessage } from './types';

export interface ChatTurn {
  id: string;
  user?: ChatMessage;
  summary?: Extract<ChatMessage, { type: 'thinking' }>;
  activities: ChatMessage[];
  responses: ChatMessage[];
}

export function groupMessagesIntoTurns(messages: ChatMessage[]): ChatTurn[] {
  const turns: ChatTurn[] = [];
  const byId = new Map<string, ChatTurn>();
  let fallback: ChatTurn | undefined;

  const ensure = (id: string): ChatTurn => {
    const existing = byId.get(id);
    if (existing) return existing;
    const created: ChatTurn = { id, activities: [], responses: [] };
    byId.set(id, created);
    turns.push(created);
    return created;
  };

  messages.forEach((message, index) => {
    const turnId = message.metadata?.turnId;
    if (message.role === 'user') {
      fallback = ensure(turnId ?? `legacy-${message.uuid}`);
      fallback.user = message;
      return;
    }
    const turn = turnId ? ensure(turnId) : fallback ?? ensure(`orphan-${index}`);
    if (message.type === 'thinking' && message.kind === 'summary') {
      turn.summary = message;
    } else if (message.type === 'thinking' || message.type === 'tool_execution' || message.role === 'tool') {
      turn.activities.push(message);
    } else {
      turn.responses.push(message);
    }
  });

  return turns;
}
