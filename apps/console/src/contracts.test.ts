import { describe, expect, it } from 'vitest';
import { createTaskBodySchema, taskRecordSchema } from '@agent-flow/web-contracts';

describe('console web contracts', () => {
  it('accepts the camelCase task payload consumed by the console', () => {
    expect(createTaskBodySchema.parse({ prompt: '  inspect the runner  ', modelId: 7 })).toEqual({
      prompt: 'inspect the runner',
      modelId: 7,
      type: 'chat',
    });

    expect(
      taskRecordSchema.parse({
        taskId: 'task-1',
        sessionId: 'session-1',
        type: 'chat',
        status: 'running',
        createdAt: '2026-08-01T12:00:00+08:00',
        updatedAt: '2026-08-01T12:00:01+08:00',
        latestCheckpointId: 'checkpoint-1',
        retryCount: 0,
        maxRetries: 2,
        modelId: 7,
        prompt: 'inspect the runner',
      }),
    ).toMatchObject({ taskId: 'task-1', modelId: 7, status: 'running' });
  });

  it('rejects invalid task input before it reaches the API', () => {
    expect(createTaskBodySchema.safeParse({ prompt: '   ', modelId: 0 }).success).toBe(false);
    expect(
      taskRecordSchema.safeParse({
        taskId: 'task-1',
        sessionId: 'session-1',
        type: 'chat',
        status: 'unknown',
      }).success,
    ).toBe(false);
  });
});
