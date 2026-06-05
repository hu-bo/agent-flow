export class TaskStateMachine {
    static transitions = {
        pending: { start: 'running' },
        running: { pause: 'paused', complete: 'completed', fail: 'failed' },
        paused: { resume: 'running' },
        completed: {},
        failed: { retry: 'running' },
    };
    static transition(state, event) {
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
    static createInitial(taskId, sessionId, maxRetries = 3) {
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
//# sourceMappingURL=state-machine.js.map