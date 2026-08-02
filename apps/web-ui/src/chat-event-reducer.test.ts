import { describe, expect, it } from 'vitest';
import type { UnifiedMessage } from '@agent-flow/core/messages';
import { createChatEventState, reduceChatEvent } from './chat-event-reducer';

const userMessage: UnifiedMessage = {
  uuid: '0123456789abcdef',
  parentUuid: null,
  role: 'user',
  type: 'text',
  text: 'hello',
  timestamp: '2026-08-01T00:00:00.000Z',
  metadata: { turnId: '0123456789abcdef' },
};

describe('chat event reducer', () => {
  it('deduplicates optimistic user messages by UUID', () => {
    const state = createChatEventState([userMessage]);
    const next = reduceChatEvent(state, { type: 'message.upsert', message: { ...userMessage } });
    expect(next.messages).toHaveLength(1);
  });

  it('creates and appends assistant deltas before the final upsert', () => {
    let state = reduceChatEvent(createChatEventState(), {
      type: 'message.delta',
      messageId: 'assistant',
      delta: 'hel',
      turnId: userMessage.uuid,
    });
    state = reduceChatEvent(state, { type: 'message.delta', messageId: 'assistant', delta: 'lo' });
    expect(state.messages[0]).toMatchObject({ type: 'text', text: 'hello' });
  });

  it('tracks spec documents, approval, usage, error and completion', () => {
    let state = createChatEventState();
    state = reduceChatEvent(state, {
      type: 'spec.document',
      messageId: 'spec',
      docType: 'requirements',
      content: '# Requirements',
      done: true,
    });
    state = reduceChatEvent(state, {
      type: 'approval.requested',
      approval: {
        requestId: 'appr_1',
        sessionId: 'session',
        runnerId: 'runner',
        scopeType: 'chat',
        scopeId: 'session',
        command: 'exec',
        workingDir: 'C:/workspace',
        risk: 'high',
      },
    });
    state = reduceChatEvent(state, {
      type: 'usage',
      usageByMessageId: { assistant: { promptTokens: 1, completionTokens: 2, totalTokens: 3 } },
    });
    state = reduceChatEvent(state, {
      type: 'approval.resolved',
      requestId: 'appr_1',
      decision: 'deny',
      approved: false,
    });
    state = reduceChatEvent(state, { type: 'done' });
    expect(state.specDocuments.requirements).toBe('# Requirements');
    expect(state.pendingApproval).toBeNull();
    expect(state.usageByMessageId.assistant?.totalTokens).toBe(3);
    expect(state.done).toBe(true);
  });
});
