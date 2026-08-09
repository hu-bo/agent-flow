import type { RunnerEvent, RunnerTask } from '@agent-flow/core';
import type { StructuredLogger } from '@agent-flow/events';
import type { AppDataSource } from '../db/data-source.js';
import { AppError } from '../lib/errors.js';
import { AsyncQueue } from '../lib/async-queue.js';
import { RunnerRegistryService } from './runner-registry-service.js';
import { RunnerApprovalService } from './runner-approval-service.js';
import { RunnerExecutionRepository } from './runner-execution-repository.js';
import {
  clampRunnerPollWait,
  classifyRiskLevel,
  deriveSandboxPolicy,
  readPersistedOutboundTask,
  readRequestId,
  resolveApprovalScope,
  resolveDockerSpec,
  resolveEngine,
  resolveExecutionAttempt,
  resolveExecutionId,
  resolveMaxOutputBytes,
  resolveTaskWorkingDir,
  validateApprovalForTask,
  validatePersistentApproval,
  type PendingRunnerTask,
} from './runner-task-policy.js';

export type { PendingRunnerTask } from './runner-task-policy.js';

type RunnerTerminalStatus = 'succeeded' | 'failed' | 'cancelled' | 'timed_out' | 'rejected';

interface RunnerExecution {
  runnerId: string;
  task: RunnerTask;
  queue: AsyncQueue<RunnerEvent>;
  timeoutHandle: NodeJS.Timeout;
  cancelRequested: boolean;
  failedReason?: string;
  executionId: string;
  attempt: number;
  lastEventSequence: number;
  terminal: boolean;
  dispatchAcked: boolean;
  outboundTask: PendingRunnerTask;
  dispatchLeaseHandle?: NodeJS.Timeout;
}

interface RunnerWaiter {
  connectionId?: string;
  resolve(task: RunnerOutboundMessage | null): void;
  timer?: NodeJS.Timeout;
}

export interface RunnerDispatchPollInput {
  runnerId: string;
  runnerToken: string;
  waitMs?: number;
  connectionId?: string;
}

export interface RunnerTaskEventInput {
  runnerId: string;
  runnerToken: string;
  taskId: string;
  event: RunnerInboundEvent;
}

export interface RunnerDispatchAckInput {
  runnerId: string;
  runnerToken: string;
  taskId: string;
  executionId: string;
  attempt: number;
  accepted: boolean;
  state?: string;
  message?: string;
  lastEventSequence?: number;
}

export interface RunnerSessionBindingStore {
  getBoundRunner(sessionId: string, ownerUserId: string): Promise<string | undefined>;
  bindRunnerIfUnset(sessionId: string, runnerId: string, ownerUserId: string): Promise<string>;
}

export type RunnerOutboundMessage =
  | {
      type: 'run_task';
      task: PendingRunnerTask;
    }
  | {
      type: 'cancel_task';
      taskId: string;
      executionId: string;
      attempt: number;
      reason: string;
    };

type RunnerInboundEvent =
  | {
      type: 'started';
      executionId?: string;
      attempt?: number;
      sequence?: number;
      timestamp?: string;
      runnerId?: string;
      task?: RunnerTask;
    }
  | {
      type: 'stdout';
      executionId?: string;
      attempt?: number;
      sequence?: number;
      timestamp?: string;
      runnerId?: string;
      chunk: string;
      chunkSequence?: number;
      byteOffset?: number;
      truncated?: boolean;
    }
  | {
      type: 'stderr';
      executionId?: string;
      attempt?: number;
      sequence?: number;
      timestamp?: string;
      runnerId?: string;
      chunk: string;
      chunkSequence?: number;
      byteOffset?: number;
      truncated?: boolean;
    }
  | {
      type: 'progress';
      executionId?: string;
      attempt?: number;
      sequence?: number;
      timestamp?: string;
      runnerId?: string;
      message: string;
      percent?: number;
    }
  | {
      type: 'result';
      executionId?: string;
      attempt?: number;
      sequence?: number;
      timestamp?: string;
      runnerId?: string;
      result: unknown;
      stdoutBytes?: number;
      stderrBytes?: number;
      outputTruncated?: boolean;
    }
  | {
      type: 'error';
      executionId?: string;
      attempt?: number;
      sequence?: number;
      timestamp?: string;
      runnerId?: string;
      error: string;
      retryable?: boolean;
      failureType?: string;
      code?: string;
    }
  | {
      type: 'completed';
      executionId?: string;
      attempt?: number;
      sequence?: number;
      timestamp?: string;
      runnerId?: string;
      exitCode: number;
      durationMs: number;
      status: RunnerTerminalStatus;
      failureType?: string;
      message?: string;
      stdoutBytes?: number;
      stderrBytes?: number;
      outputTruncated?: boolean;
    };

