import * as crypto from 'crypto';
import { TaskStateMachine } from '@agent-flow/checkpoint';
import type { TaskState } from '@agent-flow/checkpoint';
import type { ServerRuntime } from '../runtime.js';
import { createAgent } from './agent-factory.js';

export interface CreateTaskInput {
  message: string;
  model?: string;
}

export function createTask(runtime: ServerRuntime, input: CreateTaskInput): TaskState {
  const taskId = crypto.randomUUID();
  const sessionId = crypto.randomUUID();
  const state = TaskStateMachine.createInitial(taskId, sessionId);
  runtime.tasks.set(taskId, state);

  void runTaskInBackground(runtime, state.taskId, input.message, input.model);
  return state;
}

export function getTask(runtime: ServerRuntime, taskId: string): TaskState | null {
  return runtime.tasks.get(taskId) ?? null;
}

async function runTaskInBackground(
  runtime: ServerRuntime,
  taskId: string,
  message: string,
  model?: string,
): Promise<void> {
  const initial = runtime.tasks.get(taskId);
  if (!initial) return;

  try {
    runtime.tasks.set(taskId, TaskStateMachine.transition(initial, 'start'));

    const { agent } = createAgent(runtime, { model });
    for await (const _msg of agent.run(message)) {
      // Hook for future event streaming / persistence.
    }

    const completed = runtime.tasks.get(taskId);
    if (completed) {
      runtime.tasks.set(taskId, TaskStateMachine.transition(completed, 'complete'));
    }
  } catch (error) {
    const failed = runtime.tasks.get(taskId);
    if (!failed) return;

    const next = TaskStateMachine.transition(failed, 'fail');
    next.error = {
      code: 'TASK_ERROR',
      message: error instanceof Error ? error.message : 'Unknown task error',
      retryable: true,
    };
    runtime.tasks.set(taskId, next);
  }
}

