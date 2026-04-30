import type { RunnerEvent, RunnerTask } from '@agent-flow/core';
import type { StructuredLogger } from '@agent-flow/events';
import { AppError } from '../lib/errors.js';
import { AsyncQueue } from '../lib/async-queue.js';
import { RunnerRegistryService } from './runner-registry-service.js';
import { RunnerApprovalService } from './runner-approval-service.js';

interface PendingSandboxPolicy {
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

type PendingRunnerEngine = 'host' | 'docker';

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
}

interface RunnerExecution {
  runnerId: string;
  task: RunnerTask;
  queue: AsyncQueue<RunnerEvent>;
  timeoutHandle: NodeJS.Timeout;
  cancelRequested: boolean;
  failedReason?: string;
}

export interface RunnerDispatchPollInput {
  runnerId: string;
  runnerToken: string;
  waitMs?: number;
}

export interface RunnerTaskEventInput {
  runnerId: string;
  runnerToken: string;
  taskId: string;
  event: RunnerInboundEvent;
}

export type RunnerOutboundMessage =
  | {
      type: 'run_task';
      task: PendingRunnerTask;
    }
  | {
      type: 'cancel_task';
      taskId: string;
      reason: string;
    };

type RunnerInboundEvent =
  | {
      type: 'started';
      timestamp?: string;
      runnerId?: string;
      task?: RunnerTask;
    }
  | {
      type: 'stdout';
      timestamp?: string;
      runnerId?: string;
      chunk: string;
    }
  | {
      type: 'stderr';
      timestamp?: string;
      runnerId?: string;
      chunk: string;
    }
  | {
      type: 'progress';
      timestamp?: string;
      runnerId?: string;
      message: string;
      percent?: number;
    }
  | {
      type: 'result';
      timestamp?: string;
      runnerId?: string;
      result: unknown;
    }
  | {
      type: 'error';
      timestamp?: string;
      runnerId?: string;
      error: string;
      retryable?: boolean;
    }
  | {
      type: 'completed';
      timestamp?: string;
      runnerId?: string;
      exitCode: number;
      durationMs: number;
    };

export class RunnerDispatchService {
  private readonly pendingByRunner = new Map<string, RunnerOutboundMessage[]>();
  private readonly waitingByRunner = new Map<string, Set<(task: RunnerOutboundMessage | null) => void>>();
  private readonly executions = new Map<string, RunnerExecution>();

  constructor(
    private readonly runnerRegistryService: RunnerRegistryService,
    private readonly runnerApprovalService: RunnerApprovalService,
    private readonly logger?: StructuredLogger,
  ) {}

  canDispatchSync(task: RunnerTask): boolean {
    return typeof task.metadata?.userId === 'string' && task.metadata.userId.trim().length > 0;
  }

  async *execute(task: RunnerTask, signal?: AbortSignal): AsyncIterable<RunnerEvent> {
    const userId = task.metadata?.userId;
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      throw new AppError(400, 'RUNNER_USER_REQUIRED', 'runner task is missing metadata.userId');
    }

    const preferredRunnerId =
      typeof task.metadata?.preferredRunnerId === 'string' ? task.metadata.preferredRunnerId : undefined;
    const preferredRunnerKind =
      task.metadata?.preferredRunnerKind === 'local' ||
      task.metadata?.preferredRunnerKind === 'remote' ||
      task.metadata?.preferredRunnerKind === 'sandbox'
        ? task.metadata.preferredRunnerKind
        : undefined;

    const runner = await this.runnerRegistryService.pickRunnableRunner(userId, task.command, {
      preferredRunnerId,
      preferredRunnerKind,
    });
    if (!runner) {
      throw new AppError(409, 'RUNNER_NOT_AVAILABLE', 'No online runner is available for this task');
    }

    const execution = this.createExecution(task.taskId, runner.runnerId, task.timeoutMs, task);
    const abortListener = () => {
      this.requestCancellation(task.taskId, 'Runner task aborted by signal');
      this.failExecution(task.taskId, 'Runner task aborted by signal');
    };
    signal?.addEventListener('abort', abortListener, { once: true });

