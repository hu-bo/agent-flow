import { randomBytes, randomUUID } from 'node:crypto';
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

interface ApprovalTicketRecord {
  ticket: string;
  ticketId: string;
  ownerUserId: string;
  sessionId: string;
  command: string;
  workingDir: string;
  expiresAtMs: number;
  consumedAtMs?: number;
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

export interface IssueApprovalTicketInput {
  ownerUserId: string;
  sessionId: string;
  command: string;
  workingDir: string;
  ttlSec?: number;
}

export interface ApprovalTicketScope {
  session_id: string;
  cmd: string;
  workdir: string;
}

export interface ApprovalTicketIssueResult {
  approval_ticket: string;
  ticket_id: string;
  expires_at: string;
  scope: ApprovalTicketScope;
  approved_request_id?: string;
  persistent_grant_id?: string;
  decision?: 'once' | 'always';
}

export interface ApprovalTicketValidationInput {
  ticket: string;
  ownerUserId: string;
  sessionId: string;
  command: string;
  workingDir: string;
}

interface ApprovalTicketValidationResult {
  ok: boolean;
  reason?: string;
  ticketId?: string;
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
  session_id: string;
  runner_id: string;
  scope_type: 'project' | 'chat';
  scope_id: string;
  scope_label?: string;
  cmd: string;
  workdir: string;
  risk: 'low' | 'medium' | 'high';
  reason?: string;
}

export interface ApprovalWaitResult {
  approved: boolean;
  requestId: string;
  authorizationSource?: 'once' | 'persistent';
  ticket?: string;
  ticketId?: string;
  grantId?: string;
  reason?: string;
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
  private readonly tickets = new Map<string, ApprovalTicketRecord>();
  private readonly pending = new Map<string, PendingApprovalRecord>();

  constructor(private readonly db: AppDataSource) {}

  issue(input: IssueApprovalTicketInput): ApprovalTicketIssueResult {
    this.pruneExpired();
    const nowMs = Date.now();
    const ttlSec = clampTtlSec(input.ttlSec);
    const ticket = buildOpaqueTicket();
    const ticketId = `apptk_${randomUUID()}`;
    const record: ApprovalTicketRecord = {
      ticket,
      ticketId,
      ownerUserId: input.ownerUserId,
      sessionId: input.sessionId,
      command: input.command,
      workingDir: input.workingDir,
      expiresAtMs: nowMs + ttlSec * 1000,
    };
    this.tickets.set(ticket, record);
    return {
      approval_ticket: ticket,
      ticket_id: ticketId,
      expires_at: new Date(record.expiresAtMs).toISOString(),
      scope: { session_id: record.sessionId, cmd: record.command, workdir: record.workingDir },
    };
  }

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
      abortListener = () => record.resolve({ approved: false, requestId, reason: 'approval request aborted' });
      if (input.signal?.aborted) {
        abortListener();
        return;
      }
      input.signal?.addEventListener('abort', abortListener, { once: true });
      timeoutHandle = setTimeout(
        () => record.resolve({ approved: false, requestId, reason: 'approval request timed out' }),
        timeoutMs,
      );
      timeoutHandle.unref?.();
    });
    return {
      request: {
        requestId,
        session_id: input.sessionId,
        runner_id: input.runnerId,
        scope_type: input.scope.type,
        scope_id: input.scope.id,
        scope_label: input.scope.label,
        cmd: input.command,
        workdir: input.workingDir,
        risk: input.risk,
        reason: input.reason,
      },
      response,
    };
  }

  async approvePending(
    input: IssueApprovalTicketInput & { requestId?: string; decision?: 'once' | 'always' },
  ): Promise<ApprovalTicketIssueResult> {
    this.pruneExpired();
    const pending = this.findPendingApproval(input);
    if (input.decision === 'always' && !pending) {
      throw new AppError(404, 'APPROVAL_REQUEST_NOT_FOUND', 'Persistent approval requires an active pending request.');
    }
    const issued = this.issue(input);
    let grantId: string | undefined;
    if (input.decision === 'always' && pending) {
      const grant = await this.createPersistentGrant(pending);
      grantId = grant.grantId;
      for (const record of [...this.pending.values()]) {
        if (samePersistentScope(record, pending)) {
          record.resolve({
            approved: true,
            requestId: record.requestId,
            authorizationSource: 'persistent',
            grantId,
          });
        }
      }
    } else if (pending) {
      pending.resolve({
        approved: true,
        requestId: pending.requestId,
        authorizationSource: 'once',
        ticket: issued.approval_ticket,
        ticketId: issued.ticket_id,
      });
    }
    return {
      ...issued,
      approved_request_id: pending?.requestId,
      persistent_grant_id: grantId,
      decision: input.decision ?? 'once',
    };
  }

  consumeAndValidate(input: ApprovalTicketValidationInput): ApprovalTicketValidationResult {
    this.pruneExpired();
    const record = this.tickets.get(input.ticket);
    if (!record) return { ok: false, reason: 'approval ticket not found or expired' };
    if (record.consumedAtMs) return { ok: false, reason: 'approval ticket already consumed', ticketId: record.ticketId };
    if (record.ownerUserId !== input.ownerUserId) return { ok: false, reason: 'approval ticket owner mismatch', ticketId: record.ticketId };
    if (record.sessionId !== input.sessionId) return { ok: false, reason: 'approval ticket session mismatch', ticketId: record.ticketId };
    if (record.command !== input.command) return { ok: false, reason: 'approval ticket command mismatch', ticketId: record.ticketId };
    if (record.workingDir !== input.workingDir) return { ok: false, reason: 'approval ticket working directory mismatch', ticketId: record.ticketId };
    record.consumedAtMs = Date.now();
    return { ok: true, ticketId: record.ticketId };
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
    for (const [ticket, record] of this.tickets.entries()) {
      if (record.expiresAtMs <= now) this.tickets.delete(ticket);
    }
    for (const record of [...this.pending.values()]) {
      if (record.expiresAtMs <= now) {
        record.resolve({ approved: false, requestId: record.requestId, reason: 'approval request expired' });
      }
    }
  }

  private findPendingApproval(input: IssueApprovalTicketInput & { requestId?: string }): PendingApprovalRecord | undefined {
    if (input.requestId) {
      const exact = this.pending.get(input.requestId);
      return exact && matchesPendingApproval(exact, input) ? exact : undefined;
    }
    return [...this.pending.values()].find((record) => matchesPendingApproval(record, input));
  }
}

function matchesPendingApproval(record: PendingApprovalRecord, input: IssueApprovalTicketInput): boolean {
  return record.ownerUserId === input.ownerUserId
    && record.sessionId === input.sessionId
    && record.command === input.command
    && record.workingDir === input.workingDir;
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

function buildOpaqueTicket(): string {
  return `aft_${randomBytes(18).toString('base64url')}`;
}

function clampTtlSec(ttlSec: number | undefined): number {
  if (typeof ttlSec !== 'number' || !Number.isFinite(ttlSec)) return 120;
  return Math.max(30, Math.min(600, Math.floor(ttlSec)));
}

function clampApprovalWaitMs(timeoutMs: number | undefined): number {
  if (typeof timeoutMs !== 'number' || !Number.isFinite(timeoutMs)) return 5 * 60 * 1000;
  return Math.max(30_000, Math.min(10 * 60 * 1000, Math.floor(timeoutMs)));
}
