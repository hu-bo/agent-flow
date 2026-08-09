import { describe, expect, it } from 'vitest';
import type { RuntimeChatInput } from '../src/contracts/api.js';
import { buildSystemPrompt, renderEnvironmentContext, renderRuntimeOutput } from '../src/runtime/runtime-renderers.js';

function createInput(overrides: Partial<RuntimeChatInput> = {}): RuntimeChatInput {
  const base: RuntimeChatInput = {
    session: {
      sessionId: 'session-1',
      projectId: 'project-1',
      title: 'Workspace Chat',
      createdAt: '2026-08-05T00:00:00.000Z',
      updatedAt: '2026-08-05T00:00:00.000Z',
      modelId: 1,
      mode: 'vibe',
      cwd: 'E:\\Project\\my-project\\agent-flow',
      messageCount: 0,
      systemPrompt: undefined,
      latestCheckpointId: undefined,
      boundRunnerId: 'runner-1',
      specWorkflow: undefined,
    },
    history: [],
    userId: 'user-1',
    message: 'inspect the workspace',
    modelId: 1,
    model: 'test-model',
    requestId: 'request-1',
    turnId: 'turn-1',
    attachments: [],
    preferredRunnerId: 'runner-1',
    signal: undefined,
  };

  return {
    ...base,
    ...overrides,
    session: {
      ...base.session,
      ...(overrides.session ?? {}),
    },
  };
}

describe('renderEnvironmentContext', () => {
  it('renders PowerShell-specific structure inspection guidance for Windows runners', () => {
    const text = renderEnvironmentContext(createInput({
      runnerPlatform: {
        os: 'windows',
        arch: 'amd64',
        defaultShell: 'powershell',
        pathSeparator: '\\',
        lineEnding: '\r\n',
        workspaceRoots: ['E:\\Project\\my-project\\agent-flow'],
        availableCommands: ['Get-ChildItem', 'Select-String'],
      },
    }), 'autonomous');

    expect(text).toContain('shellExamples.directory=Get-ChildItem -Path .');
    expect(text).toContain('shellExamples.contentSearch=Get-ChildItem -Path . -Recurse -File | Select-String -Pattern \'pattern\'');
    expect(text).not.toContain('grep -RIn "pattern" .');
  });

  it('renders POSIX-specific structure inspection guidance for Linux runners', () => {
    const text = renderEnvironmentContext(createInput({
      runnerPlatform: {
        os: 'linux',
        arch: 'amd64',
        defaultShell: '/bin/bash',
        pathSeparator: '/',
        lineEnding: '\n',
        workspaceRoots: ['/workspace/agent-flow'],
        availableCommands: ['find', 'grep'],
      },
    }), 'autonomous');

    expect(text).toContain('shellExamples.directory=find . -maxdepth 2 -type d');
    expect(text).toContain('shellExamples.nameSearch=find . -type f | grep "pattern"');
    expect(text).toContain('shellExamples.contentSearch=grep -RIn "pattern" .');
  });

  it('falls back to shell-first guidance when runner platform is unknown', () => {
    const text = renderEnvironmentContext(createInput({
      runnerPlatform: undefined,
      preferredRunnerId: undefined,
      session: {
        boundRunnerId: undefined,
      },
    }), 'autonomous');

    expect(text).toContain('Use shell.exec for workspace inspection, file reads, search, edits, and verification.');
    expect(text).toContain('first run a harmless probe such as pwd, uname, ver, or $PSVersionTable.');
  });
});

describe('buildSystemPrompt', () => {
  it('injects runner platform guidance into chat system prompts when a bound runner exists', () => {
    const prompt = buildSystemPrompt(
      createInput({
        runnerPlatform: {
          os: 'windows',
          arch: 'amd64',
          defaultShell: 'powershell',
          pathSeparator: '\\',
          lineEnding: '\r\n',
          workspaceRoots: ['E:\\Project\\my-project\\agent-flow'],
          availableCommands: ['Get-ChildItem', 'Select-String'],
        },
      }),
      [],
    );

    expect(prompt).toContain('Runner Platform Context:');
    expect(prompt).toContain('shellExamples.directory=Get-ChildItem -Path .');
    expect(prompt).toContain('inspectionPriority=Use shell.exec with native read-only commands for tree shape, text search, and targeted file inspection.');
  });
});

describe('renderRuntimeOutput', () => {
  it('hides fs.read content in runtime output previews', () => {
    const text = renderRuntimeOutput({
      path: 'apps/web-server/src/runtime/message-mappers.ts',
      content: 'secret file content',
      size: 19,
      bytesRead: 19,
    });

    expect(text).toContain('Read file: apps/web-server/src/runtime/message-mappers.ts');
    expect(text).toContain('[file content hidden]');
    expect(text).not.toContain('secret file content');
    expect(text).not.toContain('bytesRead');
  });

  it('keeps normal shell stdout but hides file-read stdout', () => {
    const gitText = renderRuntimeOutput({
      command: 'git',
      args: ['status', '--short'],
      stdout: [' M apps/web-server/src/runtime/runtime-renderers.ts'],
      stderr: [],
      exitCode: 0,
    });
    const readText = renderRuntimeOutput({
      command: 'powershell.exe',
      args: ['-NoProfile', '-Command', "Get-Content -LiteralPath 'app.ts' -Raw"],
      stdout: ['secret file content'],
      stderr: [],
      exitCode: 0,
    });

    expect(gitText).toContain(' M apps/web-server/src/runtime/runtime-renderers.ts');
    expect(readText).toContain('[file content hidden: 1 chunk(s)]');
    expect(readText).not.toContain('secret file content');
  });
});
