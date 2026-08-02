import type { RunnerTask } from '@agent-flow/core';
import { randomUUID } from 'node:crypto';
import { AppError } from '../lib/errors.js';
import { isReadOnlyShellExec } from './runner-command-policy.js';
import {
  RunnerApprovalService,
  type RunnerApprovalScope,
} from './runner-approval-service.js';

export interface PendingSandboxPolicy {
  enabled: boolean;
  readOnly: boolean;
  allowNetwork: boolean;
  allowedWorkingDirs: string[];
  allowedReadPaths: string[];
  allowedWritePaths: string[];
  blockedCommandFragments: string[];
  allowedEnvKeys: string[];
  deniedEnvKeys: string[];
}

export type PendingRunnerEngine = 'host' | 'docker';

export interface PendingDockerSpec {
  image: string;
  workDir?: string;
  user?: string;
  networkDisabled?: boolean;
  readOnlyRootFs?: boolean;
  mounts?: Array<{ source: string; target: string; readOnly?: boolean }>;
  cpuLimitMillis?: number;
  memoryLimitBytes?: number;
  pidsLimit?: number;
  diskLimitBytes?: number;
}

export interface PendingRunnerTask {
  taskId: string;
  sessionId: string;
  stepId: string;
  command: string;
  args: string[];
  timeoutMs?: number;
  env?: Record<string, string>;
  stream: boolean;
  input?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  workingDir: string;
  sandboxPolicy: PendingSandboxPolicy;
  engine: PendingRunnerEngine;
  docker?: PendingDockerSpec;
  executionId: string;
  attempt: number;
  deadline: string;
  maxOutputBytes: number;
  resumeFromEventSequence: number;
}

export interface TaskApprovalResult {
  ok: boolean;
  reason?: string;
  persistentGrantId?: string;
  decision?: 'once' | 'always';
}

export function readPersistedOutboundTask(payload: Record<string, unknown>): PendingRunnerTask | undefined {
  const raw = payload.outboundTask;
  if (!isRecord(raw) || !isRecord(raw.sandboxPolicy)) return undefined;
  if (typeof raw.taskId !== 'string' || typeof raw.sessionId !== 'string' || typeof raw.stepId !== 'string') return undefined;
  if (typeof raw.command !== 'string' || !Array.isArray(raw.args) || typeof raw.workingDir !== 'string') return undefined;
  if (raw.engine !== 'host' && raw.engine !== 'docker') return undefined;
  if (typeof raw.executionId !== 'string' || typeof raw.attempt !== 'number' || typeof raw.deadline !== 'string') return undefined;
  if (typeof raw.maxOutputBytes !== 'number' || typeof raw.resumeFromEventSequence !== 'number') return undefined;
  const sandbox = raw.sandboxPolicy;
  const stringArray = (value: unknown): value is string[] =>
    Array.isArray(value) && value.every((entry) => typeof entry === 'string');
  if (
    typeof sandbox.enabled !== 'boolean' ||
    typeof sandbox.readOnly !== 'boolean' ||
    typeof sandbox.allowNetwork !== 'boolean' ||
    !stringArray(sandbox.allowedWorkingDirs) ||
    !stringArray(sandbox.allowedReadPaths) ||
    !stringArray(sandbox.allowedWritePaths) ||
    !stringArray(sandbox.blockedCommandFragments) ||
    !stringArray(sandbox.allowedEnvKeys) ||
    !stringArray(sandbox.deniedEnvKeys)
  ) return undefined;
  return raw as unknown as PendingRunnerTask;
}

export function resolveTaskWorkingDir(metadata: Record<string, unknown> | undefined): string {
  for (const candidate of [metadata?.cwd, metadata?.workingDir, metadata?.sessionCwd]) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return process.cwd();
}

export function resolveEngine(metadata: Record<string, unknown> | undefined): PendingRunnerEngine {
  return metadata?.runnerEngine === 'docker' ? 'docker' : 'host';
}

export function resolveExecutionId(metadata: Record<string, unknown> | undefined, taskId: string): string {
  const configured = metadata?.executionId;
  return typeof configured === 'string' && configured.trim()
    ? configured.trim()
    : `${taskId}:${randomUUID()}`;
}

export function resolveExecutionAttempt(metadata: Record<string, unknown> | undefined): number {
  const configured = metadata?.executionAttempt;
  return typeof configured === 'number' && Number.isInteger(configured) && configured > 0 ? configured : 1;
}

export function resolveMaxOutputBytes(metadata: Record<string, unknown> | undefined): number {
  const configured = metadata?.maxOutputBytes;
  if (typeof configured !== 'number' || !Number.isFinite(configured)) return 4 * 1024 * 1024;
  return Math.min(64 * 1024 * 1024, Math.max(64 * 1024, Math.floor(configured)));
}

