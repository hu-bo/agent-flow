import { describe, expect, it } from 'vitest';
import type { AgentEvent } from '@agent-flow/core';
import { toProgressMessage } from '../src/runtime/message-mappers.js';

describe('toProgressMessage', () => {
  it('emits shell.exec progress for both call and successful result events', () => {
    const called = toProgressMessage(
      createInput(),
      null,
      createEvent('tool.called', {
        stepId: 'step_shell',
        title: 'Run shell command',
        tool: 'shell.exec',
        input: {
          command: 'git',
          args: ['status', '--short'],
          workingDir: 'E:/Project/my-project/agent-flow',
        },
      }),
    );

    const result = toProgressMessage(
      createInput(),
      null,
      createEvent('tool.result', {
        stepId: 'step_shell',
        title: 'Run shell command',
        tool: 'shell.exec',
        ok: true,
        output: {
          stdout: ' M apps/web-server/src/runtime/message-mappers.ts',
          stderr: '',
          exitCode: 0,
        },
      }),
    );

    expect(called).toMatchObject({
      type: 'tool_execution',
      status: 'running',
      tool: {
        name: 'shell.exec',
        input: {
          command: 'git',
          args: ['status', '--short'],
        },
      },
    });
    expect(result).toMatchObject({
      type: 'tool_execution',
      status: 'success',
      tool: {
        name: 'shell.exec',
        output: {
          stdout: ' M apps/web-server/src/runtime/message-mappers.ts',
          exitCode: 0,
        },
      },
    });
  });

  it('preserves approval response details in tool output', () => {
    const message = toProgressMessage(
      createInput(),
      null,
      createEvent('approval_response', {
        requestId: 'approval_1',
        sessionId: 'session_1',
        command: 'powershell -Command "git status --short"',
        workingDir: 'E:/Project/my-project/agent-flow',
        approved: true,
        decision: 'once',
        reason: 'User approved',
      }),
    );

    expect(message).toMatchObject({
      type: 'tool_execution',
      status: 'success',
      title: 'Approval response',
      tool: {
        name: 'runner.approval',
        output: {
          command: 'powershell -Command "git status --short"',
          workingDir: 'E:/Project/my-project/agent-flow',
          decision: 'once',
          reason: 'User approved',
        },
      },
    });
  });

  it('hides file read content and sizes while preserving the tool result event', () => {
    const message = toProgressMessage(
      createInput(),
      null,
      createEvent('tool.result', {
        stepId: 'step_read',
        title: 'Read file',
        tool: 'fs.read',
        ok: true,
        output: {
          path: 'apps/web-server/src/runtime/message-mappers.ts',
          content: 'secret file content',
          size: 1024,
          bytesRead: 1024,
        },
      }),
    );

    expect(message).toMatchObject({
      type: 'tool_execution',
      status: 'success',
      tool: {
        name: 'fs.read',
        output: {
          path: 'apps/web-server/src/runtime/message-mappers.ts',
        },
      },
    });
    expect(message && message.type === 'tool_execution' ? message.tool.output : undefined).not.toHaveProperty('content');
    expect(message && message.type === 'tool_execution' ? message.tool.output : undefined).not.toHaveProperty('size');
    expect(message && message.type === 'tool_execution' ? message.tool.output : undefined).not.toHaveProperty('bytesRead');
  });

  it('hides stdout for shell file-read commands but keeps command metadata', () => {
    const message = toProgressMessage(
      createInput(),
      null,
      createEvent('tool.result', {
        stepId: 'step_shell_read',
        title: 'Read file',
        tool: 'shell.exec',
        ok: true,
        output: {
          command: 'powershell.exe',
          args: ['-NoProfile', '-Command', "Get-Content -LiteralPath 'app.ts' -Raw"],
          stdout: 'secret file content',
          stderr: '',
          stdoutBytes: 19,
          exitCode: 0,
        },
      }),
    );

    expect(message).toMatchObject({
      type: 'tool_execution',
      status: 'success',
      tool: {
        name: 'shell.exec',
        output: {
          command: 'powershell.exe',
          args: ['-NoProfile', '-Command', "Get-Content -LiteralPath 'app.ts' -Raw"],
          stdout: '[file content hidden]',
          stderr: '',
          exitCode: 0,
        },
      },
    });
    expect(message && message.type === 'tool_execution' ? message.tool.output : undefined).not.toHaveProperty('stdoutBytes');
  });
});

function createInput() {
  return {
    session: {
      sessionId: 'session_1',
    },
    history: [],
    userId: 'user_1',
    message: 'run a command',
    modelId: 1,
    model: 'openai/gpt-5.4',
    requestId: 'request_1',
    turnId: 'turn_1',
    attachments: [],
  };
}

function createEvent(type: AgentEvent['type'], payload: Record<string, unknown>): AgentEvent {
  return {
    id: `event_${type}`,
    taskId: 'task_1',
    sessionId: 'session_1',
    type,
    timestamp: '2026-08-09T00:00:00.000Z',
    payload,
  };
}
