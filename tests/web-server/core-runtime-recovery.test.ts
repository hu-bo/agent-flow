import { describe, expect, it } from 'vitest';
import { ChatMessageEntity } from '../../apps/web-server/src/db/entities/chat-message.entity.js';
import { CoreRuntimeReplayEntity } from '../../apps/web-server/src/db/entities/core-runtime-replay.entity.js';
import { CoreRuntimeSessionEntity } from '../../apps/web-server/src/db/entities/core-runtime-session.entity.js';
import { DbReplayStore, DbSessionStore } from '../../apps/web-server/src/runtime/db-runtime-stores.js';

class FakeRepository<T extends Record<string, unknown>> {
  constructor(readonly rows: T[]) {}

  create(input: Partial<T>): T {
    return {
      createdAt: new Date('2026-07-30T00:00:00.000Z'),
      updatedAt: new Date('2026-07-30T00:00:00.000Z'),
      ...input,
    } as T;
  }

  async find(options?: { where?: { status?: string | { _value?: string[] } } }): Promise<T[]> {
    const status = options?.where?.status;
    const statuses = typeof status === 'string' ? [status] : status?._value;
    return statuses
      ? this.rows.filter((row) => statuses.includes(String(row.status)))
      : this.rows;
  }

  async findOne(options: { where?: Partial<T>; order?: Record<string, 'ASC' | 'DESC'> }): Promise<T | null> {
    const matches = this.rows.filter((row) =>
      Object.entries(options.where ?? {}).every(([key, value]) => row[key] === value),
    );
    if (options.order?.cursor === 'DESC') {
      matches.sort((left, right) => Number(right.cursor) - Number(left.cursor));
    }
    return matches[0] ?? null;
  }

  async save(entity: T): Promise<T> {
    if (!this.rows.includes(entity)) this.rows.push(entity);
    return entity;
  }
}

describe('core runtime startup recovery', () => {
  it('fails abandoned sessions and terminalizes their pending steps', async () => {
    const now = new Date('2026-07-30T00:00:00.000Z');
    const session = {
      sessionId: 'core_session_1',
      taskId: 'task_1',
      status: 'running',
      metadata: {},
      lastRequest: null,
      createdAt: now,
      updatedAt: now,
    } as CoreRuntimeSessionEntity;
    const replayRows = [
      {
        replayId: 'replay_1',
        sessionId: session.sessionId,
        cursor: 0,
        event: {
          id: 'event_1',
          taskId: session.taskId,
          sessionId: session.sessionId,
          type: 'session.started',
          timestamp: now.toISOString(),
          payload: {
            steps: [
              { id: 'repo.scan', title: 'Scan repository', kind: 'tool' },
              { id: 'repo.summary', title: 'Summarize repository', kind: 'llm' },
            ],
          },
        },
        createdAt: now,
      },
      {
        replayId: 'replay_2',
        sessionId: session.sessionId,
        cursor: 1,
        event: {
          id: 'event_2',
          taskId: session.taskId,
          sessionId: session.sessionId,
          type: 'step.completed',
          timestamp: now.toISOString(),
          payload: { stepId: 'repo.scan' },
        },
        createdAt: now,
      },
    ] as CoreRuntimeReplayEntity[];
    session.metadata = { requestId: 'req-1' };
    const thinkingMessage = {
      messageId: 'runtime_thinking_req-1',
      sessionId: 'chat_session_1',
      sequence: 2,
      role: 'assistant',
      timestamp: now,
      payload: {
        uuid: 'runtime_thinking_req-1',
        parentUuid: null,
        role: 'assistant',
        type: 'thinking',
        title: 'Thinking',
        text: '## Plan\n1. Scan repository - success\n2. Summarize repository - pending',
        status: 'running',
        items: [{
          key: 'plan',
          title: 'Plan',
          status: 'running',
          content: '1. Scan repository - success\n2. Summarize repository - pending',
        }],
        timestamp: now.toISOString(),
        metadata: {
          provider: 'core-runtime',
          isMeta: true,
          extensions: { runtimeThinking: true, requestId: 'req-1', status: 'running' },
        },
      },
    } as ChatMessageEntity;
    const repositories = new Map<unknown, FakeRepository<any>>([
      [CoreRuntimeSessionEntity, new FakeRepository([session])],
      [CoreRuntimeReplayEntity, new FakeRepository(replayRows)],
      [ChatMessageEntity, new FakeRepository([thinkingMessage])],
    ]);
    const db = {
      getRepository(entity: unknown) {
        const repository = repositories.get(entity);
        if (!repository) throw new Error('unexpected repository');
        return repository;
      },
    } as never;

    const replayStore = new DbReplayStore(db);
    const recovered = await new DbSessionStore(db).recoverInterruptedSessions(replayStore, now);

    expect(recovered).toBe(1);
    expect(session.status).toBe('failed');
    expect(session.metadata.recovery).toMatchObject({
      type: 'process_restart',
      previousStatus: 'running',
    });
    expect(replayRows.map((row) => row.event.type)).toEqual([
      'session.started',
      'step.completed',
      'step.failed',
      'session.failed',
    ]);
    expect(replayRows[2]?.event.payload).toMatchObject({ stepId: 'repo.summary' });
    expect(thinkingMessage.payload.metadata.extensions).toMatchObject({ status: 'error' });
    expect(thinkingMessage.payload).toMatchObject({
      type: 'thinking',
      status: 'error',
      title: 'Complete thinking',
    });
    expect(thinkingMessage.payload.type === 'thinking'
      ? thinkingMessage.payload.items?.[0]?.content
      : undefined).toContain('Summarize repository - error');
  });
});
