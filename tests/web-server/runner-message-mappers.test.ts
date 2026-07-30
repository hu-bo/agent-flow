import { describe, expect, it } from 'vitest';
import { toInboundTaskEvent } from '../../apps/web-server/src/grpc/runner-message-mappers.js';

describe('runner-message-mappers', () => {
  it('normalizes proto-loader uint64 strings into safe event numbers', () => {
    const event = toInboundTaskEvent({
      taskId: 'task_1',
      executionId: 'execution_1',
      attempt: 1,
      eventSequence: '1',
      type: 'TASK_EVENT_TYPE_COMPLETED',
      completed: {
        exitCode: 0,
        durationMs: '8',
        status: 'TERMINAL_STATUS_SUCCEEDED',
        stdoutBytes: '128',
        stderrBytes: '0',
      },
    });

    expect(event).toMatchObject({
      type: 'completed',
      sequence: 1,
      durationMs: 8,
      stdoutBytes: 128,
      stderrBytes: 0,
      status: 'succeeded',
    });
  });

  it('rejects uint64 values that cannot be represented safely', () => {
    expect(() => toInboundTaskEvent({
      taskId: 'task_1',
      eventSequence: '9007199254740992',
      type: 'TASK_EVENT_TYPE_STARTED',
    })).toThrow('taskEvent.eventSequence must be a safe unsigned integer');
  });
});
