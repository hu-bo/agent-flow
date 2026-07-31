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
    type: 'text',
    text: 'hello',
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
        type: 'text',
        text: 'Latest output:\n{"mode": "placeholder"}',
        metadata: { provider: 'core-runtime' },
      }),
    ]);

    expect(messages.map((item) => item.id)).toEqual(['keep']);
  });

  it('maps text attachments and images into adapter parts', () => {
    const parts = toAdapterParts(message({
      text: '',
      attachments: [{ type: 'file', mimeType: 'text/plain', data: 'abc' }],
    }));
    const imageParts = toAdapterParts(message({
      role: 'user',
      type: 'image',
      source: { type: 'url', url: 'https://example.com/a.png' },
    }));

    expect(parts).toMatchObject([
      { type: 'text', text: '[Attached file: mime=text/plain, base64Length=3]' },
    ]);
    expect(imageParts).toMatchObject([
      { type: 'image', source: { kind: 'url', url: 'https://example.com/a.png' } },
    ]);
  });

  it('clones streamed message events before returning them', () => {
    const source = message({ metadata: { extensions: { model: 'x' } } });
    const event = toMessageEvent(source);
    source.text = 'mutated';

    expect(event.type).toBe('msg');
    if (event.type === 'msg') {
      expect(event.msg.type).toBe('text');
      expect(event.msg.type === 'text' ? event.msg.text : '').toBe('hello');
      expect(event.msg.metadata.extensions).toEqual({ model: 'x' });
    }
  });

  it('maps tool progress into compact tool execution messages', () => {
    const called = toProgressMessage(
      runtimeInput(),
      null,
      runtimeEvent('tool.called', {
        stepId: 'step_1',
        title: 'Read package',
        tool: 'fs.read',
        input: { path: 'package.json' },
      }),
    );
    const result = toProgressMessage(
      runtimeInput(),
      null,
      runtimeEvent('tool.result', {
        stepId: 'step_1',
        title: 'Read package',
        tool: 'fs.read',
        ok: true,
        output: { path: 'package.json', size: 128 },
      }),
    );
    const sessionEvent = toProgressMessage(
      runtimeInput(),
      null,
      runtimeEvent('session.verification', { status: 'failed' }),
    );

    expect(called).toMatchObject({
      type: 'tool_execution',
      status: 'running',
      stepId: 'step_1',
      tool: { name: 'fs.read', input: { path: 'package.json' } },
    });
    expect(result).toMatchObject({
      uuid: called?.uuid,
      type: 'tool_execution',
      status: 'success',
      tool: { name: 'fs.read', output: { path: 'package.json', size: 128 } },
    });
    expect(sessionEvent).toBeUndefined();
  });
});
