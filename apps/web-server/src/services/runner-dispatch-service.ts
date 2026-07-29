import type { RunnerEvent, RunnerTask } from '@agent-flow/core';
import type { StructuredLogger } from '@agent-flow/events';
import { randomUUID } from 'node:crypto';
import type { Repository } from 'typeorm';
import type { AppDataSource } from '../db/data-source.js';
import { RunnerExecutionEntity } from '../db/entities/runner-execution.entity.js';
import { RunnerExecutionEventEntity } from '../db/entities/runner-execution-event.entity.js';
import { AppError } from '../lib/errors.js';
import { AsyncQueue } from '../lib/async-queue.js';
import { RunnerRegistryService } from './runner-registry-service.js';
import { RunnerApprovalService, type RunnerApprovalScope } from './runner-approval-service.js';

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
type RunnerTerminalStatus = 'succeeded' | 'failed' | 'cancelled' | 'timed_out' | 'rejected';

interface PendingDockerSpec {
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
  private readonly waitingByRunner = new Map<string, Set<(task: RunnerOutboundMessage | null) => void>>();
  private readonly executions = new Map<string, RunnerExecution>();
  private readonly executionRepository: Repository<RunnerExecutionEntity>;
  private readonly eventRepository: Repository<RunnerExecutionEventEntity>;

  constructor(
    private readonly runnerRegistryService: RunnerRegistryService,
    private readonly runnerApprovalService: RunnerApprovalService,
    private readonly db: AppDataSource,
    private readonly logger?: StructuredLogger,
  ) {
    this.executionRepository = db.getRepository(RunnerExecutionEntity);
    this.eventRepository = db.getRepository(RunnerExecutionEventEntity);
  }