export class RunnerDispatchService {
  private readonly pendingByRunner = new Map<string, RunnerOutboundMessage[]>();
  private readonly waitingByRunner = new Map<string, Set<RunnerWaiter>>();
  private readonly activeConnectionByRunner = new Map<string, string>();
  private readonly executions = new Map<string, RunnerExecution>();
  private readonly recoveredDeadlineTimers = new Map<string, NodeJS.Timeout>();
  private readonly executionRepository: RunnerExecutionRepository;

  constructor(
    private readonly runnerRegistryService: RunnerRegistryService,
    private readonly runnerApprovalService: RunnerApprovalService,
    db: AppDataSource,
    private readonly logger?: StructuredLogger,
    private readonly sessionBindingStore?: RunnerSessionBindingStore,
  ) {
    this.executionRepository = new RunnerExecutionRepository(db);
  }

  async initialize(): Promise<void> {
    const recoverable = await this.executionRepository.findRecoverable();
    for (const record of recoverable) {
      if (record.deadline.getTime() <= Date.now()) {
        await this.markDurableTimedOut(record.executionId, record.attempt);
        continue;
      }
      this.scheduleRecoveredDeadline(record.executionId, record.attempt, record.deadline);
      if (record.state !== 'accepted' || record.dispatchAcked) continue;
      const outboundTask = readPersistedOutboundTask(record.taskPayload);
      if (!outboundTask) {
        await this.executionRepository.markInvalidPayload(record);
        continue;
      }
      outboundTask.resumeFromEventSequence = Number(record.lastEventSequence);
      this.enqueueForRunner(record.runnerId, { type: 'run_task', task: outboundTask });
    }
  }

  activateRunnerConnection(input: { runnerId: string; connectionId: string }): string | undefined {
    const previousConnectionId = this.activeConnectionByRunner.get(input.runnerId);
    this.activeConnectionByRunner.set(input.runnerId, input.connectionId);
    this.rejectStaleWaiters(input.runnerId, input.connectionId);
    return previousConnectionId === input.connectionId ? undefined : previousConnectionId;
  }

  deactivateRunnerConnection(input: { runnerId: string; connectionId: string }): void {
    if (this.activeConnectionByRunner.get(input.runnerId) === input.connectionId) {
      this.activeConnectionByRunner.delete(input.runnerId);
    }
    this.rejectWaiters(input.runnerId, (waiter) => waiter.connectionId === input.connectionId);
  }

  canDispatchSync(task: RunnerTask): boolean {
    return typeof task.metadata?.userId === 'string' && task.metadata.userId.trim().length > 0;
  }

  async *execute(task: RunnerTask, signal?: AbortSignal): AsyncIterable<RunnerEvent> {
    const userId = task.metadata?.userId;
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      throw new AppError(400, 'RUNNER_USER_REQUIRED', 'runner task is missing metadata.userId');
    }

    const preferredRunnerId = await this.resolvePreferredRunnerId(task, userId);
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
    await this.bindSelectedRunnerIfNeeded(task, userId, runner.runnerId, preferredRunnerId);

    let execution: RunnerExecution | undefined;
    let abortListener: (() => void) | undefined;

