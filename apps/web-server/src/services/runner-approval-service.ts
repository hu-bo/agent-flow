import { randomBytes, randomUUID } from 'node:crypto';

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
  cmd: string;
  workdir: string;
  risk: 'low' | 'medium' | 'high';
  reason?: string;
}

export interface ApprovalWaitResult {
  approved: boolean;
  requestId: string;
  ticket?: string;
  ticketId?: string;
  reason?: string;
}

export class RunnerApprovalService {
  private readonly tickets = new Map<string, ApprovalTicketRecord>();
  private readonly pending = new Map<string, PendingApprovalRecord>();

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
      scope: {
        session_id: record.sessionId,
        cmd: record.command,
        workdir: record.workingDir,
      },
    };
  }

  waitForApproval(input: ApprovalWaitInput): {
    request: ApprovalWaitRequest;
    response: Promise<ApprovalWaitResult>;
  } {
    this.pruneExpired();
    const requestId = `appr_${randomUUID()}`;
    const timeoutMs = clampApprovalWaitMs(input.timeoutMs);
    const expiresAtMs = Date.now() + timeoutMs;
    let timeoutHandle: NodeJS.Timeout | undefined;
    let abortListener: (() => void) | undefined;

    const response = new Promise<ApprovalWaitResult>((resolve) => {
      const record: PendingApprovalRecord = {
        requestId,
        ownerUserId: input.ownerUserId,
        sessionId: input.sessionId,
        command: input.command,
        workingDir: input.workingDir,
        risk: input.risk,
        reason: input.reason,
        expiresAtMs,
        resolve: (result) => {
          if (timeoutHandle) {
            clearTimeout(timeoutHandle);
          }
          if (abortListener) {
            input.signal?.removeEventListener('abort', abortListener);
          }
          this.pending.delete(requestId);
          resolve(result);
        },
      };
      this.pending.set(requestId, record);
      abortListener = () => {
        record.resolve({
          approved: false,
          requestId,
          reason: 'approval request aborted',
        });
      };
      if (input.signal?.aborted) {
        abortListener();
        return;
      }
      input.signal?.addEventListener('abort', abortListener, { once: true });
      timeoutHandle = setTimeout(() => {
        record.resolve({
          approved: false,
          requestId,
          reason: 'approval request timed out',
        });
      }, timeoutMs);
      timeoutHandle.unref?.();
    });

    return {
      request: {
        requestId,
        session_id: input.sessionId,
        cmd: input.command,
        workdir: input.workingDir,
        risk: input.risk,
        ...(input.reason ? { reason: input.reason } : {}),
      },
      response,
    };
  }

  approvePending(input: IssueApprovalTicketInput & { requestId?: string }): ApprovalTicketIssueResult {
    this.pruneExpired();
    const pending = this.findPendingApproval(input);
    const issued = this.issue(input);
    pending?.resolve({
      approved: true,
      requestId: pending.requestId,
      ticket: issued.approval_ticket,
      ticketId: issued.ticket_id,
    });
    return pending
      ? {
          ...issued,
          approved_request_id: pending.requestId,
        }
      : issued;
  }

  consumeAndValidate(input: ApprovalTicketValidationInput): ApprovalTicketValidationResult {
    this.pruneExpired();
    const record = this.tickets.get(input.ticket);
    if (!record) {
      return { ok: false, reason: 'approval ticket not found or expired' };
    }
    if (record.consumedAtMs) {
      return { ok: false, reason: 'approval ticket already consumed', ticketId: record.ticketId };
    }
    if (record.ownerUserId !== input.ownerUserId) {
      return { ok: false, reason: 'approval ticket owner mismatch', ticketId: record.ticketId };
    }
    if (record.sessionId !== input.sessionId) {
      return { ok: false, reason: 'approval ticket session mismatch', ticketId: record.ticketId };
    }
    if (record.command !== input.command) {
      return { ok: false, reason: 'approval ticket command mismatch', ticketId: record.ticketId };
    }
    if (record.workingDir !== input.workingDir) {
      return { ok: false, reason: 'approval ticket working directory mismatch', ticketId: record.ticketId };
    }

    record.consumedAtMs = Date.now();
    return {
      ok: true,
      ticketId: record.ticketId,
    };
  }

  private pruneExpired(): void {
    const now = Date.now();
    for (const [ticket, record] of this.tickets.entries()) {
      if (record.expiresAtMs <= now) {
        this.tickets.delete(ticket);
      }
    }
    for (const [requestId, record] of this.pending.entries()) {
      if (record.expiresAtMs <= now) {
        this.pending.delete(requestId);
        record.resolve({
          approved: false,
          requestId,
          reason: 'approval request expired',
        });
      }
    }
  }

  private findPendingApproval(input: IssueApprovalTicketInput & { requestId?: string }): PendingApprovalRecord | undefined {
    if (input.requestId) {
      const exact = this.pending.get(input.requestId);
      if (exact && matchesPendingApproval(exact, input)) {
        return exact;
      }
      return undefined;
    }

    for (const record of this.pending.values()) {
      if (matchesPendingApproval(record, input)) {
        return record;
      }
    }
    return undefined;
  }
}

function matchesPendingApproval(
  record: PendingApprovalRecord,
  input: IssueApprovalTicketInput,
): boolean {
  return (
    record.ownerUserId === input.ownerUserId &&
    record.sessionId === input.sessionId &&
    record.command === input.command &&
    record.workingDir === input.workingDir
  );
}

function buildOpaqueTicket(): string {
  const entropy = randomBytes(18).toString('base64url');
  return `aft_${entropy}`;
}

function clampTtlSec(ttlSec: number | undefined): number {
  if (typeof ttlSec !== 'number' || !Number.isFinite(ttlSec)) {
    return 120;
  }
  return Math.max(30, Math.min(600, Math.floor(ttlSec)));
}

function clampApprovalWaitMs(timeoutMs: number | undefined): number {
  if (typeof timeoutMs !== 'number' || !Number.isFinite(timeoutMs)) {
    return 5 * 60 * 1000;
  }
  return Math.max(30_000, Math.min(10 * 60 * 1000, Math.floor(timeoutMs)));
}
