import type {
  PendingRunnerTask,
  RunnerOutboundMessage,
} from '../services/runner-dispatch-service.js';
import type {
  RunnerHeartbeatInput,
  RunnerRegisterInput,
} from '../services/runner-registry-service.js';
import {
  Engine,
  FailureType,
  TerminalStatus,
  engineToJSON,
  failureTypeToJSON,
  isolationLevelToJSON,
  taskEventTypeToJSON,
  terminalStatusToJSON,
  type ConnectHeartbeat,
  type ConnectRegister,
  type ServerEnvelope,
  type TaskEvent,
} from '@agent-flow/runner-protocol';

type GrpcTaskRequest = NonNullable<ServerEnvelope['runTask']>;

export function toRunnerRegisterInput(message: ConnectRegister): RunnerRegisterInput {
  return {
    runnerToken: message.runnerToken,
    runnerId: message.runnerId,
    kind: normalizeRunnerKind(message.kind),
    host: message.host,
    hostName: message.hostName,
    hostIp: message.hostIp,
    version: message.version,
    capabilities: message.capabilities,
    os: message.os,
    arch: message.arch,
    defaultShell: message.defaultShell,
    pathSeparator: message.pathSeparator,
    lineEnding: message.lineEnding,
    workspaceRoots: message.workspaceRoots,
    availableCommands: message.availableCommands,
    capabilitySchemaVersion: message.capabilitySchemaVersion,
    isolationLevel: normalizeIsolationLevel(message.isolationLevel),
    availableEngines: normalizeAvailableEngines(message.availableEngines),
    logicalCpuCount: message.logicalCpuCount,
    memoryBytes: parseOptionalSafeUint(message.memoryBytes, 'register.memoryBytes'),
    maxConcurrentTasks: message.maxConcurrentTasks,
    activeTasks: message.activeTasks,
  };
}

export function toRunnerHeartbeatInput(message: ConnectHeartbeat): RunnerHeartbeatInput {
  return {
    runnerId: message.runnerId,
    runnerToken: message.runnerToken,
    activeTasks: message.activeTasks,
    maxConcurrentTasks: message.maxConcurrentTasks,
  };
}

export function toServerEnvelope(outbound: RunnerOutboundMessage): ServerEnvelope {
  if (outbound.type === 'run_task') {
    return {
      runTask: toGrpcTaskRequest(outbound.task),
    };
  }
  return {
    cancelTask: {
      taskId: outbound.taskId,
      executionId: outbound.executionId,
      attempt: outbound.attempt,
      reason: outbound.reason,
    },
  };
}

function toGrpcTaskRequest(task: PendingRunnerTask): GrpcTaskRequest {
  const inputJson = task.input ? Buffer.from(JSON.stringify(task.input), 'utf8') : Buffer.alloc(0);
  return {
    taskId: task.taskId,
    sessionId: task.sessionId,
    stepId: task.stepId,
    command: task.command,
    args: task.args ?? [],
    env: task.env ?? {},
    workingDir: task.workingDir ?? '',
    timeoutMs: task.timeoutMs ?? 0,
    stream: task.stream ?? true,
    authToken: '',
    inputJson,
    engine: task.engine === 'docker' ? Engine.ENGINE_DOCKER : Engine.ENGINE_HOST,
    executionId: task.executionId,
    attempt: task.attempt,
    deadline: task.deadline,
    maxOutputBytes: task.maxOutputBytes,
    resumeFromEventSequence: task.resumeFromEventSequence,
    sandboxPolicy: {
      enabled: task.sandboxPolicy?.enabled ?? false,
      readOnly: task.sandboxPolicy?.readOnly ?? false,
      allowNetwork: task.sandboxPolicy?.allowNetwork ?? false,
      allowedWorkingDirs: task.sandboxPolicy?.allowedWorkingDirs ?? [],
      allowedReadPaths: task.sandboxPolicy?.allowedReadPaths ?? [],
      allowedWritePaths: task.sandboxPolicy?.allowedWritePaths ?? [],
      blockedCommandFragments: task.sandboxPolicy?.blockedCommandFragments ?? [],
      allowedEnvKeys: task.sandboxPolicy?.allowedEnvKeys ?? [],
      deniedEnvKeys: task.sandboxPolicy?.deniedEnvKeys ?? [],
    },
    docker: task.docker
      ? {
          image: task.docker.image,
          workDir: task.docker.workDir ?? '',
          user: task.docker.user ?? '',
          networkDisabled: task.docker.networkDisabled ?? true,
          readOnlyRootFs: task.docker.readOnlyRootFs ?? true,
          mounts: (task.docker.mounts ?? []).map((mount) => ({
            ...mount,
            readOnly: mount.readOnly ?? false,
          })),
          cpuLimitMillis: task.docker.cpuLimitMillis ?? 0,
          memoryLimitBytes: task.docker.memoryLimitBytes ?? 0,
          pidsLimit: task.docker.pidsLimit ?? 0,
          diskLimitBytes: task.docker.diskLimitBytes ?? 0,
        }
      : undefined,
  };
}

