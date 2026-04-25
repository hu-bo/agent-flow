import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import type { TaskAction, TaskEvent, TaskRecord, TaskStatus, TaskType } from '../contracts/api.js';
import { NotFoundError } from '../lib/errors.js';
import { ModelService } from './model-service.js';
import { SessionService } from './session-service.js';

export interface CreateTaskInput {
  prompt: string;
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
  private readonly timers = new Map<string, NodeJS.Timeout[]>();

  constructor(
    private readonly modelService: ModelService,
    private readonly sessionService: SessionService,
  ) {}

  listTasks() {
    return Array.from(this.tasks.values()).sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt),
    );
  }

  createTask(input: CreateTaskInput) {
    const modelId = input.modelId ?? this.modelService.getCurrentModelId();
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
    });
    this.scheduleExecution(task.taskId);
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
        this.updateTask(taskId, 'paused');
        this.clearTimers(taskId);
        break;
      case 'resume':
        this.updateTask(taskId, 'running');
        this.scheduleCompletion(taskId, 180);
        break;
      case 'cancel':
        this.updateTask(taskId, 'cancelled');
        this.clearTimers(taskId);
        this.pushEvent(taskId, 'task.cancelled', { status: 'cancelled' });
        break;
      case 'retry':
        task.retryCount += 1;
        task.error = undefined;
        this.updateTask(taskId, 'pending');
        this.scheduleExecution(taskId);
        break;
    }

    return this.getTask(taskId);
  }

  private scheduleExecution(taskId: string) {
    this.clearTimers(taskId);

    const timers = [
      setTimeout(() => {
        if (this.getTask(taskId).status !== 'pending') return;
        this.updateTask(taskId, 'running');
      }, 40),
      setTimeout(() => {
        this.completeTask(taskId);
      }, 220),
    ];

    timers.forEach((timer) => timer.unref?.());
    this.timers.set(taskId, timers);
  }

  private scheduleCompletion(taskId: string, delayMs: number) {
    const timer = setTimeout(() => {
      this.completeTask(taskId);
    }, delayMs);
    timer.unref?.();
    const current = this.timers.get(taskId) ?? [];
    current.push(timer);
    this.timers.set(taskId, current);
  }

  private completeTask(taskId: string) {
    const task = this.getTask(taskId);
    if (!['pending', 'running'].includes(task.status)) {
      return;
    }

    task.outputs = {
      summary: `Task "${task.prompt}" completed by the scaffold executor.`,
      modelId: task.modelId,
      taskType: task.type,
    };
    task.latestCheckpointId = randomUUID();
    this.updateTask(taskId, 'completed');
    this.pushEvent(taskId, 'task.completed', {
      status: 'completed',
      checkpointId: task.latestCheckpointId,
      outputs: task.outputs as Record<string, unknown>,
    });
    this.clearTimers(taskId);
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

  private clearTimers(taskId: string) {
    for (const timer of this.timers.get(taskId) ?? []) {
      clearTimeout(timer);
    }
    this.timers.delete(taskId);
  }
}

function getTaskChannel(taskId: string) {
  return `task:${taskId}`;
}
