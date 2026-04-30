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

export interface IssueApprovalTicketInput {
  ownerUserId: string;
  sessionId: string;
  command: string;
  workingDir: string;
  ttlSec?: number;
}

export interface ApprovalTicketScope {
  sessionId: string;
  command: string;
  workingDir: string;
}

export interface ApprovalTicketIssueResult {
  approvalTicket: string;
  ticketId: string;
  expiresAt: string;
  scope: ApprovalTicketScope;
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

export class RunnerApprovalService {
  private readonly tickets = new Map<string, ApprovalTicketRecord>();

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
      approvalTicket: ticket,
      ticketId,
      expiresAt: new Date(record.expiresAtMs).toISOString(),
      scope: {
        sessionId: record.sessionId,
        command: record.command,
        workingDir: record.workingDir,
      },
    };
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
  }
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