  async initialize(): Promise<void> {
    const recoverable = await this.executionRepository.find({
      where: [{ state: 'accepted' }, { state: 'running' }],
      order: { createdAt: 'ASC' },
    });
    for (const record of recoverable) {
      if (record.deadline.getTime() <= Date.now()) {
        record.state = 'terminal';
        record.terminalStatus = 'timed_out';
        record.failureType = 'timeout';
        record.failureMessage = 'web-server recovered an execution after its deadline';
        await this.executionRepository.save(record);
        continue;
      }
      if (record.state !== 'accepted' || record.dispatchAcked) continue;
      const outboundTask = readPersistedOutboundTask(record.taskPayload);
      if (!outboundTask) {
        record.state = 'terminal';
        record.terminalStatus = 'failed';
        record.failureType = 'internal';
        record.failureMessage = 'persisted execution does not contain a valid outbound task';
        await this.executionRepository.save(record);
        continue;
      }
      outboundTask.resumeFromEventSequence = Number(record.lastEventSequence);
      this.enqueueForRunner(record.runnerId, { type: 'run_task', task: outboundTask });
    }
  }

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
        workingDir,
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
          sessionId: pending.request.session_id,
          scopeType: pending.request.scope_type,
          scopeId: pending.request.scope_id,
          scopeLabel: pending.request.scope_label,
          command: pending.request.cmd,
          workingDir: pending.request.workdir,
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
            ticketId: response.ticketId,
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
          ticketId: response.ticketId,
          authorizationSource: response.authorizationSource,
          grantId: response.grantId,
          reason: response.reason,
        };

        if (!response.approved) {
          throw new AppError(
            403,
            'APPROVAL_DENIED',
            response.reason ?? `Approval denied before running high-risk command "${task.command}".`,
          );
        }

        approval = response.authorizationSource === 'persistent'
          ? await validatePersistentApproval(
              this.runnerApprovalService,
              userId,
              runner.runnerId,
              approvalScope,
            )
          : response.ticket
            ? this.runnerApprovalService.consumeAndValidate({
                ticket: response.ticket,
                ownerUserId: userId,
                sessionId: task.sessionId,
                command: task.command,
                workingDir,
              })
            : { ok: false, reason: 'approved request did not include a valid authorization' };
        if (!approval.ok) {
          throw new AppError(
            403,
            'APPROVAL_INVALID',
            approval.reason ?? `Approval ticket was not valid for high-risk command "${task.command}".`,
          );
        }
      }

      if (riskLevel === 'high' && approval.ok && approval.source === 'persistent' && !waitedForApproval) {
        yield {
          type: 'approval_response',
          timestamp: new Date().toISOString(),
          runnerId: runner.runnerId,
          requestId: `grant:${approval.grantId ?? 'persistent'}`,
          sessionId: task.sessionId,
          command: task.command,
          workingDir,
          approved: true,
          authorizationSource: 'persistent',
          grantId: approval.grantId,
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
        this.failExecution(task.taskId, 'Runner task aborted by signal');
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
          approvalTicketId: approval.ticketId,
          approvalGrantId: approval.grantId,
          approvalSource: approval.source,
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

  async acceptDispatchAck(input: RunnerDispatchAckInput): Promise<void> {
    await this.runnerRegistryService.authorizeRunnerConnection(input.runnerId, input.runnerToken);
    const execution = this.executions.get(input.taskId);
    if (execution && execution.runnerId !== input.runnerId) return;
    if (execution && (execution.executionId !== input.executionId || execution.attempt !== input.attempt)) return;
    const durable = await this.executionRepository.findOne({
      where: { executionId: input.executionId, attempt: input.attempt },
    });
    if (!durable || durable.runnerId !== input.runnerId || durable.taskId !== input.taskId) return;
    durable.dispatchAcked = input.accepted;
    durable.state = input.accepted ? 'running' : 'terminal';
    if (!input.accepted) {
      durable.terminalStatus = 'rejected';
      durable.failureType = input.message?.includes('concurrency exhausted') ? 'resource_exhausted' : 'validation';
      durable.failureMessage = input.message || 'Runner rejected the execution dispatch';
    }
    await this.executionRepository.save(durable);
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
      );
      return;
    }
    execution.outboundTask.resumeFromEventSequence = execution.lastEventSequence;
  }

  async acceptCancelAck(input: {
    runnerId: string; runnerToken: string; taskId: string; executionId: string; attempt: number; accepted: boolean; message?: string;
  }): Promise<void> {
    await this.runnerRegistryService.authorizeRunnerConnection(input.runnerId, input.runnerToken);
    await this.executionRepository.update(
      { executionId: input.executionId, attempt: input.attempt, runnerId: input.runnerId },
      { cancelRequested: input.accepted },
    );
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
    const acknowledgedSequence = await this.persistInboundEvent({ ...input, executionId, attempt });
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
    void this.executionRepository.update(
      { executionId: execution.executionId, attempt: execution.attempt },
      { cancelRequested: true },
    );
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
      this.failExecution(taskId, `Runner task timeout after ${timeout}ms`);
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

  private failExecution(taskId: string, reason: string, code = 'RUNNER_EXECUTION_FAILED'): void {
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
    execution.queue.close();
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
    const waiters = this.waitingByRunner.get(runnerId);
    const waiter = waiters?.values().next().value as ((task: RunnerOutboundMessage | null) => void) | undefined;
    if (waiter) {
      waiters?.delete(waiter);
      if (waiters && waiters.size === 0) {
        this.waitingByRunner.delete(runnerId);
      }
      this.markDispatched(task);
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
    const record = await this.executionRepository.findOne({
      where: { executionId: task.executionId, attempt: task.attempt },
    });
    if (!record || record.state === 'terminal' || record.dispatchAcked || record.deadline.getTime() <= Date.now()) return;
    task.resumeFromEventSequence = Number(record.lastEventSequence);
    this.enqueueForRunner(record.runnerId, { type: 'run_task', task });
  }

  private async persistExecution(execution: RunnerExecution): Promise<void> {
    const record = this.executionRepository.create({
      executionId: execution.executionId,
      attempt: execution.attempt,
      taskId: execution.task.taskId,
      runnerId: execution.runnerId,
      state: 'accepted',
      terminalStatus: null,
      failureType: null,
      failureMessage: null,
      taskPayload: { task: execution.task, outboundTask: execution.outboundTask },
      dispatchAcked: false,
      cancelRequested: false,
      lastEventSequence: '0',
      deadline: new Date(execution.outboundTask.deadline),
    });
    try {
      await this.executionRepository.insert({ ...record, taskPayload: record.taskPayload as never });
    } catch (error) {
      throw new AppError(409, 'RUNNER_EXECUTION_CONFLICT', `Runner execution already exists: ${execution.executionId}/${execution.attempt}`, { cause: error });
    }
  }

  private async persistInboundEvent(input: RunnerTaskEventInput & { executionId: string; attempt: number }): Promise<number> {
    return this.db.transaction(async (manager) => {
      const executions = manager.getRepository(RunnerExecutionEntity);
      const events = manager.getRepository(RunnerExecutionEventEntity);
      const record = await executions.findOne({
        where: { executionId: input.executionId, attempt: input.attempt },
        lock: { mode: 'pessimistic_write' },
      });
      if (!record || record.runnerId !== input.runnerId || record.taskId !== input.taskId) return 0;
      const previous = Number(record.lastEventSequence);
      const sequence = input.event.sequence ?? previous + 1;
      if (sequence <= previous || sequence !== previous + 1) return previous;
      const persistedEvent = events.create({
        executionId: input.executionId,
        attempt: input.attempt,
        eventSequence: String(sequence),
        taskId: input.taskId,
        runnerId: input.runnerId,
        eventType: input.event.type,
        payload: input.event as unknown as Record<string, unknown>,
      });
      await events.insert({ ...persistedEvent, payload: persistedEvent.payload as never });
      record.lastEventSequence = String(sequence);
      if (input.event.type === 'completed') {
        record.state = 'terminal';
        record.terminalStatus = input.event.status;
        record.failureType = input.event.failureType ?? null;
        record.failureMessage = input.event.message ?? null;
      } else if (record.state === 'accepted') {
        record.state = 'running';
      }
      await executions.save(record);
      return sequence;
    });
  }
}

function readPersistedOutboundTask(payload: Record<string, unknown>): PendingRunnerTask | undefined {
  const raw = payload.outboundTask;
  if (!isRecord(raw) || !isRecord(raw.sandboxPolicy)) return undefined;
  if (typeof raw.taskId !== 'string' || typeof raw.sessionId !== 'string' || typeof raw.stepId !== 'string') return undefined;
  if (typeof raw.command !== 'string' || !Array.isArray(raw.args) || typeof raw.workingDir !== 'string') return undefined;
  if (raw.engine !== 'host' && raw.engine !== 'docker') return undefined;
  if (typeof raw.executionId !== 'string' || typeof raw.attempt !== 'number' || typeof raw.deadline !== 'string') return undefined;
  if (typeof raw.maxOutputBytes !== 'number' || typeof raw.resumeFromEventSequence !== 'number') return undefined;
  const sandbox = raw.sandboxPolicy;
  const stringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every((entry) => typeof entry === 'string');
  if (
    typeof sandbox.enabled !== 'boolean' || typeof sandbox.readOnly !== 'boolean' || typeof sandbox.allowNetwork !== 'boolean' ||
    !stringArray(sandbox.allowedWorkingDirs) || !stringArray(sandbox.allowedReadPaths) || !stringArray(sandbox.allowedWritePaths) ||
    !stringArray(sandbox.blockedCommandFragments) || !stringArray(sandbox.allowedEnvKeys) || !stringArray(sandbox.deniedEnvKeys)
  ) return undefined;
  return raw as unknown as PendingRunnerTask;
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

function resolveExecutionId(metadata: Record<string, unknown> | undefined, taskId: string): string {
  const configured = metadata?.executionId;
  if (typeof configured === 'string' && configured.trim()) return configured.trim();
  return `${taskId}:${randomUUID()}`;
}

function resolveExecutionAttempt(metadata: Record<string, unknown> | undefined): number {
  const configured = metadata?.executionAttempt;
  return typeof configured === 'number' && Number.isInteger(configured) && configured > 0
    ? configured
    : 1;
}

function resolveMaxOutputBytes(metadata: Record<string, unknown> | undefined): number {
  const configured = metadata?.maxOutputBytes;
  if (typeof configured !== 'number' || !Number.isFinite(configured)) return 4 * 1024 * 1024;
  return Math.min(64 * 1024 * 1024, Math.max(64 * 1024, Math.floor(configured)));
}

function resolveDockerSpec(
  metadata: Record<string, unknown> | undefined,
  engine: PendingRunnerEngine,
): PendingDockerSpec | undefined {
  if (engine !== 'docker') return undefined;
  const raw = metadata?.runnerDocker;
  if (!isRecord(raw) || typeof raw.image !== 'string' || !raw.image.trim()) {
    throw new AppError(400, 'RUNNER_DOCKER_IMAGE_REQUIRED', 'metadata.runnerDocker.image is required for Docker execution');
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

function readOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readOptionalPositiveInteger(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function deriveSandboxPolicy(
  command: string,
  workingDir: string,
  input: Record<string, unknown> | undefined,
): PendingSandboxPolicy {
  const semanticFsReadOnly =
    command === 'fs.read' || command === 'fs.stat' || command === 'fs.list' || command === 'fs.glob' || command === 'fs.search' || command === 'fs.roots' ||
    command === 'git.status' || command === 'git.diff' || command === 'git.show';
  const semanticFsWrite = command === 'fs.write' || command === 'fs.patch' || command === 'fs.multiPatch' || command === 'fs.applyPatch' || command === 'git.apply';
  const shellExec = command === 'shell.exec';
  const shellReadOnly = shellExec && isReadOnlyShellExec(input);
  const enabled = semanticFsReadOnly || semanticFsWrite || shellExec || !isKnownSafeCommand(command);
  const allowedReadPaths = semanticFsReadOnly
    ? uniqueStrings([workingDir, ...extractAbsoluteFsInputPaths(input)])
    : [workingDir];

  return {
    enabled,
    readOnly: semanticFsReadOnly || shellReadOnly,
    allowNetwork: false,
    allowedWorkingDirs: [workingDir],
    allowedReadPaths,
    allowedWritePaths: semanticFsWrite ? [workingDir] : [],
    blockedCommandFragments: [' rm ', ' rmdir ', ' del ', ' format ', ' shutdown ', ' reboot '],
    allowedEnvKeys: [],
    deniedEnvKeys: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
  };
}

function extractAbsoluteFsInputPaths(input: Record<string, unknown> | undefined): string[] {
  const candidate = input?.path;
  if (typeof candidate !== 'string') {
    return [];
  }
  const path = candidate.trim();
  if (!isAbsolutePathLike(path)) {
    return [];
  }
  return [path];
}

function isAbsolutePathLike(path: string): boolean {
  return /^[A-Za-z]:[\\/]/.test(path) || path.startsWith('/') || path.startsWith('\\\\');
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function classifyRiskLevel(command: string, input?: Record<string, unknown>): 'low' | 'medium' | 'high' {
  if (command === 'fs.read' || command === 'fs.stat' || command === 'fs.list' || command === 'fs.glob' || command === 'fs.search' || command === 'fs.roots') {
    return 'low';
  }
  if (command === 'git.status' || command === 'git.diff' || command === 'git.show') {
    return 'low';
  }
  if (command === 'fs.write' || command === 'fs.patch' || command === 'fs.multiPatch' || command === 'fs.applyPatch' || command === 'git.apply') {
    return 'high';
  }
  if (command === 'shell.exec') {
    return isReadOnlyShellExec(input) ? 'medium' : 'high';
  }
  return 'high';
}

function isKnownSafeCommand(command: string): boolean {
  return (
    command === 'fs.read' ||
    command === 'fs.stat' ||
    command === 'fs.list' ||
    command === 'fs.glob' ||
    command === 'fs.search' ||
    command === 'fs.roots' ||
    command === 'git.status' ||
    command === 'git.diff' ||
    command === 'git.show'
  );
}

function isReadOnlyShellExec(input: Record<string, unknown> | undefined): boolean {
  const command = readShellCommand(input);
  if (!command) {
    return false;
  }

  const executable = normalizeExecutable(command);
  const line = normalizeCommandLine(command, input);
  if (READ_ONLY_SHELL_COMMANDS.has(executable)) {
    return isReadOnlyShellScript(line);
  }

  if (!READ_ONLY_SHELL_WRAPPERS.has(executable)) {
    return false;
  }

  const script = extractShellWrapperScript(input);
  return script !== undefined && isReadOnlyShellScript(script);
}

function readShellCommand(input: Record<string, unknown> | undefined): string | undefined {
  const command = input?.command;
  if (typeof command === 'string' && command.trim().length > 0) {
    return command.trim();
  }

  const args = input?.args;
  const firstArg = Array.isArray(args) ? args[0] : undefined;
  return typeof firstArg === 'string' && firstArg.trim().length > 0 ? firstArg.trim() : undefined;
}

function normalizeExecutable(command: string): string {
  const trimmed = command.trim();
  const firstToken = trimmed.match(/^"([^"]+)"|^'([^']+)'|^(\S+)/)?.[1]
    ?? trimmed.match(/^"([^"]+)"|^'([^']+)'|^(\S+)/)?.[2]
    ?? trimmed.match(/^"([^"]+)"|^'([^']+)'|^(\S+)/)?.[3]
    ?? trimmed;
  return firstToken.replace(/\\/g, '/').split('/').pop()?.toLowerCase() ?? firstToken.toLowerCase();
}

function normalizeCommandLine(command: string, input: Record<string, unknown> | undefined): string {
  const args = Array.isArray(input?.args)
    ? input.args.map((value) => String(value))
    : [];
  return ` ${[command, ...args].join(' ').toLowerCase()} `;
}

const READ_ONLY_SHELL_COMMANDS = new Set([
  'basename',
  'cat',
  'cmd',
  'cut',
  'date',
  'dir',
  'dirname',
  'du',
  'echo',
  'env',
  'find',
  'findstr',
  'git',
  'grep',
  'head',
  'ls',
  'printf',
  'pwd',
  'readlink',
  'realpath',
  'rg',
  'sed',
  'tail',
  'type',
  'wc',
  'where',
  'which',
  'powershell',
  'powershell.exe',
  'pwsh',
  'pwsh.exe',
  'get-childitem',
  'get-content',
  'select-string',
  'resolve-path',
  'test-path',
]);

const READ_ONLY_SHELL_WRAPPERS = new Set(['bash', 'dash', 'sh', 'zsh']);
const SHELL_REDIRECT_PATTERN = /(?:^|\s)(?:\d?>|\d?>>|&>|<)/;
const SHELL_MUTATION_PATTERN =
  /\s(?:rm|rmdir|del|erase|move|mv|copy|cp|new-item|remove-item|set-content|add-content|out-file|rename-item|move-item|copy-item|mkdir|ni|sc|ac|write-output|tee|git\s+(?:add|commit|push|pull|checkout|switch|reset|merge|rebase|clean|apply)|npm\s+(?:install|i)|pnpm\s+(?:install|i)|yarn\s+(?:install|add)|pip\s+install|go\s+(?:get|install)|curl|wget|invoke-webrequest|iwr|format|shutdown|reboot)\b/;

function extractShellWrapperScript(input: Record<string, unknown> | undefined): string | undefined {
  const args = Array.isArray(input?.args) ? input.args.map((value) => String(value)) : [];
  const commandIndex = args.findIndex((arg) => arg === '-c' || arg === '-lc' || arg === '-cl');
  if (commandIndex < 0) {
    return undefined;
  }
  const script = args[commandIndex + 1]?.trim();
  return script || undefined;
}

function isReadOnlyShellScript(script: string): boolean {
  const normalized = ` ${script.trim().toLowerCase()} `;
  if (!normalized.trim() || SHELL_MUTATION_PATTERN.test(normalized)) {
    return false;
  }
  if (SHELL_REDIRECT_PATTERN.test(normalized.replaceAll('2>/dev/null', ''))) {
    return false;
  }
  if (normalized.includes('$(') || normalized.includes(String.fromCharCode(96)) || normalized.includes('${')) {
    return false;
  }

  const commands = normalized
    .split(/(?:&&|\|\||\||;)/)
    .map((segment) => segment.trim())
    .filter(Boolean);
  if (commands.length === 0) {
    return false;
  }

  return commands.every((segment) => READ_ONLY_SHELL_COMMANDS.has(normalizeExecutable(segment)));
}

function isRiskyApprovalGranted(metadata: Record<string, unknown> | undefined): boolean {
  return metadata?.approveRiskyOps === true;
}

function readRequestId(metadata: Record<string, unknown> | undefined): string | undefined {
  const requestId = metadata?.requestId;
  return typeof requestId === 'string' && requestId.trim().length > 0 ? requestId : undefined;
}

interface TaskApprovalResult {
  ok: boolean;
  reason?: string;
  ticketId?: string;
  grantId?: string;
  source?: 'none' | 'once' | 'persistent' | 'legacy';
}

function resolveApprovalScope(
  metadata: Record<string, unknown> | undefined,
  sessionId: string,
): RunnerApprovalScope {
  const raw = metadata?.approvalScope;
  if (raw && typeof raw === 'object') {
    const scope = raw as Record<string, unknown>;
    if ((scope.type === 'project' || scope.type === 'chat') && typeof scope.id === 'string' && scope.id) {
      return {
        type: scope.type,
        id: scope.id,
        label: typeof scope.label === 'string' ? scope.label : undefined,
      };
    }
  }
  return { type: 'chat', id: sessionId };
}

async function validatePersistentApproval(
  approvalService: RunnerApprovalService,
  ownerUserId: string,
  runnerId: string,
  scope: RunnerApprovalScope,
): Promise<TaskApprovalResult> {
  const grant = await approvalService.findPersistentGrant({ ownerUserId, runnerId, scope });
  return grant
    ? { ok: true, grantId: grant.grantId, source: 'persistent' }
    : { ok: false, reason: 'persistent approval grant not found or revoked' };
}

async function validateApprovalForTask(
  approvalService: RunnerApprovalService,
  task: RunnerTask,
  runnerId: string,
  scope: RunnerApprovalScope,
  workingDir: string,
  riskLevel: 'low' | 'medium' | 'high',
): Promise<TaskApprovalResult> {
  if (riskLevel !== 'high') {
    return { ok: true, source: 'none' };
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
    return { ...validation, source: validation.ok ? 'once' : undefined };
  }

  const persistent = await validatePersistentApproval(approvalService, userId, runnerId, scope);
  if (persistent.ok) return persistent;

  if (isRiskyApprovalGranted(task.metadata)) {
    return { ok: true, reason: 'legacy approval boolean was accepted', source: 'legacy' };
  }

  return { ok: false, reason: 'missing approval ticket' };
}

function clampWaitMs(waitMs: number | undefined): number {
  if (typeof waitMs !== 'number' || !Number.isFinite(waitMs)) {
    return 15_000;
  }
  return Math.min(25_000, Math.max(1_000, Math.floor(waitMs)));
}

const APPROVAL_WAIT_TIMEOUT_MS = 5 * 60 * 1000;
const DISPATCH_ACK_TIMEOUT_MS = 5_000;

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