export function toInboundTaskEvent(event: TaskEvent) {
  const timestamp = event.timestamp || new Date().toISOString();
  const runnerId = event.runnerId;
  const normalizedType = normalizeTaskEventType(event.type);
  const identity = {
    executionId: event.executionId,
    attempt: event.attempt,
    sequence: parseOptionalSafeUint(event.eventSequence, 'taskEvent.eventSequence'),
  };

  switch (normalizedType) {
    case 'started':
      return { type: 'started' as const, timestamp, runnerId, ...identity };
    case 'stdout':
      return {
        type: 'stdout' as const,
        timestamp,
        runnerId,
        ...identity,
        chunk: event.stdout?.chunk ?? '',
        chunkSequence: parseOptionalSafeUint(event.stdout?.chunkSequence, 'taskEvent.stdout.chunkSequence'),
        byteOffset: parseOptionalSafeUint(event.stdout?.byteOffset, 'taskEvent.stdout.byteOffset'),
        truncated: event.stdout?.truncated,
      };
    case 'stderr':
      return {
        type: 'stderr' as const,
        timestamp,
        runnerId,
        ...identity,
        chunk: event.stderr?.chunk ?? '',
        chunkSequence: parseOptionalSafeUint(event.stderr?.chunkSequence, 'taskEvent.stderr.chunkSequence'),
        byteOffset: parseOptionalSafeUint(event.stderr?.byteOffset, 'taskEvent.stderr.byteOffset'),
        truncated: event.stderr?.truncated,
      };
    case 'progress':
      return {
        type: 'progress' as const,
        timestamp,
        runnerId,
        ...identity,
        message: event.progress?.message ?? '',
        percent: event.progress?.percent,
      };
    case 'result':
      return {
        type: 'result' as const,
        timestamp,
        runnerId,
        ...identity,
        result: decodeResultPayload(event.result?.outputJson),
        stdoutBytes: parseOptionalSafeUint(event.result?.stdoutBytes, 'taskEvent.result.stdoutBytes'),
        stderrBytes: parseOptionalSafeUint(event.result?.stderrBytes, 'taskEvent.result.stderrBytes'),
        outputTruncated: event.result?.outputTruncated,
      };
    case 'error':
      return {
        type: 'error' as const,
        timestamp,
        runnerId,
        ...identity,
        error: event.error?.message ?? 'runner error',
        retryable: event.error?.retryable,
        failureType: normalizeFailureType(event.error?.failureType),
        code: event.error?.code,
      };
    case 'completed':
      return {
        type: 'completed' as const,
        timestamp,
        runnerId,
        ...identity,
        exitCode: event.completed?.exitCode ?? 0,
        durationMs: parseOptionalSafeUint(event.completed?.durationMs, 'taskEvent.completed.durationMs') ?? 0,
        status: normalizeTerminalStatus(event.completed?.status, event.completed?.exitCode ?? 0),
        failureType: normalizeFailureType(event.completed?.failureType),
        message: event.completed?.message,
        stdoutBytes: parseOptionalSafeUint(event.completed?.stdoutBytes, 'taskEvent.completed.stdoutBytes'),
        stderrBytes: parseOptionalSafeUint(event.completed?.stderrBytes, 'taskEvent.completed.stderrBytes'),
        outputTruncated: event.completed?.outputTruncated,
      };
  }
}

