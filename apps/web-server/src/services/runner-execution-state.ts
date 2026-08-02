import type {
  RunnerExecutionState,
  RunnerExecutionTerminalStatus,
} from '../db/entities/runner-execution.entity.js';

export interface RunnerExecutionPatch {
  state?: RunnerExecutionState;
  terminalStatus?: RunnerExecutionTerminalStatus | null;
  failureType?: string | null;
  failureMessage?: string | null;
  dispatchAcked?: boolean;
  cancelRequested?: boolean;
}

export function transitionDispatchAck(accepted: boolean, message?: string): RunnerExecutionPatch {
  if (accepted) {
    return { dispatchAcked: true, state: 'running' };
  }
  return {
    dispatchAcked: false,
    state: 'terminal',
    terminalStatus: 'rejected',
    failureType: message?.includes('concurrency exhausted') ? 'resource_exhausted' : 'validation',
    failureMessage: message || 'Runner rejected the execution dispatch',
  };
}

export function transitionInboundEvent(
  currentState: RunnerExecutionState,
  event: {
    type: string;
    status?: RunnerExecutionTerminalStatus;
    failureType?: string;
    message?: string;
  },
): RunnerExecutionPatch {
  if (event.type === 'completed') {
    return {
      state: 'terminal',
      terminalStatus: event.status ?? 'failed',
      failureType: event.failureType ?? null,
      failureMessage: event.message ?? null,
    };
  }
  return currentState === 'accepted' ? { state: 'running' } : {};
}

export function transitionCancellationRequested(): RunnerExecutionPatch {
  return { cancelRequested: true };
}

export function transitionTerminal(
  terminalStatus: RunnerExecutionTerminalStatus,
  failureType: string,
  failureMessage: string,
): RunnerExecutionPatch {
  return { state: 'terminal', terminalStatus, failureType, failureMessage };
}

export function transitionTimedOut(): RunnerExecutionPatch {
  return transitionTerminal('timed_out', 'timeout', 'runner execution deadline elapsed');
}
