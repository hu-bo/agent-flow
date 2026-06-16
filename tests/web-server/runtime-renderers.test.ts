import { describe, expect, it } from 'vitest';
import type { RuntimeChatInput } from '../../apps/web-server/src/contracts/api.js';
import { renderEnvironmentContext, renderRuntimeOutput } from '../../apps/web-server/src/runtime/runtime-renderers.js';

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

  it('injects Windows runner platform command guidance', () => {
    const rendered = renderEnvironmentContext(
      {
        session: {
          sessionId: 'session-1',
          mode: 'vibe',
          cwd: 'E:\\Project\\agent-flow',
          modelId: 1,
          messageCount: 0,
          createdAt: new Date(0).toISOString(),
          updatedAt: new Date(0).toISOString(),
        },
        history: [],
        userId: 'user-1',
        message: 'run tests',
        modelId: 1,
        model: 'test-model',
        requestId: 'request-1',
        attachments: [],
        preferredRunnerId: 'runner-1',
        runnerPlatform: {
          os: 'windows',
          arch: 'amd64',
          defaultShell: 'powershell.exe',
          pathSeparator: '\\',
          lineEnding: '\r\n',
          workspaceRoots: ['E:\\Project\\agent-flow'],
          availableCommands: ['git', 'pnpm', 'powershell.exe'],
        },
      } satisfies RuntimeChatInput,
      'autonomous',
    );

    expect(rendered).toContain('Runner Platform Context:');
    expect(rendered).toContain('os=windows');
    expect(rendered).toContain('defaultShell=powershell.exe');
    expect(rendered).toContain('Windows runner: prefer PowerShell syntax');
    expect(rendered).toContain('lineEnding=CRLF');
  });

  it('warns when runner platform is unknown', () => {
    const rendered = renderEnvironmentContext(
      {
        session: {
          sessionId: 'session-1',
          mode: 'vibe',
          cwd: '/workspace/agent-flow',
          modelId: 1,
          messageCount: 0,
          createdAt: new Date(0).toISOString(),
          updatedAt: new Date(0).toISOString(),
        },
        history: [],
        userId: 'user-1',
        message: 'inspect files',
        modelId: 1,
        model: 'test-model',
        requestId: 'request-1',
        attachments: [],
      } satisfies RuntimeChatInput,
      'autonomous',
    );

    expect(rendered).toContain('boundRunner=none-or-unknown');
    expect(rendered).toContain('Prefer semantic tools');
  });
});
