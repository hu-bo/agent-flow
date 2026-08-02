import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { ChatMessage } from './types';
import { MessageItem } from './components/MessageItem/MessageItem';
import { TurnGroup } from './components/TurnGroup/TurnGroup';

const timestamp = '2026-08-01T00:00:00.000Z';

describe('chat UI v2 rendering', () => {
  it('renders images, file attachments and message actions', () => {
    const image: ChatMessage = {
      uuid: 'image-1',
      parentUuid: null,
      role: 'assistant',
      type: 'image',
      source: { type: 'url', url: 'https://example.test/preview.png' },
      text: 'Generated preview',
      timestamp,
      metadata: {},
    };
    const imageHtml = renderToStaticMarkup(createElement(MessageItem, {
      message: image,
      onRetry: () => undefined,
      onCopy: () => undefined,
      onDelete: () => undefined,
    }));
    expect(imageHtml).toContain('https://example.test/preview.png');
    expect(imageHtml).toContain('Generated preview');
    expect(imageHtml).toContain('aria-label="Retry"');
    expect(imageHtml).toContain('aria-label="Copy"');
    expect(imageHtml).toContain('aria-label="Delete"');

    const attachment: ChatMessage = {
      uuid: 'file-1',
      parentUuid: null,
      role: 'user',
      type: 'text',
      text: 'Review this file',
      attachments: [{ type: 'file', mimeType: 'text/plain', data: 'aGVsbG8=' }],
      timestamp,
      metadata: {},
    };
    const attachmentHtml = renderToStaticMarkup(createElement(MessageItem, { message: attachment }));
    expect(attachmentHtml).toContain('data:text/plain;base64,aGVsbG8=');
    expect(attachmentHtml).toContain('text/plain');
  });

  it('renders tool output and a lightweight runner diff preview in the timeline', () => {
    const tool: ChatMessage = {
      uuid: 'tool-1',
      parentUuid: 'user-1',
      role: 'tool',
      type: 'tool_execution',
      status: 'error',
      title: 'Apply patch',
      tool: {
        callId: 'call-1',
        name: 'fs.patch',
        input: { path: 'src/app.ts' },
        output: {
          type: 'runner-files-changed',
          version: 1,
          source: 'runner-host',
          summary: { filesChanged: 1, additions: 1, deletions: 1, truncated: false },
          files: [{
            path: 'src/app.ts',
            additions: 1,
            deletions: 1,
            truncated: false,
            diffPreview: {
              contextLines: 3,
              hunks: [{
                header: '@@ -1 +1 @@',
                oldStart: 1,
                oldLines: 1,
                newStart: 1,
                newLines: 1,
                lines: [
                  { type: 'del', text: 'old', oldLine: 1, newLine: null },
                  { type: 'add', text: 'new', oldLine: null, newLine: 1 },
                ],
              }],
            },
          }],
          rawOutput: null,
        },
        error: 'verification failed',
      },
      timestamp,
      metadata: { turnId: 'user-1' },
    };
    const html = renderToStaticMarkup(createElement(TurnGroup, {
      turn: { id: 'user-1', activities: [tool], responses: [] },
    }));
    expect(html).toContain('Apply patch');
    expect(html).toContain('1 files changed');
    expect(html).toContain('Diff for src/app.ts');
    expect(html).toContain('old');
    expect(html).toContain('new');
    expect(html).toContain('verification failed');
  });
});
