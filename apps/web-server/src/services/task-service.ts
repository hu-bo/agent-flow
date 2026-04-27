import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import type { AgentEvent, AgentRunResult, AgentRuntime } from '@agent-flow/core';
import type { StructuredLogger, Tracer } from '@agent-flow/events';
import type { TaskAction, TaskEvent, TaskRecord, TaskStatus, TaskType } from '../contracts/api.js';
import { ConflictError, NotFoundError } from '../lib/errors.js';
import { ModelService } from './model-service.js';
import { SessionService } from './session-service.js';

export interface CreateTaskInput {
  prompt: string;
  profileId?: string;
  modelId?: string;
  sessionId?: string;
  type?: TaskType;
  config?: Record<string, unknown>;
  maxRetries?: number;
}

type TaskListener = (event: TaskEvent) => void;

export class TaskService {
  private readonly emitter = new EventEmitter();
  private readonly tasks = new Map<string, TaskRecord>();
  private readonly events = new Map<string, TaskEvent[]>();
  private readonly executions = new Map<string, Promise<void>>();
  private readonly abortControllers = new Map<string, AbortController>();

  constructor(
    private readonly modelService: ModelService,
    private readonly sessionService: SessionService,
    private readonly runtime: AgentRuntime,
    private readonly logger?: StructuredLogger,
    private readonly tracer?: Tracer,
  ) {}

