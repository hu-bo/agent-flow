import { describe, expect, it } from 'vitest';
import { renderRuntimeOutput } from '../../apps/web-server/src/runtime/runtime-renderers.js';

describe('runtime-renderers', () => {
  it('renders fs list outputs for humans', () => {
    expect(renderRuntimeOutput({
      path: '.',
      total: 1,
      entries: [{ type: 'file', name: 'README.md', size: 12 }],
    })).toContain('[file] README.md (12 bytes)');
  });

  it('renders fs read outputs with content preview', () => {
    expect(renderRuntimeOutput({
      path: 'a.txt',
      size: 5,
      content: 'hello',
    })).toContain('Read file: a.txt (5 bytes)\n\nhello');
  });

  it('renders fs search and shell outputs', () => {
    expect(renderRuntimeOutput({
      path: '.',
      pattern: 'foo',
      total: 1,
      matches: [{ path: 'a.ts', line: 2, content: 'foo()' }],
    })).toContain('a.ts:2 foo()');

    expect(renderRuntimeOutput({
      command: 'pnpm test',
      stdout: ['ok'],
      stderr: [],
    })).toContain('STDOUT:\nok');
  });
});
