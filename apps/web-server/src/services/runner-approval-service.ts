import { randomUUID } from 'node:crypto';
import { IsNull } from 'typeorm';
import type { AppDataSource } from '../db/data-source.js';
import { AuditLogEntity } from '../db/entities/audit-log.entity.js';
import { RunnerApprovalGrantEntity } from '../db/entities/runner-approval-grant.entity.js';
import { ChatSessionEntity } from '../db/entities/chat-session.entity.js';
import { ProjectEntity } from '../db/entities/project.entity.js';
import { AppError } from '../lib/errors.js';

export interface RunnerApprovalScope {
  type: 'project' | 'chat';
  id: string;
  label?: string;
}

interface PendingApprovalRecord {
  requestId: string;
  ownerUserId: string;
  sessionId: string;
  runnerId: string;
  scope: RunnerApprovalScope;
  command: string;
  workingDir: string;
  risk: 'low' | 'medium' | 'high';
  reason?: string;
  expiresAtMs: number;
  resolve: (result: ApprovalWaitResult) => void;
}

export interface ApprovalWaitInput {
  ownerUserId: string;
  sessionId: string;
  runnerId: string;
  scope: RunnerApprovalScope;
  command: string;
  workingDir: string;
  risk: 'low' | 'medium' | 'high';
  reason?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface ApprovalWaitRequest {
  requestId: string;
  sessionId: string;
  runnerId: string;
  scopeType: 'project' | 'chat';
  scopeId: string;
  scopeLabel?: string;
  command: string;
  workingDir: string;
  risk: 'low' | 'medium' | 'high';
  reason?: string;
}

export interface ApprovalWaitResult {
  approved: boolean;
  requestId: string;
  decision: 'once' | 'always' | 'deny';
  persistentGrantId?: string;
  reason?: string;
}

export interface ApprovalDecisionResult {
  requestId: string;
  decision: 'once' | 'always' | 'deny';
  approved: boolean;
  persistentGrantId?: string;
}

export interface RunnerApprovalGrantView {
  grantId: string;
  runnerId: string;
  scopeType: 'project' | 'chat';
  scopeId: string;
  scopeLabel?: string;
  coverage: 'all_high_risk';
  createdAt: string;
  lastUsedAt?: string;
}

export class RunnerApprovalService {
  private readonly pending = new Map<string, PendingApprovalRecord>();

  constructor(private readonly db: AppDataSource) {}

  waitForApproval(input: ApprovalWaitInput): { request: ApprovalWaitRequest; response: Promise<ApprovalWaitResult> } {
    this.pruneExpired();
    const requestId = `appr_${randomUUID()}`;
    const timeoutMs = clampApprovalWaitMs(input.timeoutMs);
    const expiresAtMs = Date.now() + timeoutMs;
    let timeoutHandle: NodeJS.Timeout | undefined;
    let abortListener: (() => void) | undefined;
    const response = new Promise<ApprovalWaitResult>((resolve) => {
      const record: PendingApprovalRecord = {
        ...input,
        requestId,
        expiresAtMs,
        resolve: (result) => {
          if (timeoutHandle) clearTimeout(timeoutHandle);
          if (abortListener) input.signal?.removeEventListener('abort', abortListener);
          this.pending.delete(requestId);
          resolve(result);
        },
      };
      this.pending.set(requestId, record);
      abortListener = () => record.resolve({
        approved: false,
        requestId,
        decision: 'deny',
        reason: 'approval request aborted',
      });
      if (input.signal?.aborted) {
        abortListener();
        return;
      }
      input.signal?.addEventListener('abort', abortListener, { once: true });
      timeoutHandle = setTimeout(
        () => record.resolve({
          approved: false,
          requestId,
          decision: 'deny',
          reason: 'approval request timed out',
        }),
        timeoutMs,
      );
      timeoutHandle.unref?.();
    });
    return {
      request: {
        requestId,
        sessionId: input.sessionId,
        runnerId: input.runnerId,
        scopeType: input.scope.type,
        scopeId: input.scope.id,
        scopeLabel: input.scope.label,
        command: input.command,
        workingDir: input.workingDir,
        risk: input.risk,
        reason: input.reason,
      },
      response,
    };
  }