function parseOptionalSafeUint(value: number | undefined, field: string): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${field} must be a safe unsigned integer`);
  }
  return value;
}

function normalizeTaskEventType(
  type: TaskEvent['type'],
): 'started' | 'stdout' | 'stderr' | 'progress' | 'result' | 'error' | 'completed' {
  switch (taskEventTypeToJSON(type)) {
    case 'TASK_EVENT_TYPE_STDOUT':
      return 'stdout';
    case 'TASK_EVENT_TYPE_STDERR':
      return 'stderr';
    case 'TASK_EVENT_TYPE_PROGRESS':
      return 'progress';
    case 'TASK_EVENT_TYPE_RESULT':
      return 'result';
    case 'TASK_EVENT_TYPE_ERROR':
      return 'error';
    case 'TASK_EVENT_TYPE_COMPLETED':
      return 'completed';
    case 'TASK_EVENT_TYPE_STARTED':
    default:
      return 'started';
  }
}

function normalizeTerminalStatus(
  value: NonNullable<TaskEvent['completed']>['status'] | undefined,
  exitCode: number,
) {
  switch (terminalStatusToJSON(value ?? TerminalStatus.TERMINAL_STATUS_UNSPECIFIED)) {
    case 'TERMINAL_STATUS_FAILED':
      return 'failed' as const;
    case 'TERMINAL_STATUS_CANCELLED':
      return 'cancelled' as const;
    case 'TERMINAL_STATUS_TIMED_OUT':
      return 'timed_out' as const;
    case 'TERMINAL_STATUS_REJECTED':
      return 'rejected' as const;
    case 'TERMINAL_STATUS_SUCCEEDED':
      return 'succeeded' as const;
    default:
      return exitCode === 0 ? ('succeeded' as const) : ('failed' as const);
  }
}

function normalizeFailureType(
  value: NonNullable<TaskEvent['error']>['failureType'] | undefined,
): string | undefined {
  const normalized = failureTypeToJSON(value ?? FailureType.FAILURE_TYPE_UNSPECIFIED);
  if (normalized === 'FAILURE_TYPE_UNSPECIFIED' || normalized === 'UNRECOGNIZED') return undefined;
  return normalized.replace(/^FAILURE_TYPE_/, '').toLowerCase();
}

function normalizeIsolationLevel(
  value: ConnectRegister['isolationLevel'],
): 'guarded-host' | 'container' | 'os-sandbox' {
  switch (isolationLevelToJSON(value)) {
    case 'ISOLATION_LEVEL_CONTAINER':
      return 'container';
    case 'ISOLATION_LEVEL_OS_SANDBOX':
      return 'os-sandbox';
    default:
      return 'guarded-host';
  }
}

function normalizeRunnerKind(value: string): 'local' | 'remote' | 'sandbox' | undefined {
  return value === 'local' || value === 'remote' || value === 'sandbox' ? value : undefined;
}

function normalizeAvailableEngines(values: ConnectRegister['availableEngines']): Array<'host' | 'docker'> {
  const engines = new Set<'host' | 'docker'>();
  for (const value of values) {
    const normalized = engineToJSON(value);
    if (normalized === 'ENGINE_HOST') engines.add('host');
    if (normalized === 'ENGINE_DOCKER') engines.add('docker');
  }
  return engines.size > 0 ? [...engines] : ['host'];
}

function decodeResultPayload(raw: Uint8Array | undefined): unknown {
  if (!raw || raw.byteLength === 0) return null;
  try {
    const text = Buffer.from(raw).toString('utf8');
    if (!text.trim()) return null;
    return JSON.parse(text) as unknown;
  } catch {
    return raw;
  }
}
