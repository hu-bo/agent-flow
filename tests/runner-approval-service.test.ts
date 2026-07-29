import { describe, expect, it } from 'vitest';
import type { AppDataSource } from '../apps/web-server/src/db/data-source.js';
import { AuditLogEntity } from '../apps/web-server/src/db/entities/audit-log.entity.js';
import { ChatSessionEntity } from '../apps/web-server/src/db/entities/chat-session.entity.js';
import { ProjectEntity } from '../apps/web-server/src/db/entities/project.entity.js';
import { RunnerApprovalGrantEntity } from '../apps/web-server/src/db/entities/runner-approval-grant.entity.js';
import { RunnerApprovalService } from '../apps/web-server/src/services/runner-approval-service.js';

function isNullOperator(value: unknown): boolean {
  return Boolean(value && typeof value === 'object' && (value as { _type?: unknown })._type === 'isNull');
}

function matchesWhere(record: Record<string, unknown>, where: Record<string, unknown>): boolean {
  return Object.entries(where).every(([key, expected]) =>
    isNullOperator(expected) ? record[key] == null : record[key] === expected,
  );
}

class FakeRepository<T extends Record<string, unknown>> {
  constructor(private readonly rows: T[]) {}

  create(value: Partial<T>): T {
    return value as T;
  }

  async save(value: T): Promise<T> {
    const mutable = value as Record<string, unknown>;
    mutable.grantId ??= `grant-${this.rows.length + 1}`;
    mutable.createdAt ??= new Date('2026-07-29T00:00:00.000Z');
    const index = this.rows.findIndex((row) => row === value);
    if (index < 0) this.rows.push(value);
    return value;
  }

  async findOne(input: { where: Record<string, unknown> }): Promise<T | null> {
    return this.rows.find((row) => matchesWhere(row, input.where)) ?? null;
  }

  async find(input: { where: Record<string, unknown> }): Promise<T[]> {
    return this.rows.filter((row) => matchesWhere(row, input.where));
  }
}

function createService() {
  const grants: RunnerApprovalGrantEntity[] = [];
  const chats = [{
    sessionId: '3c4fb328-3a68-4b88-96e6-20e48d491991',
    ownerUserId: 'user-1',
    projectId: null,
  } as ChatSessionEntity];
  const projects = [{
    projectId: 'eb20b128-16fb-4a72-a042-303568446f72',
    ownerUserId: 'user-1',
  } as ProjectEntity];
  const audits: AuditLogEntity[] = [];
  const repositories = new Map<unknown, FakeRepository<any>>([
    [RunnerApprovalGrantEntity, new FakeRepository(grants)],
    [ChatSessionEntity, new FakeRepository(chats)],
    [ProjectEntity, new FakeRepository(projects)],
    [AuditLogEntity, new FakeRepository(audits)],
  ]);
  const db = {
    getRepository(target: unknown) {
      const repository = repositories.get(target);
      if (!repository) throw new Error('unexpected repository');
      return repository;
    },
  } as unknown as AppDataSource;
  return { service: new RunnerApprovalService(db), grants };
}

describe('RunnerApprovalService persistent grants', () => {
  it('remembers an always decision for the same runner and non-project chat', async () => {
    const { service, grants } = createService();
    const pending = service.waitForApproval({
      ownerUserId: 'user-1',
      sessionId: 'core-session-1',
      runnerId: 'runner-1',
      scope: { type: 'chat', id: '3c4fb328-3a68-4b88-96e6-20e48d491991' },
      command: 'shell.exec',
      workingDir: 'E:/workspace',
      risk: 'high',
    });

    const issued = await service.approvePending({
      ownerUserId: 'user-1',
      sessionId: 'core-session-1',
      command: 'shell.exec',
      workingDir: 'E:/workspace',
      requestId: pending.request.requestId,
      decision: 'always',
    });
    const response = await pending.response;

    expect(issued.persistent_grant_id).toBeTruthy();
    expect(response).toMatchObject({ approved: true, authorizationSource: 'persistent' });
    expect(grants).toHaveLength(1);
    await expect(service.findPersistentGrant({
      ownerUserId: 'user-1',
      runnerId: 'runner-1',
      scope: { type: 'chat', id: '3c4fb328-3a68-4b88-96e6-20e48d491991' },
    })).resolves.toMatchObject({ scopeType: 'chat', runnerId: 'runner-1' });
  });

  it('keeps allow-once approvals ephemeral', async () => {
    const { service, grants } = createService();
    const pending = service.waitForApproval({
      ownerUserId: 'user-1',
      sessionId: 'core-session-2',
      runnerId: 'runner-1',
      scope: { type: 'project', id: 'eb20b128-16fb-4a72-a042-303568446f72' },
      command: 'fs.write',
      workingDir: 'E:/workspace',
      risk: 'high',
    });
    await service.approvePending({
      ownerUserId: 'user-1',
      sessionId: 'core-session-2',
      command: 'fs.write',
      workingDir: 'E:/workspace',
      requestId: pending.request.requestId,
      decision: 'once',
    });
    await expect(pending.response).resolves.toMatchObject({ approved: true, authorizationSource: 'once' });
    expect(grants).toHaveLength(0);
  });
});