  async decidePending(input: {
    ownerUserId: string;
    requestId: string;
    decision: 'once' | 'always' | 'deny';
  }): Promise<ApprovalDecisionResult> {
    this.pruneExpired();
    const pending = this.pending.get(input.requestId);
    if (!pending || pending.ownerUserId !== input.ownerUserId) {
      throw new AppError(404, 'APPROVAL_REQUEST_NOT_FOUND', `Approval request not found or expired: ${input.requestId}`);
    }
    if (input.decision === 'deny') {
      pending.resolve({
        approved: false,
        requestId: pending.requestId,
        decision: 'deny',
        reason: 'denied by user',
      });
      return { requestId: pending.requestId, decision: 'deny', approved: false };
    }
    if (input.decision === 'always') {
      const grant = await this.createPersistentGrant(pending);
      for (const record of [...this.pending.values()]) {
        if (samePersistentScope(record, pending)) {
          record.resolve({
            approved: true,
            requestId: record.requestId,
            decision: 'always',
            persistentGrantId: grant.grantId,
          });
        }
      }
      return {
        requestId: pending.requestId,
        decision: 'always',
        approved: true,
        persistentGrantId: grant.grantId,
      };
    }
    pending.resolve({
      approved: true,
      requestId: pending.requestId,
      decision: 'once',
    });
    return { requestId: pending.requestId, decision: 'once', approved: true };
  }

  async findPersistentGrant(input: {
    ownerUserId: string;
    runnerId: string;
    scope: RunnerApprovalScope;
    markUsed?: boolean;
  }): Promise<RunnerApprovalGrantView | undefined> {
    const repository = this.db.getRepository(RunnerApprovalGrantEntity);
    const grant = await repository.findOne({
      where: {
        ownerUserId: input.ownerUserId,
        runnerId: input.runnerId,
        projectId: input.scope.type === 'project' ? input.scope.id : IsNull(),
        chatSessionId: input.scope.type === 'chat' ? input.scope.id : IsNull(),
        revokedAt: IsNull(),
      },
    });
    if (!grant) return undefined;
    if (input.markUsed !== false) {
      grant.lastUsedAt = new Date();
      await repository.save(grant);
      await this.audit('runner.approval_grant.used', grant, input.ownerUserId);
    }
    return toGrantView(grant);
  }

