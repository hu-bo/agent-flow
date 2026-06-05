export type TaskStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed';
export interface TaskState {
    taskId: string;
    sessionId: string;
    status: TaskStatus;
    createdAt: string;
    updatedAt: string;
    latestCheckpointId: string | null;
    error?: {
        code: string;
        message: string;
        retryable: boolean;
    };
    retryCount: number;
    maxRetries: number;
    outputs?: Record<string, string>;
}
export type TaskEvent = 'start' | 'pause' | 'resume' | 'complete' | 'fail' | 'retry';
export declare class TaskStateMachine {
    private static transitions;
    static transition(state: TaskState, event: TaskEvent): TaskState;
    static createInitial(taskId: string, sessionId: string, maxRetries?: number): TaskState;
}
//# sourceMappingURL=state-machine.d.ts.map