    try {
      const workingDir = resolveTaskWorkingDir(task.metadata);
      const sandboxPolicy = deriveSandboxPolicy(task.command, workingDir);
      const engine = resolveEngine(task.metadata);
      const riskLevel = classifyRiskLevel(task.command);
      const approval = validateApprovalForTask(this.runnerApprovalService, task, workingDir, riskLevel);
      if (riskLevel === 'high' && !approval.ok) {
        throw new AppError(
          403,
          'APPROVAL_REQUIRED',
          `Approval required before running high-risk command "${task.command}". Request an approval ticket and retry.`,
          {
            requiredApproval: {
              sessionId: task.sessionId,
              command: task.command,
              workingDir,
              riskLevel,
            },
            reason: approval.reason ?? 'approval is missing',
          },
        );
      }
      this.enqueueForRunner(runner.runnerId, {
        type: 'run_task',
        task: {
          taskId: task.taskId,
          sessionId: task.sessionId,
          stepId: task.stepId,
          command: task.command,
          args: task.args,
          timeoutMs: task.timeoutMs,
          env: task.env,
          stream: task.stream,
          input: task.input,
          metadata: task.metadata,
          workingDir,
          sandboxPolicy,
          engine,
        },
      });
      this.logger?.info('runner.dispatch.enqueued', 'runner task enqueued', {
        attributes: {
          taskId: task.taskId,
          sessionId: task.sessionId,
          stepId: task.stepId,
          runnerId: runner.runnerId,
          userId,
          command: task.command,
          engine,
          workingDir,
          riskLevel,
          sandboxEnabled: sandboxPolicy.enabled,
          sandboxReadOnly: sandboxPolicy.readOnly,
          sandboxAllowNetwork: sandboxPolicy.allowNetwork,
          approvalTicketId: approval.ticketId,
        },
      });

      for await (const event of execution.queue) {
        yield event;
      }
    } finally {
      signal?.removeEventListener('abort', abortListener);
      const latest = this.executions.get(task.taskId);
      if (latest?.failedReason) {
        const failedReason = latest.failedReason;
        this.cleanupExecution(task.taskId);
        throw new Error(failedReason);
      }
      this.cleanupExecution(task.taskId);
    }
  }

  async nextOutboundMessage(input: RunnerDispatchPollInput): Promise<RunnerOutboundMessage | null> {
    const waitMs = clampWaitMs(input.waitMs);
    await this.runnerRegistryService.authorizeRunnerConnection(input.runnerId, input.runnerToken);
    const immediate = this.dequeueFromRunner(input.runnerId);
    if (immediate) {
      return immediate;
    }

    return new Promise<RunnerOutboundMessage | null>((resolve) => {
      const resolver = (task: RunnerOutboundMessage | null) => {
        clearTimeout(timer);
        const waiters = this.waitingByRunner.get(input.runnerId);
        if (waiters) {
          waiters.delete(resolver);
          if (waiters.size === 0) {
            this.waitingByRunner.delete(input.runnerId);
          }
        }
        resolve(task);
      };

      const waiters = this.waitingByRunner.get(input.runnerId) ?? new Set<(task: RunnerOutboundMessage | null) => void>();
      waiters.add(resolver);
      this.waitingByRunner.set(input.runnerId, waiters);

      const timer = setTimeout(() => resolver(null), waitMs);
      timer.unref?.();
    });
  }

  async acceptTaskEvent(input: RunnerTaskEventInput): Promise<void> {
    await this.runnerRegistryService.authorizeRunnerConnection(input.runnerId, input.runnerToken);
    const execution = this.executions.get(input.taskId);
    if (!execution) {
      return;
    }
    if (execution.runnerId !== input.runnerId) {
      return;
    }

    const normalized = normalizeRunnerEvent(input.event, execution.task, input.runnerId);
    execution.queue.push(normalized);
    if (normalized.type === 'completed' || normalized.type === 'error') {
      const userId = typeof execution.task.metadata?.userId === 'string' ? execution.task.metadata.userId : undefined;
      this.logger?.info('runner.dispatch.completed', 'runner task completed', {
        attributes: {
          taskId: execution.task.taskId,
          sessionId: execution.task.sessionId,
          stepId: execution.task.stepId,
          runnerId: input.runnerId,
          userId,
          command: execution.task.command,
          eventType: normalized.type,
          exitCode: normalized.type === 'completed' ? normalized.exitCode : undefined,
          durationMs: normalized.type === 'completed' ? normalized.durationMs : undefined,
          error: normalized.type === 'error' ? normalized.error : undefined,
          riskLevel: classifyRiskLevel(execution.task.command),
        },
      });
    }

    if (normalized.type === 'error') {
      execution.failedReason = normalized.error || 'Runner execution failed';
      execution.queue.close();
      return;
    }
    if (normalized.type === 'completed') {
      execution.queue.close();
    }
  }

  requestCancellation(taskId: string, reason: string): boolean {
    const execution = this.executions.get(taskId);
    if (!execution) {
      return false;
    }
    if (execution.cancelRequested) {
      return true;
    }

    execution.cancelRequested = true;
    this.enqueueForRunner(execution.runnerId, {
      type: 'cancel_task',
      taskId,
      reason: reason.trim() || 'task cancelled by server',
    });
    this.logger?.info('runner.dispatch.cancel.enqueued', 'runner task cancellation requested', {
      attributes: {
        taskId,
        runnerId: execution.runnerId,
        reason,
      },
    });
    return true;
  }

  private createExecution(taskId: string, runnerId: string, timeoutMs: number | undefined, task: RunnerTask): RunnerExecution {
    const existing = this.executions.get(taskId);
    if (existing) {
      throw new AppError(409, 'RUNNER_TASK_CONFLICT', `Runner task already exists: ${taskId}`);
    }

    const queue = new AsyncQueue<RunnerEvent>();
    const timeout = Math.max(1_000, (timeoutMs ?? 30_000) + 5_000);
    const timeoutHandle = setTimeout(() => {
      this.requestCancellation(taskId, `Runner task timed out after ${timeout}ms`);
      this.failExecution(taskId, `Runner task timeout after ${timeout}ms`);
    }, timeout);
    timeoutHandle.unref?.();

    const execution: RunnerExecution = {
      runnerId,
      task,
      queue,
      timeoutHandle,
      cancelRequested: false,
    };
    this.executions.set(taskId, execution);
    return execution;
  }

  private failExecution(taskId: string, reason: string): void {
    const execution = this.executions.get(taskId);
    if (!execution) return;
    execution.queue.push({
      type: 'error',
      timestamp: new Date().toISOString(),
      runnerId: execution.runnerId,
      error: reason,
      retryable: false,
    });
    execution.failedReason = reason;
    execution.queue.close();
  }

  private cleanupExecution(taskId: string): void {
    const execution = this.executions.get(taskId);
    if (!execution) return;
    clearTimeout(execution.timeoutHandle);
    execution.queue.close();
    this.executions.delete(taskId);
  }

  private enqueueForRunner(runnerId: string, task: RunnerOutboundMessage): void {
    const waiters = this.waitingByRunner.get(runnerId);
    const waiter = waiters?.values().next().value as ((task: RunnerOutboundMessage | null) => void) | undefined;
    if (waiter) {
      waiters?.delete(waiter);
      if (waiters && waiters.size === 0) {
        this.waitingByRunner.delete(runnerId);
      }
      waiter(task);
      return;
    }

    const queue = this.pendingByRunner.get(runnerId) ?? [];
    queue.push(task);
    this.pendingByRunner.set(runnerId, queue);
  }

  private dequeueFromRunner(runnerId: string): RunnerOutboundMessage | null {
    const queue = this.pendingByRunner.get(runnerId);
    if (!queue || queue.length === 0) {
      return null;
    }
    const next = queue.shift() ?? null;
    if (queue.length === 0) {
      this.pendingByRunner.delete(runnerId);
    }
    return next;
  }
}

