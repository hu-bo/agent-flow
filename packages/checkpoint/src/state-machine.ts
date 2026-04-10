export type TaskStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed';

export interface TaskState {
  taskId: string;
  sessionId: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  latestCheckpointId: string | null;
  error?: { code: string; message: string; retryable: boolean };
  retryCount: number;
  maxRetries: number;
  outputs?: Record<string, string>;
}

export type TaskEvent = 'start' | 'pause' | 'resume' | 'complete' | 'fail' | 'retry';

export class TaskStateMachine {
  private static transitions: Record<TaskStatus, Partial<Record<TaskEvent, TaskStatus>>> = {
    pending: { start: 'running' },
    running: { pause: 'paused', complete: 'completed', fail: 'failed' },
    paused: { resume: 'running' },
    completed: {},
    failed: { retry: 'running' },
  };

  static transition(state: TaskState, event: TaskEvent): TaskState {
    const allowed = TaskStateMachine.transitions[state.status];
    const nextStatus = allowed[event];

    if (!nextStatus) {
      throw new Error(`Invalid transition: cannot apply '${event}' to status '${state.status}'`);
    }

    return {
      ...state,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
      retryCount: event === 'retry' ? state.retryCount + 1 : state.retryCount,
    };
  }

  static createInitial(taskId: string, sessionId: string, maxRetries: number = 3): TaskState {
    const now = new Date().toISOString();
    return {
      taskId,
      sessionId,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      latestCheckpointId: null,
      retryCount: 0,
      maxRetries,
    };
  }
}
