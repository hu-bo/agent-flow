import { AppError } from './errors.js';

export type ApprovalRiskLevel = 'low' | 'medium' | 'high';

export interface ApprovalRequiredPayload {
  sessionId: string;
  command: string;
  workingDir: string;
  riskLevel: ApprovalRiskLevel;
  reason?: string;
}

const APPROVAL_REQUIRED_ERROR_PREFIX = 'APPROVAL_REQUIRED::';

export function encodeApprovalRequiredError(payload: ApprovalRequiredPayload): string {
  return `${APPROVAL_REQUIRED_ERROR_PREFIX}${JSON.stringify(payload)}`;
}

export function parseApprovalRequiredErrorMessage(message: string): ApprovalRequiredPayload | null {
  if (!message.startsWith(APPROVAL_REQUIRED_ERROR_PREFIX)) {
    return null;
  }

  const rawPayload = message.slice(APPROVAL_REQUIRED_ERROR_PREFIX.length).trim();
  if (!rawPayload) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawPayload);
    return normalizeApprovalPayload(parsed);
  } catch {
    return null;
  }
}

export function extractApprovalRequiredFromError(error: unknown): ApprovalRequiredPayload | null {
  if (error instanceof AppError && error.code === 'APPROVAL_REQUIRED') {
    return normalizeApprovalPayload(error.details);
  }

  if (error instanceof Error) {
    return parseApprovalRequiredErrorMessage(error.message);
  }

  return null;
}

function normalizeApprovalPayload(value: unknown): ApprovalRequiredPayload | null {
  const candidate =
    isRecord(value) && isRecord(value.requiredApproval) ? { ...value.requiredApproval, reason: value.reason } : value;

  if (!isRecord(candidate)) {
    return null;
  }

  const sessionId = asNonEmptyString(candidate.sessionId);
  const command = asNonEmptyString(candidate.command);
  const workingDir = asNonEmptyString(candidate.workingDir);
  const riskLevel = asRiskLevel(candidate.riskLevel);
  const reason = asNonEmptyString(candidate.reason);

  if (!sessionId || !command || !workingDir) {
    return null;
  }

  return {
    sessionId,
    command,
    workingDir,
    riskLevel,
    ...(reason ? { reason } : {}),
  };
}

function asRiskLevel(value: unknown): ApprovalRiskLevel {
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value;
  }
  return 'high';
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
