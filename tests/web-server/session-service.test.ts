import { describe, expect, it } from 'vitest';
import { ChatMessageEntity } from '../../apps/web-server/src/db/entities/chat-message.entity.js';
import { ChatSessionEntity } from '../../apps/web-server/src/db/entities/chat-session.entity.js';
import { ProjectEntity } from '../../apps/web-server/src/db/entities/project.entity.js';
import { SessionService } from '../../apps/web-server/src/services/session-service.js';

class FakeRepository<T extends Record<string, unknown>> {
  constructor(private readonly rows: T[] = []) {}

  create(input: Partial<T>): T {
    const now = new Date('2026-07-29T00:00:00.000Z');
    return {
      createdAt: now,
      updatedAt: now,
      ...input,
    } as T;
  }

  async save(entity: T): Promise<T> {
    const index = this.rows.findIndex((row) => this.sameEntity(row, entity));
    if (index >= 0) {
      this.rows[index] = entity;
    } else {
      this.rows.push(entity);
    }
    return entity;
  }

  async findOne(options: { where?: Partial<T> }): Promise<T | null> {
    const where = options.where ?? {};
    return this.rows.find((row) => this.matches(row, where)) ?? null;
  }

  private matches(row: T, where: Partial<T>): boolean {
    return Object.entries(where).every(([key, value]) => row[key] === value);
  }

  private sameEntity(left: T, right: T): boolean {
    for (const key of ['sessionId', 'projectId', 'messageId']) {
      if (left[key] !== undefined && right[key] !== undefined) {
        return left[key] === right[key];
      }
    }
    return left === right;
  }
}

function createService(input: {
  sessions?: ChatSessionEntity[];
  projects?: ProjectEntity[];
}): SessionService {
  const repositories = new Map<unknown, FakeRepository<any>>([
    [ChatSessionEntity, new FakeRepository(input.sessions ?? [])],
    [ChatMessageEntity, new FakeRepository([])],
    [ProjectEntity, new FakeRepository(input.projects ?? [])],
  ]);
  return new SessionService({
    getRepository(entity: unknown) {
      const repository = repositories.get(entity);
      if (!repository) {
        throw new Error('Unexpected repository');
      }
      return repository;
    },
  } as never, 'E:\\server-cwd');
}

function project(overrides: Partial<ProjectEntity> = {}): ProjectEntity {
  const now = new Date('2026-07-29T00:00:00.000Z');
  return {
    projectId: 'project_1',
    ownerUserId: 'user_1',
    name: 'synes-master',
    rootPath: 'E:\\Project\\synes-master',
    defaultRunnerId: 'runner_1',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as ProjectEntity;
}

function session(overrides: Partial<ChatSessionEntity> = {}): ChatSessionEntity {
  const now = new Date('2026-07-29T00:00:00.000Z');
  return {
    sessionId: 'session_1',
    ownerUserId: 'user_1',
    projectId: 'project_1',
    modelId: 1,
    mode: 'vibe',
    cwd: '/workspace/synes-master',
    messageCount: 0,
    title: null,
    systemPrompt: null,
    latestCheckpointId: '',
    boundRunnerId: null,
    specWorkflow: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as ChatSessionEntity;
}

describe('SessionService project cwd handling', () => {
  it('uses project rootPath when creating project sessions even if cwd is provided', async () => {
    const service = createService({ projects: [project()] });

    const created = await service.createSession({
      ownerUserId: 'user_1',
      projectId: 'project_1',
      modelId: 1,
      mode: 'vibe',
      cwd: '/workspace/wrong-root',
    });

    expect(created.cwd).toBe('E:\\Project\\synes-master');
    expect(created.boundRunnerId).toBe('runner_1');
  });

  it('refreshes existing project sessions back to project rootPath', async () => {
    const existing = session();
    const service = createService({
      sessions: [existing],
      projects: [project()],
    });

    const refreshed = await service.refreshProjectCwd('session_1', 'user_1');

    expect(refreshed.cwd).toBe('E:\\Project\\synes-master');
    expect(refreshed.boundRunnerId).toBe('runner_1');
    expect(existing.cwd).toBe('E:\\Project\\synes-master');
  });
});