  listTasks() {
    return Array.from(this.tasks.values()).sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt),
    );
  }

  createTask(input: CreateTaskInput) {
    const modelId = input.modelId ?? this.modelService.resolveModelIdForProfile(input.profileId);
    this.modelService.getModel(modelId);

    const session =
      input.sessionId != null
        ? this.sessionService.getSession(input.sessionId)
        : this.sessionService.createSession({
            modelId,
            cwd: process.cwd(),
          });

    const now = new Date().toISOString();
    const task: TaskRecord = {
      taskId: randomUUID(),
      sessionId: session.sessionId,
      profileId: input.profileId,
      type: input.type ?? 'chat',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      latestCheckpointId: '',
      retryCount: 0,
      maxRetries: input.maxRetries ?? 2,
      modelId,
      prompt: input.prompt,
    };

    this.tasks.set(task.taskId, task);
    this.pushEvent(task.taskId, 'task.created', {
      status: task.status,
      prompt: task.prompt,
      modelId: task.modelId,
      profileId: task.profileId,
      type: task.type,
    });
    this.scheduleExecution(task.taskId, input.config);
    return task;
  }

  getTask(taskId: string) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new NotFoundError(`Task not found: ${taskId}`);
    }
    return task;
  }

  getTaskEvents(taskId: string, cursor = 0) {
    this.getTask(taskId);
    return (this.events.get(taskId) ?? []).filter((event) => event.sequence > cursor);
  }

  subscribe(taskId: string, listener: TaskListener) {
    this.getTask(taskId);
    const channel = getTaskChannel(taskId);
    this.emitter.on(channel, listener);
    return () => {
      this.emitter.off(channel, listener);
    };
  }

  applyAction(taskId: string, action: TaskAction) {
    const task = this.getTask(taskId);

    switch (action) {
      case 'pause':
        if (task.status === 'running' || task.status === 'pending') {
          this.abortTask(taskId, 'Task paused');
          this.updateTask(taskId, 'paused');
        }
        break;
      case 'resume':
        if (task.status !== 'paused') {
          throw new ConflictError(`Task "${taskId}" is not paused.`);
        }
        this.updateTask(taskId, 'pending');
        this.scheduleExecution(taskId);
        break;
      case 'cancel':
        if (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') {
          throw new ConflictError(`Task "${taskId}" is already terminal (${task.status}).`);
        }
        this.abortTask(taskId, 'Task cancelled');
        this.updateTask(taskId, 'cancelled');
        this.pushEvent(taskId, 'task.cancelled', { status: 'cancelled' });
        break;
      case 'retry':
        if (task.retryCount >= task.maxRetries) {
          throw new ConflictError(
            `Task "${taskId}" reached max retries (${task.maxRetries}).`,
          );
        }
        task.retryCount += 1;
        task.error = undefined;
        task.outputs = undefined;
        task.latestCheckpointId = '';
        this.updateTask(taskId, 'pending');
        this.scheduleExecution(taskId);
        break;
    }

    return this.getTask(taskId);
  }

  private scheduleExecution(taskId: string, config?: Record<string, unknown>) {
    const currentExecution = this.executions.get(taskId);
    if (currentExecution) {
      void currentExecution.finally(() => {
        const latestTask = this.tasks.get(taskId);
        if (!latestTask) {
          return;
        }
        if (latestTask.status === 'pending') {
          this.scheduleExecution(taskId, config);
        }
      });
      return;
    }

    const execution = this.executeTask(taskId, config).finally(() => {
      this.executions.delete(taskId);
    });
    this.executions.set(taskId, execution);
  }

  private async executeTask(taskId: string, config?: Record<string, unknown>) {
    const task = this.getTask(taskId);
    if (task.status !== 'pending' && task.status !== 'running') {
      return;
    }

    const span = this.tracer
      ? await this.tracer.startSpan('task.execute', {
          attributes: {
            taskId,
            modelId: task.modelId,
            taskType: task.type,
          },
        })
      : undefined;

    this.updateTask(taskId, 'running');
    const controller = new AbortController();
    this.abortControllers.set(taskId, controller);

    try {
      const result = await this.runtime.run(
        {
          taskId: task.taskId,
          goal: task.prompt,
          metadata: {
            modelId: task.modelId,
            profileId: task.profileId,
            taskType: task.type,
            sessionId: task.sessionId,
            ...(config ?? {}),
          },
        },
        {
          signal: controller.signal,
          onEvent: async (event) => {
            this.handleAgentEvent(taskId, event);
          },
        },
      );

      this.applyResult(taskId, result);
      await span?.end({
        status: result.status,
        eventCount: result.events.length,
      });
    } catch (error) {
      const latestTask = this.getTask(taskId);
      if (latestTask.status === 'paused' || latestTask.status === 'cancelled') {
        await span?.end({ status: task.status });
        return;
      }

      const message = error instanceof Error ? error.message : String(error);
      task.error = message;
      this.updateTask(taskId, 'failed');
      this.pushEvent(taskId, 'task.failed', {
        status: 'failed',
        error: message,
      });
      this.logger?.error('task.execute.failed', 'task execution failed', {
        attributes: {
          taskId,
          error: message,
        },
      });
      await span?.fail(error);
    } finally {
      this.abortControllers.delete(taskId);
    }
  }

  private applyResult(taskId: string, result: AgentRunResult) {
    const task = this.getTask(taskId);
    task.latestCheckpointId = result.checkpoints.at(-1)?.id ?? task.latestCheckpointId;
    task.outputs = {
      ...result.outputs,
      coreTaskId: result.taskId,
      coreSessionId: result.sessionId,
      checkpoints: result.checkpoints.length,
    };

    const latestTask = this.getTask(taskId);
    if (latestTask.status === 'paused' || latestTask.status === 'cancelled') {
      return;
    }

    if (result.status === 'succeeded') {
      this.updateTask(taskId, 'completed');
      this.pushEvent(taskId, 'task.completed', {
        status: 'completed',
        checkpointId: task.latestCheckpointId,
        outputs: task.outputs as Record<string, unknown>,
      });
      return;
    }

    task.error = result.error ?? `Core runtime status: ${result.status}`;
    this.updateTask(taskId, 'failed');
    this.pushEvent(taskId, 'task.failed', {
      status: 'failed',
      error: task.error,
      outputs: task.outputs as Record<string, unknown>,
    });
  }

  private handleAgentEvent(taskId: string, event: AgentEvent) {
    this.pushEvent(taskId, 'task.log', {
      agentEvent: event,
    });
  }

  private updateTask(taskId: string, status: TaskStatus) {
    const task = this.getTask(taskId);
    task.status = status;
    task.updatedAt = new Date().toISOString();
    this.pushEvent(taskId, 'task.updated', {
      status,
      retryCount: task.retryCount,
      checkpointId: task.latestCheckpointId,
    });
  }

  private pushEvent(taskId: string, type: TaskEvent['type'], payload: Record<string, unknown>) {
    const list = this.events.get(taskId) ?? [];
    const event: TaskEvent = {
      eventId: randomUUID(),
      taskId,
      sequence: list.length + 1,
      type,
      timestamp: new Date().toISOString(),
      payload,
    };
    list.push(event);
    this.events.set(taskId, list);
    this.emitter.emit(getTaskChannel(taskId), event);
  }

  private abortTask(taskId: string, reason: string) {
    const controller = this.abortControllers.get(taskId);
    if (controller && !controller.signal.aborted) {
      controller.abort(reason);
    }
  }
}

function getTaskChannel(taskId: string) {
  return `task:${taskId}`;
}