function resolveTaskWorkingDir(metadata: Record<string, unknown> | undefined): string {
  const candidates = [metadata?.cwd, metadata?.workingDir, metadata?.sessionCwd];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }
  return process.cwd();
}

function resolveEngine(metadata: Record<string, unknown> | undefined): PendingRunnerEngine {
  const value = metadata?.runnerEngine;
  if (value === 'docker') {
    return 'docker';
  }
  return 'host';
}

function deriveSandboxPolicy(command: string, workingDir: string): PendingSandboxPolicy {
  const semanticFsReadOnly = command === 'fs.read' || command === 'fs.list' || command === 'fs.search';
  const semanticFsWrite = command === 'fs.write' || command === 'fs.patch';
  const shellExec = command === 'shell.exec';
  const enabled = semanticFsReadOnly || semanticFsWrite || shellExec || !isKnownSafeCommand(command);

  return {
    enabled,
    readOnly: semanticFsReadOnly,
    allowNetwork: false,
    allowedWorkingDirs: [workingDir],
    allowedReadPaths: [workingDir],
    allowedWritePaths: semanticFsWrite ? [workingDir] : [],
    blockedCommandFragments: [' rm ', ' rmdir ', ' del ', ' format ', ' shutdown ', ' reboot '],
    allowedEnvKeys: [],
    deniedEnvKeys: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
  };
}

