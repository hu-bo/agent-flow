import { describe, expect, it } from 'vitest';
import type { UnifiedMessage } from '@agent-flow/core/messages';
import { toAdapterMessages, toAdapterParts, toMessageEvent } from '../../apps/web-server/src/runtime/message-mappers.js';

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
});
