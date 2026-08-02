import type { Repository } from 'typeorm';
import type { AppDataSource } from '../db/data-source.js';
import {
  RunnerExecutionEntity,
  type RunnerExecutionTerminalStatus,
} from '../db/entities/runner-execution.entity.js';
import { RunnerExecutionEventEntity } from '../db/entities/runner-execution-event.entity.js';
import { AppError } from '../lib/errors.js';
import {
  transitionCancellationRequested,
  transitionDispatchAck,
  transitionInboundEvent,
  transitionTerminal,
  transitionTimedOut,
} from './runner-execution-state.js';

interface CreateAcceptedExecutionInput {
  executionId: string;
  attempt: number;
  taskId: string;
  runnerId: string;
  taskPayload: Record<string, unknown>;
  deadline: Date;
}

interface DispatchAckInput {
  executionId: string;
  attempt: number;
  taskId: string;
  runnerId: string;
  accepted: boolean;
  message?: string;
}

interface ExecutionIdentity {
  executionId: string;
  attempt: number;
}

interface PersistInboundEventInput extends ExecutionIdentity {
  runnerId: string;
  taskId: string;
  event: {
    type: string;
    sequence?: number;
    status?: RunnerExecutionTerminalStatus;
    failureType?: string;
    message?: string;
  };
}

export class RunnerExecutionRepository {
  private readonly executions: Repository<RunnerExecutionEntity>;

  constructor(private readonly db: AppDataSource) {
    this.executions = db.getRepository(RunnerExecutionEntity);
  }

  findRecoverable(): Promise<RunnerExecutionEntity[]> {
    return this.executions.find({
      where: [{ state: 'accepted' }, { state: 'running' }],
      order: { createdAt: 'ASC' },
    });
  }

  async createAccepted(input: CreateAcceptedExecutionInput): Promise<void> {
    const record = this.executions.create({
      ...input,
      state: 'accepted',
      terminalStatus: null,
      failureType: null,
      failureMessage: null,
      dispatchAcked: false,
      cancelRequested: false,
      lastEventSequence: '0',
    });
    try {
      await this.executions.insert({ ...record, taskPayload: record.taskPayload as never });
    } catch (error) {
      throw new AppError(
        409,
        'RUNNER_EXECUTION_CONFLICT',
        `Runner execution already exists: ${input.executionId}/${input.attempt}`,
        { cause: error },
      );
    }
  }

  async acknowledgeDispatch(input: DispatchAckInput): Promise<boolean> {
    const record = await this.executions.findOne({
      where: { executionId: input.executionId, attempt: input.attempt },
    });
    if (!record || record.runnerId !== input.runnerId || record.taskId !== input.taskId) return false;
    Object.assign(record, transitionDispatchAck(input.accepted, input.message));
    await this.executions.save(record);
    return true;
  }

  async acknowledgeCancellation(input: ExecutionIdentity & { runnerId: string; accepted: boolean }): Promise<void> {
    await this.executions.update(
      { executionId: input.executionId, attempt: input.attempt, runnerId: input.runnerId },
      { cancelRequested: input.accepted },
    );
  }

  async requestCancellation(input: ExecutionIdentity): Promise<void> {
    await this.executions.update(input, transitionCancellationRequested());
  }

  find(input: ExecutionIdentity): Promise<RunnerExecutionEntity | null> {
    return this.executions.findOne({ where: input });
  }

  async markInvalidPayload(record: RunnerExecutionEntity): Promise<void> {
    Object.assign(
      record,
      transitionTerminal(
        'failed',
        'internal',
        'persisted execution does not contain a valid outbound task',
      ),
    );
    await this.executions.save(record);
  }

  async persistInboundEvent(input: PersistInboundEventInput): Promise<number> {
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
      Object.assign(record, transitionInboundEvent(record.state, input.event));
      await executions.save(record);
      return sequence;
    });
  }

  async markTimedOut(input: ExecutionIdentity): Promise<boolean> {
    const record = await this.find(input);
    if (!record || record.state === 'terminal') return false;
    Object.assign(record, transitionTimedOut());
    await this.executions.save(record);
    return true;
  }

  async markTerminal(
    input: ExecutionIdentity,
    status: RunnerExecutionTerminalStatus,
    failureType: string,
    message: string,
  ): Promise<boolean> {
    const record = await this.find(input);
    if (!record || record.state === 'terminal') return false;
    Object.assign(record, transitionTerminal(status, failureType, message));
    await this.executions.save(record);
    return true;
  }
}