function classifyRiskLevel(command: string): 'low' | 'medium' | 'high' {
  if (command === 'fs.write' || command === 'fs.patch') {
    return 'high';
  }
  if (command === 'shell.exec') {
    return 'high';
  }
  if (command === 'fs.read' || command === 'fs.list' || command === 'fs.search') {
    return 'medium';
  }
  return 'high';
}

function isKnownSafeCommand(command: string): boolean {
  return command === 'fs.read' || command === 'fs.list' || command === 'fs.search';
}

function isRiskyApprovalGranted(metadata: Record<string, unknown> | undefined): boolean {
  return metadata?.approveRiskyOps === true;
}

function validateApprovalForTask(
  approvalService: RunnerApprovalService,
  task: RunnerTask,
  workingDir: string,
  riskLevel: 'low' | 'medium' | 'high',
): {
  ok: boolean;
  reason?: string;
  ticketId?: string;
} {
  if (riskLevel !== 'high') {
    return { ok: true };
  }

  const userId = typeof task.metadata?.userId === 'string' ? task.metadata.userId : '';
  if (!userId) {
    return { ok: false, reason: 'missing metadata.userId' };
  }

  const approvalTicket =
    typeof task.metadata?.approvalTicket === 'string' ? task.metadata.approvalTicket.trim() : '';
  if (approvalTicket) {
    const validation = approvalService.consumeAndValidate({
      ticket: approvalTicket,
      ownerUserId: userId,
      sessionId: task.sessionId,
      command: task.command,
      workingDir,
    });
    return validation;
  }

  if (isRiskyApprovalGranted(task.metadata)) {
    return { ok: true, reason: 'legacy approval boolean was accepted' };
  }

  return { ok: false, reason: 'missing approval ticket' };
}

function clampWaitMs(waitMs: number | undefined): number {
  if (typeof waitMs !== 'number' || !Number.isFinite(waitMs)) {
    return 15_000;
  }
  return Math.min(25_000, Math.max(1_000, Math.floor(waitMs)));
}

function normalizeRunnerEvent(input: RunnerInboundEvent, task: RunnerTask, runnerId: string): RunnerEvent {
  const timestamp = input.timestamp || new Date().toISOString();
  const normalizedRunnerId = input.runnerId || runnerId;

  switch (input.type) {
    case 'started':
      return {
        type: 'started',
        timestamp,
        runnerId: normalizedRunnerId,
        task: input.task ?? task,
      };
    case 'stdout':
      return {
        type: 'stdout',
        timestamp,
        runnerId: normalizedRunnerId,
        chunk: input.chunk,
      };
    case 'stderr':
      return {
        type: 'stderr',
        timestamp,
        runnerId: normalizedRunnerId,
        chunk: input.chunk,
      };
    case 'progress':
      return {
        type: 'progress',
        timestamp,
        runnerId: normalizedRunnerId,
        message: input.message,
        percent: input.percent,
      };
    case 'result':
      return {
        type: 'result',
        timestamp,
        runnerId: normalizedRunnerId,
        result: input.result,
      };
    case 'error':
      return {
        type: 'error',
        timestamp,
        runnerId: normalizedRunnerId,
        error: input.error,
        retryable: Boolean(input.retryable),
      };
    case 'completed':
      return {
        type: 'completed',
        timestamp,
        runnerId: normalizedRunnerId,
        exitCode: input.exitCode,
        durationMs: input.durationMs,
      };
  }
}
