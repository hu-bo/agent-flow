import { describe, expect, it } from 'vitest';
import type { ChatMessage } from './types';
import { groupMessagesIntoTurns } from './turns';

function text(uuid: string, role: 'user' | 'assistant', turnId?: string): ChatMessage {
  return {
    uuid,
    parentUuid: null,
    role,
    type: 'text',
    text: uuid,
    timestamp: '2026-08-01T00:00:00.000Z',
    metadata: turnId ? { turnId } : {},
  };
}

describe('groupMessagesIntoTurns', () => {
  it('groups semantic turn IDs and keeps orphan legacy messages', () => {
    const turns = groupMessagesIntoTurns([
      text('orphan', 'assistant'),
      text('turn-a', 'user', 'turn-a'),
      text('answer', 'assistant', 'turn-a'),
    ]);
    expect(turns).toHaveLength(2);
    expect(turns[0]?.responses[0]?.uuid).toBe('orphan');
    expect(turns[1]).toMatchObject({ id: 'turn-a', user: { uuid: 'turn-a' } });
  });
});
