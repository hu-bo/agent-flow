import { describe, expect, it } from 'vitest';
import type { UnifiedMessage } from '@agent-flow/core/messages';
import { toAdapterMessages, toAdapterParts, toMessageEvent, toProgressMessage } from '../../apps/web-server/src/runtime/message-mappers.js';
import type { AgentEvent } from '@agent-flow/core';
import type { RuntimeChatInput } from '../../apps/web-server/src/contracts/api.js';

function message(overrides: Partial<UnifiedMessage>): UnifiedMessage {
  return {
    uuid: 'm1',
    parentUuid: null,
    role: 'user',
    content: [{ type: 'text', text: 'hello' }],
    timestamp: '2026-01-01T00:00:00.000Z',
    metadata: {},
    ...overrides,
  };
}

function runtimeInput(): RuntimeChatInput {
  return {
    session: {
      sessionId: 'chat_session_1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      modelId: 1,
      mode: 'vibe',
      cwd: '.',
      messageCount: 1,
    },
    history: [],
    userId: 'user_1',
    message: 'understand repo',
    modelId: 1,
    model: 'test-model',
    requestId: 'req_1',
    attachments: [],
  };
}

function runtimeEvent(type: AgentEvent['type'], payload: Record<string, unknown>): AgentEvent {
  return {
    id: `${type}_1`,
    taskId: 'task_1',
    sessionId: 'core_session_1',
    type,
    timestamp: '2026-01-01T00:00:00.000Z',
    payload,
  };
}

describe('message-mappers', () => {
  it('filters meta and runtime diagnostic messages from adapter history', () => {
    const messages = toAdapterMessages([
      message({ uuid: 'keep' }),
      message({ uuid: 'meta', metadata: { isMeta: true } }),
      message({
        uuid: 'diag',
        role: 'assistant',
        content: [{ type: 'text', text: 'Latest output:\n{"mode": "placeholder"}' }],
        metadata: { provider: 'core-runtime' },
      }),
    ]);

    expect(messages.map((item) => item.id)).toEqual(['keep']);
  });

  it('maps files, images, and tool parts into adapter parts', () => {
    const parts = toAdapterParts(message({
      content: [
        { type: 'file', mimeType: 'text/plain', data: 'abc' },
        { type: 'image', source: { type: 'url', url: 'https://example.com/a.png' } },
        { type: 'tool-call', toolCallId: 'call1', toolName: 'fs.read', input: { path: 'a' } },
        { type: 'tool-result', toolCallId: 'call1', toolName: 'fs.read', output: { ok: true }, isError: false },
      ],
    }));

    expect(parts).toMatchObject([
      { type: 'text', text: '[Attached file: mime=text/plain, base64Length=3]' },
      { type: 'image', source: { kind: 'url', url: 'https://example.com/a.png' } },
      { type: 'tool-call', callId: 'call1', toolName: 'fs.read' },
      { type: 'tool-result', callId: 'call1', toolName: 'fs.read', isError: false },
    ]);
  });

  it('clones streamed message events before returning them', () => {
    const source = message({ metadata: { extensions: { model: 'x' } } });
    const event = toMessageEvent(source);
    source.content.push({ type: 'text', text: 'mutated' });

    expect(event.type).toBe('msg');
    if (event.type === 'msg') {
      expect(event.msg.content).toHaveLength(1);
      expect(event.msg.metadata.extensions).toEqual({ model: 'x' });
    }
  });

  it('maps session.verification and session.blocked progress events', () => {
    const verification = toProgressMessage(
      runtimeInput(),
      null,
      runtimeEvent('session.verification', {
        round: 2,
        status: 'failed',
        verifierName: 'repo-understanding',
        reason: 'Missing direct evidence.',
        missingEvidence: ['README.md'],
        nextAction: 'Read README.md',
        completionSignalObserved: false,
      }),
    );
    const blocked = toProgressMessage(
      runtimeInput(),
      null,
      runtimeEvent('session.blocked', {
        reason: 'Verification did not pass within 3 rounds.',
        rounds: 3,
        verifierName: 'repo-understanding',
        missingEvidence: ['README.md'],
        nextAction: 'Needs user input.',
      }),
    );

    expect(verification?.content[0]).toMatchObject({
      type: 'tool-result',
      toolName: 'agent.verification',
    });
    expect(blocked?.content[0]).toMatchObject({
      type: 'tool-result',
      toolName: 'agent.session',
      isError: true,
    });
  });
});
