import { describe, expect, it } from 'vitest';
import {
  normalizeTaskEventType,
  toGrpcTaskRequest,
  toInboundTaskEvent,
  toRunnerRegisterInput,
  toServerEnvelope,
} from '../../apps/web-server/src/grpc/runner-message-mappers.js';
import type { PendingRunnerTask } from '../../apps/web-server/src/services/runner-dispatch-service.js';

function pendingTask(overrides: Partial<PendingRunnerTask> = {}): PendingRunnerTask {
  return {
    taskId: 'task_1',
    sessionId: 'session_1',
    stepId: 'step_1',
    command: 'pnpm',
    args: ['test'],
    stream: true,
    input: { scope: 'web-server' },
    workingDir: 'E:/Project/my-project/agent-flow',
    sandboxPolicy: {
      enabled: true,
      readOnly: false,
      allowNetwork: false,
      allowedWorkingDirs: ['E:/Project/my-project/agent-flow'],
      allowedReadPaths: [],
      allowedWritePaths: [],
      blockedCommandFragments: [],
      allowedEnvKeys: [],
      deniedEnvKeys: [],
    },
    engine: 'host',
    executionId: 'execution_1',
    attempt: 2,
    deadline: '2026-07-29T12:00:00.000Z',
    maxOutputBytes: 1024,
    resumeFromEventSequence: 4,
    ...overrides,
  };
}

describe('runner grpc message mappers', () => {
  it('normalizes runner registration capabilities', () => {
    expect(toRunnerRegisterInput({
      runnerToken: 'token_1',
      isolationLevel: 'ISOLATION_LEVEL_CONTAINER',
      availableEngines: ['ENGINE_DOCKER', 'ENGINE_HOST', 'ENGINE_DOCKER'],
      maxConcurrentTasks: 3,
      activeTasks: 1,
    })).toMatchObject({
      runnerToken: 'token_1',
      isolationLevel: 'container',
      availableEngines: ['docker', 'host'],
      maxConcurrentTasks: 3,
      activeTasks: 1,
    });
  });

  it('maps task event enums and execution metadata into inbound events', () => {
    expect(normalizeTaskEventType('TASK_EVENT_TYPE_STDOUT')).toBe('stdout');
    expect(normalizeTaskEventType('TASK_EVENT_TYPE_UNSPECIFIED')).toBe('started');

    expect(toInboundTaskEvent({
      taskId: 'task_1',
      executionId: 'execution_1',
      attempt: 2,
      eventSequence: 5,
      timestamp: '2026-07-29T10:00:00.000Z',
      type: 'TASK_EVENT_TYPE_RESULT',
      result: {
        outputJson: Buffer.from('{"ok":true}', 'utf8'),
        stdoutBytes: 8,
        outputTruncated: false,
      },
    })).toEqual({
      type: 'result',
      timestamp: '2026-07-29T10:00:00.000Z',
      runnerId: undefined,
      executionId: 'execution_1',
      attempt: 2,
      sequence: 5,
      result: { ok: true },
      stdoutBytes: 8,
      stderrBytes: undefined,
      outputTruncated: false,
    });
  });

  it('normalizes completed task status and failure type', () => {
    expect(toInboundTaskEvent({
      taskId: 'task_1',
      type: 'TASK_EVENT_TYPE_COMPLETED',
      completed: {
        exitCode: 124,
        durationMs: 5000,
        status: 'TERMINAL_STATUS_TIMED_OUT',
        failureType: 'FAILURE_TYPE_TIMEOUT',
      },
    })).toMatchObject({
      type: 'completed',
      exitCode: 124,
      durationMs: 5000,
      status: 'timed_out',
      failureType: 'timeout',
    });
  });

  it('maps host, docker, and cancellation messages to server envelopes', () => {
    const hostRequest = toGrpcTaskRequest(pendingTask());
    expect(hostRequest).toMatchObject({
      engine: 'ENGINE_HOST',
      executionId: 'execution_1',
      attempt: 2,
      resumeFromEventSequence: 4,
    });
    expect(Buffer.from(hostRequest.inputJson ?? []).toString('utf8')).toBe('{"scope":"web-server"}');

    expect(toServerEnvelope({
      type: 'run_task',
      task: pendingTask({
        engine: 'docker',
        docker: {
          image: 'node:22-alpine',
          mounts: [{ source: 'E:/src', target: '/workspace' }],
        },
      }),
    })).toMatchObject({
      runTask: {
        engine: 'ENGINE_DOCKER',
        docker: {
          image: 'node:22-alpine',
          networkDisabled: true,
          readOnlyRootFs: true,
          mounts: [{ source: 'E:/src', target: '/workspace', readOnly: false }],
        },
      },
    });

    expect(toServerEnvelope({
      type: 'cancel_task',
      taskId: 'task_1',
      executionId: 'execution_1',
      attempt: 2,
      reason: 'user requested',
    })).toEqual({
      cancelTask: {
        taskId: 'task_1',
        executionId: 'execution_1',
        attempt: 2,
        reason: 'user requested',
      },
    });
  });
});