    try {
      const workingDir = resolveTaskWorkingDir(task.metadata);
      const sandboxPolicy = deriveSandboxPolicy(task.command, workingDir, task.input);
      const engine = resolveEngine(task.metadata);
      const riskLevel = classifyRiskLevel(task.command, task.input);
      const requestId = readRequestId(task.metadata);
      this.logger?.info('runner.dispatch.selected', 'runner selected for task dispatch', {
        attributes: {
          taskId: task.taskId,
          sessionId: task.sessionId,
          stepId: task.stepId,
          requestId,
          runnerId: runner.runnerId,
          userId,
          command: task.command,
          workingDir,
          riskLevel,
        },
      });
      const approvalScope = resolveApprovalScope(task.metadata, task.sessionId);
      let approval = await validateApprovalForTask(
        this.runnerApprovalService,
        task,
        runner.runnerId,
        approvalScope,
        riskLevel,
      );
      let waitedForApproval = false;
      if (riskLevel === 'high' && !approval.ok) {
        waitedForApproval = true;
        const approvalStartedAtMs = Date.now();
        const pending = this.runnerApprovalService.waitForApproval({
          ownerUserId: userId,
          sessionId: task.sessionId,
          runnerId: runner.runnerId,
          scope: approvalScope,
          command: task.command,
          workingDir,
          risk: riskLevel,
          reason: approval.reason ?? 'approval is missing',
          signal,
        });
        this.logger?.info('runner.approval.requested', 'runner task is waiting for approval', {
          attributes: {
            taskId: task.taskId,
            sessionId: task.sessionId,
            stepId: task.stepId,
            requestId,
            runnerId: runner.runnerId,
            userId,
            approvalRequestId: pending.request.requestId,
            command: task.command,
            workingDir,
            riskLevel,
            reason: pending.request.reason,
            timeoutMs: APPROVAL_WAIT_TIMEOUT_MS,
          },
        });
        yield {
          type: 'approval_request',
          timestamp: new Date().toISOString(),
          runnerId: runner.runnerId,
          requestId: pending.request.requestId,
          sessionId: pending.request.sessionId,
          scopeType: pending.request.scopeType,
          scopeId: pending.request.scopeId,
          scopeLabel: pending.request.scopeLabel,
          command: pending.request.command,
          workingDir: pending.request.workingDir,
          risk: pending.request.risk,
          reason: pending.request.reason,
        };

        const response = await pending.response;
        this.logger?.info('runner.approval.resolved', 'runner task approval completed', {
          attributes: {
            taskId: task.taskId,
            sessionId: task.sessionId,
            stepId: task.stepId,
            requestId,
            runnerId: runner.runnerId,
            userId,
            approvalRequestId: response.requestId,
            approved: response.approved,
            decision: response.decision,
            persistentGrantId: response.persistentGrantId,
            reason: response.reason,
            waitDurationMs: Date.now() - approvalStartedAtMs,
          },
        });
        yield {
          type: 'approval_response',
          timestamp: new Date().toISOString(),
          runnerId: runner.runnerId,
          requestId: response.requestId,
          sessionId: task.sessionId,
          command: task.command,
          workingDir,
          approved: response.approved,
          decision: response.decision,
          persistentGrantId: response.persistentGrantId,
          reason: response.reason,
        };

        if (!response.approved) {
          throw new AppError(
            403,
            'APPROVAL_DENIED',
            response.reason ?? `Approval denied before running high-risk command "${task.command}".`,
          );
        }

        approval = response.decision === 'always'
          ? await validatePersistentApproval(
              this.runnerApprovalService,
              userId,
              runner.runnerId,
              approvalScope,
            )
          : { ok: true, decision: 'once' };
        if (!approval.ok) {
          throw new AppError(
            403,
            'APPROVAL_INVALID',
            approval.reason ?? `Approval was not valid for high-risk command "${task.command}".`,
          );
        }
      }

      if (riskLevel === 'high' && approval.ok && approval.decision === 'always' && !waitedForApproval) {
        yield {
          type: 'approval_response',
          timestamp: new Date().toISOString(),
          runnerId: runner.runnerId,
          requestId: `grant:${approval.persistentGrantId ?? 'persistent'}`,
          sessionId: task.sessionId,
          command: task.command,
          workingDir,
          approved: true,
          decision: 'always',
          persistentGrantId: approval.persistentGrantId,
          reason: 'remembered approval grant matched',
        };
      }

      const timeoutMs = Math.max(1_000, task.timeoutMs ?? 30_000);
      const executionId = resolveExecutionId(task.metadata, task.taskId);
      const attempt = resolveExecutionAttempt(task.metadata);
      const outboundTask: PendingRunnerTask = {
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
        docker: resolveDockerSpec(task.metadata, engine),
        executionId,
        attempt,
        deadline: new Date(Date.now() + timeoutMs).toISOString(),
        maxOutputBytes: resolveMaxOutputBytes(task.metadata),
        resumeFromEventSequence: 0,
      };
      execution = this.createExecution(task.taskId, runner.runnerId, task.timeoutMs, task, outboundTask);
      await this.persistExecution(execution);
      abortListener = () => {
        this.requestCancellation(task.taskId, 'Runner task aborted by signal');
        this.failExecution(task.taskId, 'Runner task aborted by signal', 'RUNNER_CANCELLED', 'cancelled', 'cancelled');
      };
      signal?.addEventListener('abort', abortListener, { once: true });

      this.enqueueForRunner(runner.runnerId, {
        type: 'run_task',
        task: outboundTask,
      });
      this.logger?.info('runner.dispatch.enqueued', 'runner task enqueued', {
        attributes: {
          taskId: task.taskId,
          sessionId: task.sessionId,
          stepId: task.stepId,
          requestId,
          runnerId: runner.runnerId,
          userId,
          command: task.command,
          engine,
          workingDir,
          riskLevel,
          sandboxEnabled: sandboxPolicy.enabled,
          sandboxReadOnly: sandboxPolicy.readOnly,
          sandboxAllowNetwork: sandboxPolicy.allowNetwork,
          approvalPersistentGrantId: approval.persistentGrantId,
          approvalDecision: approval.decision,
        },
      });

      for await (const event of execution.queue) {
        yield event;
      }
    } finally {
      if (abortListener) {
        signal?.removeEventListener('abort', abortListener);
      }
      const latest = this.executions.get(task.taskId);
      if (latest?.failedReason) {
        const failedReason = latest.failedReason;
        this.cleanupExecution(task.taskId);
        throw new Error(failedReason);
      }
      if (execution) {
        this.cleanupExecution(task.taskId);
      }
    }
  }

  async nextOutboundMessage(input: RunnerDispatchPollInput): Promise<RunnerOutboundMessage | null> {
    const waitMs = clampRunnerPollWait(input.waitMs);
    await this.runnerRegistryService.authorizeRunnerConnection(input.runnerId, input.runnerToken);
    if (input.connectionId && !this.isCurrentRunnerConnection(input.runnerId, input.connectionId)) {
      return null;
    }
    const immediate = this.dequeueFromRunner(input.runnerId);
    if (immediate) {
      return immediate;
    }

    return new Promise<RunnerOutboundMessage | null>((resolve) => {
      const waiter: RunnerWaiter = {
        connectionId: input.connectionId,
        resolve: (task: RunnerOutboundMessage | null) => {
          if (waiter.timer) {
            clearTimeout(waiter.timer);
          }
          const waiters = this.waitingByRunner.get(input.runnerId);
          if (waiters) {
            waiters.delete(waiter);
            if (waiters.size === 0) {
              this.waitingByRunner.delete(input.runnerId);
            }
          }
          resolve(task);
        },
      };
      waiter.timer = setTimeout(() => waiter.resolve(null), waitMs);
      waiter.timer.unref?.();

      if (input.connectionId && !this.isCurrentRunnerConnection(input.runnerId, input.connectionId)) {
        waiter.resolve(null);
        return;
      }

      const waiters = this.waitingByRunner.get(input.runnerId) ?? new Set<RunnerWaiter>();
      waiters.add(waiter);
      this.waitingByRunner.set(input.runnerId, waiters);
    });
  }

  private isCurrentRunnerConnection(runnerId: string, connectionId: string): boolean {
    return this.activeConnectionByRunner.get(runnerId) === connectionId;
  }

  private rejectStaleWaiters(runnerId: string, currentConnectionId: string): void {
    this.rejectWaiters(
      runnerId,
      (waiter) => waiter.connectionId !== undefined && waiter.connectionId !== currentConnectionId,
    );
  }

  private rejectWaiters(runnerId: string, predicate: (waiter: RunnerWaiter) => boolean): void {
    const waiters = this.waitingByRunner.get(runnerId);
    if (!waiters) {
      return;
    }
    for (const waiter of [...waiters]) {
      if (predicate(waiter)) {
        waiter.resolve(null);
      }
    }
  }

  private takeRunnableWaiter(runnerId: string): RunnerWaiter | undefined {
    const waiters = this.waitingByRunner.get(runnerId);
    if (!waiters) {
      return undefined;
    }
    const activeConnectionId = this.activeConnectionByRunner.get(runnerId);
    for (const waiter of waiters) {
      if (!waiter.connectionId || !activeConnectionId || waiter.connectionId === activeConnectionId) {
        waiters.delete(waiter);
        if (waiters.size === 0) {
          this.waitingByRunner.delete(runnerId);
        }
        return waiter;
      }
    }
    return undefined;
  }

  async acceptDispatchAck(input: RunnerDispatchAckInput): Promise<void> {
    await this.runnerRegistryService.authorizeRunnerConnection(input.runnerId, input.runnerToken);
    const execution = this.executions.get(input.taskId);
    if (execution && execution.runnerId !== input.runnerId) return;
    if (execution && (execution.executionId !== input.executionId || execution.attempt !== input.attempt)) return;
    const acknowledged = await this.executionRepository.acknowledgeDispatch(input);
    if (!acknowledged) return;
    if (!execution) return;
    if (execution.dispatchLeaseHandle) {
      clearTimeout(execution.dispatchLeaseHandle);
      execution.dispatchLeaseHandle = undefined;
    }
    execution.dispatchAcked = input.accepted;
    if (!input.accepted) {
      this.failExecution(
        input.taskId,
        input.message || 'Runner rejected the execution dispatch',
        input.message?.includes('concurrency exhausted') ? 'RESOURCE_EXHAUSTED' : 'RUNNER_REJECTED',
        'rejected',
        input.message?.includes('concurrency exhausted') ? 'resource_exhausted' : 'validation',
      );
      return;
    }
    execution.outboundTask.resumeFromEventSequence = execution.lastEventSequence;
  }

  async acceptCancelAck(input: {
    runnerId: string; runnerToken: string; taskId: string; executionId: string; attempt: number; accepted: boolean; message?: string;
  }): Promise<void> {
    await this.runnerRegistryService.authorizeRunnerConnection(input.runnerId, input.runnerToken);
    await this.executionRepository.acknowledgeCancellation(input);
    const execution = this.executions.get(input.taskId);
    if (!execution || execution.runnerId !== input.runnerId) return;
    if (execution.executionId !== input.executionId || execution.attempt !== input.attempt) return;
    this.logger?.info('runner.dispatch.cancel.acknowledged', 'runner cancellation acknowledged', {
      attributes: { taskId: input.taskId, executionId: input.executionId, attempt: input.attempt, accepted: input.accepted, message: input.message },
    });
  }

  async acceptTaskEvent(input: RunnerTaskEventInput): Promise<number> {
    await this.runnerRegistryService.authorizeRunnerConnection(input.runnerId, input.runnerToken);
    const execution = this.executions.get(input.taskId);
    const executionId = input.event.executionId ?? execution?.executionId ?? input.taskId;
    const attempt = input.event.attempt ?? execution?.attempt ?? 1;
    const acknowledgedSequence = await this.executionRepository.persistInboundEvent({
      ...input,
      executionId,
      attempt,
    });
    if (input.event.type === 'completed') {
      this.clearRecoveredDeadline(executionId, attempt);
    }
    if (!execution) return acknowledgedSequence;
    if (execution.runnerId !== input.runnerId) return execution.lastEventSequence;
    if (executionId !== execution.executionId || attempt !== execution.attempt) return execution.lastEventSequence;
    const sequence = input.event.sequence ?? execution.lastEventSequence + 1;
    if (sequence <= execution.lastEventSequence) return acknowledgedSequence;
    if (sequence !== execution.lastEventSequence + 1) return acknowledgedSequence;
    execution.lastEventSequence = sequence;

    const normalized = normalizeRunnerEvent(input.event, execution.task, input.runnerId);
    execution.queue.push(normalized);
    if (normalized.type === 'completed') {
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
          status: normalized.status,
          failureType: normalized.failureType,
          riskLevel: classifyRiskLevel(execution.task.command, execution.task.input),
        },
      });
    }

    if (normalized.type === 'completed') {
      execution.terminal = true;
      this.clearRecoveredDeadline(execution.executionId, execution.attempt);
      if (normalized.status && normalized.status !== 'succeeded') {
        execution.failedReason = normalized.message || `Runner execution ${normalized.status}`;
      }
      execution.queue.close();
    }
    return execution.lastEventSequence;
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
    void this.executionRepository.requestCancellation({
      executionId: execution.executionId,
      attempt: execution.attempt,
    });
    this.enqueueForRunner(execution.runnerId, {
      type: 'cancel_task',
      taskId,
      executionId: execution.executionId,
      attempt: execution.attempt,
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

  private createExecution(
    taskId: string, runnerId: string, timeoutMs: number | undefined, task: RunnerTask, outboundTask: PendingRunnerTask,
  ): RunnerExecution {
    const existing = this.executions.get(taskId);
    if (existing) {
      throw new AppError(409, 'RUNNER_TASK_CONFLICT', `Runner task already exists: ${taskId}`);
    }

    const queue = new AsyncQueue<RunnerEvent>();
    const timeout = Math.max(1_000, (timeoutMs ?? 30_000) + 5_000);
    const timeoutHandle = setTimeout(() => {
      this.requestCancellation(taskId, `Runner task timed out after ${timeout}ms`);
      this.failExecution(taskId, `Runner task timeout after ${timeout}ms`, 'RUNNER_TIMEOUT', 'timed_out', 'timeout');
    }, timeout);
    timeoutHandle.unref?.();

    const execution: RunnerExecution = {
      runnerId,
      task,
      queue,
      timeoutHandle,
      cancelRequested: false,
      executionId: outboundTask.executionId,
      attempt: outboundTask.attempt,
      lastEventSequence: 0,
      terminal: false,
      dispatchAcked: false,
      outboundTask,
    };
    this.executions.set(taskId, execution);
    return execution;
  }

  private failExecution(
    taskId: string,
    reason: string,
    code = 'RUNNER_EXECUTION_FAILED',
    terminalStatus: RunnerTerminalStatus = 'failed',
    failureType = 'internal',
  ): void {
    const execution = this.executions.get(taskId);
    if (!execution) return;
    execution.queue.push({
      type: 'error',
      timestamp: new Date().toISOString(),
      runnerId: execution.runnerId,
      error: reason,
      retryable: false,
      code,
    });
    execution.failedReason = reason;
    execution.terminal = true;
    execution.queue.close();
    void this.persistSyntheticTerminal(execution, terminalStatus, failureType, reason);
  }

  private cleanupExecution(taskId: string): void {
    const execution = this.executions.get(taskId);
    if (!execution) return;
    clearTimeout(execution.timeoutHandle);
    if (execution.dispatchLeaseHandle) clearTimeout(execution.dispatchLeaseHandle);
    execution.queue.close();
    this.executions.delete(taskId);
  }

  private enqueueForRunner(runnerId: string, task: RunnerOutboundMessage): void {
    const waiter = this.takeRunnableWaiter(runnerId);
    if (waiter) {
      this.markDispatched(task);
      waiter.resolve(task);
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
    if (next) this.markDispatched(next);
    return next;
  }

  private markDispatched(outbound: RunnerOutboundMessage): void {
    if (outbound.type !== 'run_task') return;
    const execution = this.executions.get(outbound.task.taskId);
    if (!execution) {
      const timer = setTimeout(() => {
        void this.redispatchDurableExecution(outbound.task);
      }, DISPATCH_ACK_TIMEOUT_MS);
      timer.unref?.();
      return;
    }
    if (execution.terminal || execution.dispatchAcked) return;
    if (execution.dispatchLeaseHandle) clearTimeout(execution.dispatchLeaseHandle);
    execution.dispatchLeaseHandle = setTimeout(() => {
      const latest = this.executions.get(outbound.task.taskId);
      if (!latest || latest.terminal || latest.dispatchAcked) return;
      latest.outboundTask.resumeFromEventSequence = latest.lastEventSequence;
      this.enqueueForRunner(latest.runnerId, { type: 'run_task', task: latest.outboundTask });
    }, DISPATCH_ACK_TIMEOUT_MS);
    execution.dispatchLeaseHandle.unref?.();
  }

  private async redispatchDurableExecution(task: PendingRunnerTask): Promise<void> {
    const record = await this.executionRepository.find({
      executionId: task.executionId,
      attempt: task.attempt,
    });
    if (!record || record.state === 'terminal' || record.dispatchAcked || record.deadline.getTime() <= Date.now()) return;
    task.resumeFromEventSequence = Number(record.lastEventSequence);
    this.enqueueForRunner(record.runnerId, { type: 'run_task', task });
  }

  private async persistExecution(execution: RunnerExecution): Promise<void> {
    await this.executionRepository.createAccepted({
      executionId: execution.executionId,
      attempt: execution.attempt,
      taskId: execution.task.taskId,
      runnerId: execution.runnerId,
      taskPayload: { task: execution.task, outboundTask: execution.outboundTask },
      deadline: new Date(execution.outboundTask.deadline),
    });
  }

  private scheduleRecoveredDeadline(executionId: string, attempt: number, deadline: Date): void {
    const key = executionKey(executionId, attempt);
    this.clearRecoveredDeadline(executionId, attempt);
    const armTimer = (): void => {
      const remainingMs = deadline.getTime() - Date.now();
      if (remainingMs <= 0) {
        this.recoveredDeadlineTimers.delete(key);
        void this.markDurableTimedOut(executionId, attempt);
        return;
      }
      const timer = setTimeout(() => {
        this.recoveredDeadlineTimers.delete(key);
        armTimer();
      }, Math.min(remainingMs, MAX_TIMER_DELAY_MS));
      timer.unref?.();
      this.recoveredDeadlineTimers.set(key, timer);
    };
    armTimer();
  }

  private clearRecoveredDeadline(executionId: string, attempt: number): void {
    const key = executionKey(executionId, attempt);
    const timer = this.recoveredDeadlineTimers.get(key);
    if (timer) clearTimeout(timer);
    this.recoveredDeadlineTimers.delete(key);
  }

  private async markDurableTimedOut(executionId: string, attempt: number): Promise<void> {
    await this.executionRepository.markTimedOut({ executionId, attempt });
  }

  private async persistSyntheticTerminal(
    execution: RunnerExecution,
    terminalStatus: RunnerTerminalStatus,
    failureType: string,
    message: string,
  ): Promise<void> {
    await this.executionRepository.markTerminal(
      { executionId: execution.executionId, attempt: execution.attempt },
      terminalStatus,
      failureType,
      message,
    );
  }

  private async resolvePreferredRunnerId(task: RunnerTask, userId: string): Promise<string | undefined> {
    const explicitRunnerId = normalizeMetadataString(task.metadata?.preferredRunnerId);
    if (explicitRunnerId) {
      return explicitRunnerId;
    }

    const sessionId = normalizeMetadataString(task.metadata?.sessionId) ?? normalizeMetadataString(task.sessionId);
    if (!sessionId || !this.sessionBindingStore) {
      return undefined;
    }

    try {
      return await this.sessionBindingStore.getBoundRunner(sessionId, userId);
    } catch (error) {
      this.logger?.warn('runner.dispatch.binding.lookup_failed', 'failed to resolve session runner binding', {
        attributes: {
          sessionId,
          userId,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      return undefined;
    }
  }

  private async bindSelectedRunnerIfNeeded(
    task: RunnerTask,
    userId: string,
    runnerId: string,
    preferredRunnerId: string | undefined,
  ): Promise<void> {
    if (preferredRunnerId || !this.sessionBindingStore) {
      return;
    }

    const sessionId = normalizeMetadataString(task.metadata?.sessionId) ?? normalizeMetadataString(task.sessionId);
    if (!sessionId) {
      return;
    }

    try {
      const boundRunnerId = await this.sessionBindingStore.bindRunnerIfUnset(sessionId, runnerId, userId);
      if (boundRunnerId === runnerId) {
        this.logger?.info('runner.dispatch.binding.locked', 'runner locked to chat session', {
          attributes: {
            sessionId,
            userId,
            runnerId,
          },
        });
      }
    } catch (error) {
      this.logger?.warn('runner.dispatch.binding.lock_failed', 'failed to lock runner to chat session', {
        attributes: {
          sessionId,
          userId,
          runnerId,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }
}

const APPROVAL_WAIT_TIMEOUT_MS = 5 * 60 * 1000;
const DISPATCH_ACK_TIMEOUT_MS = 5_000;
const MAX_TIMER_DELAY_MS = 2_147_483_647;

function executionKey(executionId: string, attempt: number): string {
  return `${executionId}:${attempt}`;
}

function normalizeMetadataString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function normalizeRunnerEvent(input: RunnerInboundEvent, task: RunnerTask, runnerId: string): RunnerEvent {
  const timestamp = input.timestamp || new Date().toISOString();
  const normalizedRunnerId = input.runnerId || runnerId;
  const identity = { executionId: input.executionId, attempt: input.attempt, sequence: input.sequence };

  switch (input.type) {
    case 'started':
      return {
        type: 'started',
        timestamp,
        runnerId: normalizedRunnerId,
        ...identity,
        task: input.task ?? task,
      };
    case 'stdout':
      return {
        type: 'stdout',
        timestamp,
        runnerId: normalizedRunnerId,
        ...identity,
        chunk: input.chunk,
        chunkSequence: input.chunkSequence,
        byteOffset: input.byteOffset,
        truncated: input.truncated,
      };
    case 'stderr':
      return {
        type: 'stderr',
        timestamp,
        runnerId: normalizedRunnerId,
        ...identity,
        chunk: input.chunk,
        chunkSequence: input.chunkSequence,
        byteOffset: input.byteOffset,
        truncated: input.truncated,
      };
    case 'progress':
      return {
        type: 'progress',
        timestamp,
        runnerId: normalizedRunnerId,
        ...identity,
        message: input.message,
        percent: input.percent,
      };
    case 'result':
      return {
        type: 'result',
        timestamp,
        runnerId: normalizedRunnerId,
        ...identity,
        result: input.result,
        stdoutBytes: input.stdoutBytes,
        stderrBytes: input.stderrBytes,
        outputTruncated: input.outputTruncated,
      };
    case 'error':
      return {
        type: 'error',
        timestamp,
        runnerId: normalizedRunnerId,
        ...identity,
        error: input.error,
        retryable: Boolean(input.retryable),
        failureType: input.failureType,
        code: input.code,
      };
    case 'completed':
      return {
        type: 'completed',
        timestamp,
        runnerId: normalizedRunnerId,
        ...identity,
        exitCode: input.exitCode,
        durationMs: input.durationMs,
        status: input.status,
        failureType: input.failureType,
        message: input.message,
        stdoutBytes: input.stdoutBytes,
        stderrBytes: input.stderrBytes,
        outputTruncated: input.outputTruncated,
      };
  }
}
