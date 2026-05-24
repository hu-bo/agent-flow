import { describe, expect, it } from 'vitest';
import type { RuntimeChatInput } from '../../apps/web-server/src/contracts/api.js';
import { parseRunnerDirective, resolveRuntimeMode } from '../../apps/web-server/src/runtime/runtime-router.js';

function input(overrides: Partial<RuntimeChatInput>): RuntimeChatInput {
  return {
    session: {
      sessionId: 's1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      modelId: 1,
      mode: 'vibe',
      cwd: '',
      messageCount: 0,
    },
    history: [],
    userId: 'u1',
    message: 'hello',
    modelId: 1,
    model: 'test-model',
    requestId: 'r1',
    attachments: [],
    ...overrides,
  };
}

describe('runtime-router', () => {
  it('routes /run directives to runner mode', () => {
    const directive = parseRunnerDirective('/run test "hello world"');

    expect(directive).toEqual({ command: 'test', args: ['hello world'] });
    expect(resolveRuntimeMode(input({ message: '/run test' }), directive)).toBe('runner');
  });

  it('routes spec sessions to autonomous mode', () => {
    expect(resolveRuntimeMode(input({
      session: {
        sessionId: 's1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        modelId: 1,
        mode: 'spec',
        cwd: '',
        messageCount: 0,
      },
    }), undefined)).toBe('autonomous');
  });

  it('keeps explicit casual chat in chat mode', () => {
    expect(resolveRuntimeMode(input({ message: 'hello' }), undefined)).toBe('chat');
    expect(resolveRuntimeMode(input({ message: '你好' }), undefined)).toBe('chat');
  });

  it('routes project, cwd, attachment, and action-hint requests to autonomous mode', () => {
    expect(resolveRuntimeMode(input({ message: 'please refactor this service' }), undefined)).toBe('autonomous');
    expect(resolveRuntimeMode(input({ message: '帮我查看这个文件' }), undefined)).toBe('autonomous');
    expect(resolveRuntimeMode(input({
      message: 'what is in context?',
      session: {
        sessionId: 's1',
        projectId: 'p1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        modelId: 1,
        mode: 'vibe',
        cwd: '',
        messageCount: 0,
      },
    }), undefined)).toBe('autonomous');
    expect(resolveRuntimeMode(input({
      message: 'what is here?',
      session: {
        sessionId: 's1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        modelId: 1,
        mode: 'vibe',
        cwd: 'E:/Project/my-project/agent-flow',
        messageCount: 0,
      },
    }), undefined)).toBe('autonomous');
  });
});