export function resolveDockerSpec(
  metadata: Record<string, unknown> | undefined,
  engine: PendingRunnerEngine,
): PendingDockerSpec | undefined {
  if (engine !== 'docker') return undefined;
  const raw = metadata?.runnerDocker;
  if (!isRecord(raw) || typeof raw.image !== 'string' || !raw.image.trim()) {
    throw new AppError(
      400,
      'RUNNER_DOCKER_IMAGE_REQUIRED',
      'metadata.runnerDocker.image is required for Docker execution',
    );
  }
  const mounts = Array.isArray(raw.mounts)
    ? raw.mounts.flatMap((mount) => {
        if (!isRecord(mount) || typeof mount.source !== 'string' || typeof mount.target !== 'string') return [];
        return [{ source: mount.source, target: mount.target, readOnly: mount.readOnly === true }];
      })
    : undefined;
  return {
    image: raw.image.trim(),
    workDir: readOptionalString(raw.workDir),
    user: readOptionalString(raw.user),
    networkDisabled: raw.networkDisabled !== false,
    readOnlyRootFs: raw.readOnlyRootFs !== false,
    mounts,
    cpuLimitMillis: readOptionalPositiveInteger(raw.cpuLimitMillis),
    memoryLimitBytes: readOptionalPositiveInteger(raw.memoryLimitBytes),
    pidsLimit: readOptionalPositiveInteger(raw.pidsLimit),
    diskLimitBytes: readOptionalPositiveInteger(raw.diskLimitBytes),
  };
}

export function deriveSandboxPolicy(
  command: string,
  workingDir: string,
  input: Record<string, unknown> | undefined,
): PendingSandboxPolicy {
  const readOnlyCommands = new Set([
    'fs.read', 'fs.stat', 'fs.list', 'fs.glob', 'fs.search', 'fs.roots',
    'git.status', 'git.diff', 'git.show',
  ]);
  const writeCommands = new Set(['fs.write', 'fs.patch', 'fs.multiPatch', 'fs.applyPatch', 'git.apply']);
  const semanticFsReadOnly = readOnlyCommands.has(command);
  const semanticFsWrite = writeCommands.has(command);
  const shellExec = command === 'shell.exec';
  const shellReadOnly = shellExec && isReadOnlyShellExec(input);
  return {
    enabled: semanticFsReadOnly || semanticFsWrite || shellExec || !isKnownSafeCommand(command),
    readOnly: semanticFsReadOnly || shellReadOnly,
    allowNetwork: false,
    allowedWorkingDirs: [workingDir],
    allowedReadPaths: semanticFsReadOnly
      ? uniqueStrings([workingDir, ...extractAbsoluteFsInputPaths(input)])
      : [workingDir],
    allowedWritePaths: semanticFsWrite ? [workingDir] : [],
    blockedCommandFragments: [' rm ', ' rmdir ', ' del ', ' format ', ' shutdown ', ' reboot '],
    allowedEnvKeys: [],
    deniedEnvKeys: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
  };
}

export function classifyRiskLevel(
  command: string,
  input?: Record<string, unknown>,
): 'low' | 'medium' | 'high' {
  if (isKnownSafeCommand(command)) return 'low';
  if (['fs.write', 'fs.patch', 'fs.multiPatch', 'fs.applyPatch', 'git.apply'].includes(command)) return 'high';
  if (command === 'shell.exec') return isReadOnlyShellExec(input) ? 'medium' : 'high';
  return 'high';
}

export function readRequestId(metadata: Record<string, unknown> | undefined): string | undefined {
  const requestId = metadata?.requestId;
  return typeof requestId === 'string' && requestId.trim() ? requestId : undefined;
}

export function resolveApprovalScope(
  metadata: Record<string, unknown> | undefined,
  sessionId: string,
): RunnerApprovalScope {
  const raw = metadata?.approvalScope;
  if (isRecord(raw) && (raw.type === 'project' || raw.type === 'chat') && typeof raw.id === 'string' && raw.id) {
    return {
      type: raw.type,
      id: raw.id,
      label: typeof raw.label === 'string' ? raw.label : undefined,
    };
  }
  return { type: 'chat', id: sessionId };
}

export async function validateApprovalForTask(
  approvalService: RunnerApprovalService,
  task: RunnerTask,
  runnerId: string,
  scope: RunnerApprovalScope,
  riskLevel: 'low' | 'medium' | 'high',
): Promise<TaskApprovalResult> {
  if (riskLevel !== 'high') return { ok: true };
  const userId = typeof task.metadata?.userId === 'string' ? task.metadata.userId : '';
  if (!userId) return { ok: false, reason: 'missing metadata.userId' };
  const persistent = await validatePersistentApproval(approvalService, userId, runnerId, scope);
  return persistent.ok ? persistent : { ok: false, reason: 'approval is required' };
}

export async function validatePersistentApproval(
  approvalService: RunnerApprovalService,
  ownerUserId: string,
  runnerId: string,
  scope: RunnerApprovalScope,
): Promise<TaskApprovalResult> {
  const grant = await approvalService.findPersistentGrant({ ownerUserId, runnerId, scope });
  return grant
    ? { ok: true, persistentGrantId: grant.grantId, decision: 'always' }
    : { ok: false, reason: 'persistent approval grant not found or revoked' };
}

export function clampRunnerPollWait(waitMs: number | undefined): number {
  if (typeof waitMs !== 'number' || !Number.isFinite(waitMs)) return 15_000;
  return Math.min(25_000, Math.max(1_000, Math.floor(waitMs)));
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readOptionalPositiveInteger(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractAbsoluteFsInputPaths(input: Record<string, unknown> | undefined): string[] {
  const candidate = input?.path;
  if (typeof candidate !== 'string') return [];
  const path = candidate.trim();
  return /^[A-Za-z]:[\\/]/.test(path) || path.startsWith('/') || path.startsWith('\\\\') ? [path] : [];
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim()))];
}

function isKnownSafeCommand(command: string): boolean {
  return [
    'fs.read', 'fs.stat', 'fs.list', 'fs.glob', 'fs.search', 'fs.roots',
    'git.status', 'git.diff', 'git.show',
  ].includes(command);
}
