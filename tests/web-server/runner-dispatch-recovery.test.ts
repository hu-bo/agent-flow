import { afterEach, describe, expect, it, vi } from 'vitest';
import { RunnerExecutionEntity } from '../../apps/web-server/src/db/entities/runner-execution.entity.js';
import { RunnerExecutionEventEntity } from '../../apps/web-server/src/db/entities/runner-execution-event.entity.js';
import { RunnerDispatchService } from '../../apps/web-server/src/services/runner-dispatch-service.js';

class FakeExecutionRepository {
  constructor(readonly rows: RunnerExecutionEntity[]) {}

  async find(): Promise<RunnerExecutionEntity[]> {
    return this.rows.filter((row) => row.state === 'accepted' || row.state === 'running');
  }

  async findOne(input: { where: Partial<RunnerExecutionEntity> }): Promise<RunnerExecutionEntity | null> {
    return this.rows.find((row) =>
      row.executionId === input.where.executionId && row.attempt === input.where.attempt
    ) ?? null;
  }

  async save(row: RunnerExecutionEntity): Promise<RunnerExecutionEntity> {
    return row;
  }
}

function execution(deadline: Date): RunnerExecutionEntity {
  return {
    executionId: 'execution_1',
    attempt: 1,
    taskId: 'task_1',
    runnerId: 'runner_1',
    state: 'running',
    terminalStatus: null,
    failureType: null,
    failureMessage: null,
    taskPayload: {},
    dispatchAcked: true,
    cancelRequested: false,
    lastEventSequence: '0',
    deadline,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as RunnerExecutionEntity;
}

describe('RunnerDispatchService recovery deadlines', () => {
  afterEach(() => vi.useRealTimers());

  it('reinstalls the deadline for a running execution after restart', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-30T00:00:00.000Z'));
    const row = execution(new Date('2026-07-30T00:00:01.000Z'));
    const repository = new FakeExecutionRepository([row]);
    const service = new RunnerDispatchService(
      {} as never,
      {} as never,
      {
        getRepository(entity: unknown) {
          if (entity === RunnerExecutionEntity) return repository;
          if (entity === RunnerExecutionEventEntity) return {};
          throw new Error('unexpected repository');
        },
      } as never,
    );

    await service.initialize();
    await vi.advanceTimersByTimeAsync(1_001);

    expect(row.state).toBe('terminal');
    expect(row.terminalStatus).toBe('timed_out');
    expect(row.failureType).toBe('timeout');
  });

  it('rearms deadlines longer than the maximum timer delay', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-30T00:00:00.000Z'));
    const row = execution(new Date(Date.now() + 2_147_483_647 + 1_000));
    const repository = new FakeExecutionRepository([row]);
    const service = new RunnerDispatchService(
      {} as never,
      {} as never,
      {
        getRepository(entity: unknown) {
          if (entity === RunnerExecutionEntity) return repository;
          if (entity === RunnerExecutionEventEntity) return {};
          throw new Error('unexpected repository');
        },
      } as never,
    );

    await service.initialize();
    await vi.advanceTimersByTimeAsync(2_147_483_647);
    expect(row.state).toBe('running');

    await vi.advanceTimersByTimeAsync(1_001);
    expect(row.state).toBe('terminal');
    expect(row.terminalStatus).toBe('timed_out');
  });
});