  async listPersistentGrants(ownerUserId: string): Promise<RunnerApprovalGrantView[]> {
    const grants = await this.db.getRepository(RunnerApprovalGrantEntity).find({
      where: { ownerUserId, revokedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
    return Promise.all(grants.map(async (grant) => {
      const scopeLabel = grant.projectId
        ? (await this.db.getRepository(ProjectEntity).findOne({ where: { projectId: grant.projectId, ownerUserId } }))?.name
        : (await this.db.getRepository(ChatSessionEntity).findOne({ where: { sessionId: grant.chatSessionId!, ownerUserId } }))?.title ?? undefined;
      return toGrantView(grant, scopeLabel ?? undefined);
    }));
  }

  async revokePersistentGrant(ownerUserId: string, grantId: string): Promise<void> {
    const repository = this.db.getRepository(RunnerApprovalGrantEntity);
    const grant = await repository.findOne({ where: { grantId, ownerUserId, revokedAt: IsNull() } });
    if (!grant) throw new AppError(404, 'APPROVAL_GRANT_NOT_FOUND', `Approval grant not found: ${grantId}`);
    grant.revokedAt = new Date();
    await repository.save(grant);
    await this.audit('runner.approval_grant.revoked', grant, ownerUserId);
  }

  private async createPersistentGrant(pending: PendingApprovalRecord): Promise<RunnerApprovalGrantEntity> {
    if (pending.scope.type === 'project') {
      const project = await this.db.getRepository(ProjectEntity).findOne({
        where: { projectId: pending.scope.id, ownerUserId: pending.ownerUserId },
      });
      if (!project) throw new AppError(403, 'APPROVAL_SCOPE_FORBIDDEN', 'Project approval scope is not owned by the current user.');
    } else {
      const session = await this.db.getRepository(ChatSessionEntity).findOne({
        where: { sessionId: pending.scope.id, ownerUserId: pending.ownerUserId, projectId: IsNull() },
      });
      if (!session) throw new AppError(403, 'APPROVAL_SCOPE_FORBIDDEN', 'Chat approval scope is not an owned non-project chat.');
    }
    const existing = await this.findGrantEntity(pending.ownerUserId, pending.runnerId, pending.scope);
    if (existing) return existing;
    const repository = this.db.getRepository(RunnerApprovalGrantEntity);
    const grant = repository.create({
      ownerUserId: pending.ownerUserId,
      runnerId: pending.runnerId,
      projectId: pending.scope.type === 'project' ? pending.scope.id : null,
      chatSessionId: pending.scope.type === 'chat' ? pending.scope.id : null,
      coverage: 'all_high_risk',
      lastUsedAt: new Date(),
      revokedAt: null,
    });
    let saved: RunnerApprovalGrantEntity;
    try {
      saved = await repository.save(grant);
    } catch (error) {
      const code = error && typeof error === 'object' ? (error as { code?: unknown }).code : undefined;
      if (code !== '23505') throw error;
      const concurrent = await this.findGrantEntity(pending.ownerUserId, pending.runnerId, pending.scope);
      if (!concurrent) throw error;
      return concurrent;
    }
    await this.audit('runner.approval_grant.created', saved, pending.ownerUserId);
    return saved;
  }

  private async findGrantEntity(ownerUserId: string, runnerId: string, scope: RunnerApprovalScope) {
    return this.db.getRepository(RunnerApprovalGrantEntity).findOne({
      where: {
        ownerUserId,
        runnerId,
        projectId: scope.type === 'project' ? scope.id : IsNull(),
        chatSessionId: scope.type === 'chat' ? scope.id : IsNull(),
        revokedAt: IsNull(),
      },
    });
  }

  private async audit(action: string, grant: RunnerApprovalGrantEntity, actor: string): Promise<void> {
    const repository = this.db.getRepository(AuditLogEntity);
    await repository.save(repository.create({
      actor,
      action,
      resource: 'runner_approval_grant',
      resourceId: grant.grantId,
      requestId: null,
      before: null,
      after: toGrantView(grant) as unknown as Record<string, unknown>,
    }));
  }

  private pruneExpired(): void {
    const now = Date.now();
    for (const record of [...this.pending.values()]) {
      if (record.expiresAtMs <= now) {
        record.resolve({
          approved: false,
          requestId: record.requestId,
          decision: 'deny',
          reason: 'approval request expired',
        });
      }
    }
  }
}

function samePersistentScope(left: PendingApprovalRecord, right: PendingApprovalRecord): boolean {
  return left.ownerUserId === right.ownerUserId
    && left.runnerId === right.runnerId
    && left.scope.type === right.scope.type
    && left.scope.id === right.scope.id;
}

function toGrantView(grant: RunnerApprovalGrantEntity, scopeLabel?: string): RunnerApprovalGrantView {
  return {
    grantId: grant.grantId,
    runnerId: grant.runnerId,
    scopeType: grant.projectId ? 'project' : 'chat',
    scopeId: grant.projectId ?? grant.chatSessionId!,
    scopeLabel,
    coverage: grant.coverage,
    createdAt: grant.createdAt.toISOString(),
    lastUsedAt: grant.lastUsedAt?.toISOString(),
  };
}

function clampApprovalWaitMs(timeoutMs: number | undefined): number {
  if (typeof timeoutMs !== 'number' || !Number.isFinite(timeoutMs)) return 5 * 60 * 1000;
  return Math.max(30_000, Math.min(10 * 60 * 1000, Math.floor(timeoutMs)));
}
