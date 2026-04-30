import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StructuredLogger } from '@agent-flow/events';
import {
  Server,
  ServerCredentials,
  loadPackageDefinition,
  status as GrpcStatus,
} from '@grpc/grpc-js';
import type {
  handleServerStreamingCall,
  sendUnaryData,
  ServerDuplexStream,
  ServerUnaryCall,
  ServerWritableStream,
  ServiceDefinition,
  UntypedServiceImplementation,
} from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import type { PendingRunnerTask, RunnerDispatchService, RunnerOutboundMessage } from './runner-dispatch-service.js';
import type { RunnerRegistryService } from './runner-registry-service.js';

interface RunnerGrpcServerOptions {
  host: string;
  port: number;
  logger?: StructuredLogger;
}

interface RunnerGrpcServerDeps {
  runnerRegistryService: RunnerRegistryService;
  runnerDispatchService: RunnerDispatchService;
}

interface ConnectRegisterMessage {
  runnerToken: string;
  runnerId?: string;
  kind?: 'local' | 'remote' | 'sandbox';
  host?: string;
  version?: string;
  capabilities?: string[];
}

interface ConnectHeartbeatMessage {
  runnerId: string;
  runnerToken: string;
}

interface RunnerTaskEventMessage {
  taskId: string;
  timestamp?: string;
  runnerId?: string;
  type?: string;
  started?: { message?: string };
  stdout?: { chunk?: string };
  stderr?: { chunk?: string };
  progress?: { message?: string; percent?: number };
  result?: { outputJson?: Uint8Array | string };
  error?: { message?: string; retryable?: boolean };
  completed?: { exitCode?: number; durationMs?: number };
}

interface RunnerEnvelopeMessage {
  register?: ConnectRegisterMessage;
  heartbeat?: ConnectHeartbeatMessage;
  taskEvent?: RunnerTaskEventMessage;
}

interface ServerEnvelopeMessage {
  registerAck?: {
    runnerId: string;
    status: string;
    heartbeatIntervalMs: number;
    serverTime: string;
  };
  runTask?: {
    taskId: string;
    sessionId: string;
    stepId: string;
    command: string;
    args: string[];
    env: Record<string, string>;
    workingDir: string;
    timeoutMs: number;
    stream: boolean;
    inputJson?: Uint8Array;
    engine: string;
    sandboxPolicy: {
      enabled: boolean;
      readOnly: boolean;
      allowNetwork: boolean;
      allowedWorkingDirs: string[];
      allowedReadPaths: string[];
      allowedWritePaths: string[];
      blockedCommandFragments: string[];
      allowedEnvKeys: string[];
      deniedEnvKeys: string[];
    };
  };
  cancelTask?: {
    taskId: string;
    reason: string;
  };
  ping?: {
    serverTime: string;
  };
}

interface RunnerServiceConnectCall extends ServerDuplexStream<RunnerEnvelopeMessage, ServerEnvelopeMessage> {}

interface RunnerServiceHandlers {
  Connect: (call: RunnerServiceConnectCall) => void;
  RunTask: handleServerStreamingCall<Record<string, unknown>, Record<string, unknown>>;
  CancelTask: (
    call: ServerUnaryCall<Record<string, unknown>, Record<string, unknown>>,
    callback: sendUnaryData<Record<string, unknown>>,
  ) => void;
  HealthCheck: (
    call: ServerUnaryCall<Record<string, unknown>, Record<string, unknown>>,
    callback: sendUnaryData<Record<string, unknown>>,
  ) => void;
}

interface StartedRunnerGrpcServer {
  address: string;
  close: () => Promise<void>;
}

const HEARTBEAT_INTERVAL_MS = 10_000;

export async function startRunnerGrpcServer(
  deps: RunnerGrpcServerDeps,
  options: RunnerGrpcServerOptions,
): Promise<StartedRunnerGrpcServer> {
  const protoPath = resolveRunnerProtoPath();
  const packageDefinition = loadSync(protoPath, {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const loaded = loadPackageDefinition(packageDefinition) as Record<string, unknown>;
  const runnerServiceDefinition = resolveRunnerServiceDefinition(loaded);
  const server = new Server();

  const handlers: RunnerServiceHandlers = {
    Connect: (call) => {
      void handleConnectStream(call, deps, options.logger);
    },
    RunTask: (_call: ServerWritableStream<Record<string, unknown>, Record<string, unknown>>) => {
      // grpc connect stream mode is the primary control plane path.
    },
    CancelTask: (call, callback) => {
      const request = call.request as { taskId?: string; reason?: string };
      const taskId = typeof request.taskId === 'string' ? request.taskId.trim() : '';
      if (!taskId) {
        callback(
          {
            code: GrpcStatus.INVALID_ARGUMENT,
            message: 'taskId is required',
            name: 'INVALID_ARGUMENT',
          } as Error,
          undefined,
        );
        return;
      }
      const accepted = deps.runnerDispatchService.requestCancellation(taskId, request.reason ?? 'grpc cancel request');
      callback(null, {
        accepted,
        message: accepted ? 'cancellation enqueued' : 'task not found',
      });
    },
    HealthCheck: (_call, callback) => {
      callback(null, {
        status: 'ok',
        version: 'web-server-runner-bridge',
        unixTime: Math.floor(Date.now() / 1000),
      });
    },
  };

  server.addService(runnerServiceDefinition, handlers as unknown as UntypedServiceImplementation);
  const bindAddress = `${options.host}:${options.port}`;
  await new Promise<void>((resolveBind, rejectBind) => {
    server.bindAsync(bindAddress, ServerCredentials.createInsecure(), (error) => {
      if (error) {
        rejectBind(error);
        return;
      }
      server.start();
      resolveBind();
    });
  });

  return {
    address: bindAddress,
    close: async () => {
      await new Promise<void>((resolveClose, rejectClose) => {
        server.tryShutdown((error) => {
          if (error) {
            rejectClose(error);
            return;
          }
          resolveClose();
        });
      });
    },
  };
}

async function handleConnectStream(
  call: RunnerServiceConnectCall,
  deps: RunnerGrpcServerDeps,
  logger?: StructuredLogger,
): Promise<void> {
  let runnerId = '';
  let runnerToken = '';
  let closed = false;
  let pumpStarted = false;

  const closeWithError = (error: unknown) => {
    if (closed) return;
    closed = true;
    const message = error instanceof Error ? error.message : String(error);
    call.destroy(Object.assign(new Error(message), { code: GrpcStatus.UNKNOWN }));
  };

  const stop = () => {
    closed = true;
  };

  call.on('error', stop);
  call.on('close', stop);
  call.on('cancelled', stop);
  call.on('end', () => {
    stop();
    call.end();
  });

  let incomingQueue = Promise.resolve();
  call.on('data', (message: RunnerEnvelopeMessage) => {
    incomingQueue = incomingQueue
      .then(async () => {
        if (closed) return;
        if (message.register) {
          const registered = await deps.runnerRegistryService.register({
            runnerToken: message.register.runnerToken,
            runnerId: message.register.runnerId,
            kind: message.register.kind,
            host: message.register.host,
            version: message.register.version,
            capabilities: message.register.capabilities,
          });

          runnerId = registered.runnerId;
          runnerToken = message.register.runnerToken;
          call.write({
            registerAck: {
              runnerId: registered.runnerId,
              status: registered.status,
              heartbeatIntervalMs: HEARTBEAT_INTERVAL_MS,
              serverTime: new Date().toISOString(),
            },
          });

          logger?.info('runner.grpc.registered', 'runner connected via grpc stream', {
            attributes: {
              runnerId: registered.runnerId,
              ownerUserId: registered.ownerUserId,
              host: registered.host ?? undefined,
              version: registered.version ?? undefined,
            },
          });

          if (!pumpStarted) {
            pumpStarted = true;
            void pumpOutboundToRunner(call, deps, () => closed, () => ({ runnerId, runnerToken }), logger).catch(
              closeWithError,
            );
          }
          return;
        }

        if (message.heartbeat) {
          await deps.runnerRegistryService.heartbeat({
            runnerId: message.heartbeat.runnerId,
            runnerToken: message.heartbeat.runnerToken,
          });
          return;
        }

        if (message.taskEvent) {
          if (!runnerId || !runnerToken) {
            throw new Error('runner is not registered for task events');
          }
          const event = toInboundTaskEvent(message.taskEvent);
          await deps.runnerDispatchService.acceptTaskEvent({
            runnerId,
            runnerToken,
            taskId: message.taskEvent.taskId,
            event,
          });
        }
      })
      .catch(closeWithError);
  });
}

async function pumpOutboundToRunner(
  call: RunnerServiceConnectCall,
  deps: RunnerGrpcServerDeps,
  isClosed: () => boolean,
  getRunnerIdentity: () => { runnerId: string; runnerToken: string },
  logger?: StructuredLogger,
): Promise<void> {
  while (!isClosed()) {
    const { runnerId, runnerToken } = getRunnerIdentity();
    if (!runnerId || !runnerToken) {
      await sleep(200);
      continue;
    }
    const outbound = await deps.runnerDispatchService.nextOutboundMessage({
      runnerId,
      runnerToken,
      waitMs: 15_000,
    });

    if (isClosed()) {
      return;
    }
    if (!outbound) {
      call.write({
        ping: {
          serverTime: new Date().toISOString(),
        },
      });
      continue;
    }

    writeOutboundEnvelope(call, outbound);
    if (outbound.type === 'run_task') {
      logger?.info('runner.grpc.task.dispatched', 'grpc run_task pushed to runner', {
        attributes: {
          runnerId,
          taskId: outbound.task.taskId,
          sessionId: outbound.task.sessionId,
          stepId: outbound.task.stepId,
          command: outbound.task.command,
        },
      });
      continue;
    }
    logger?.info('runner.grpc.cancel.dispatched', 'grpc cancel_task pushed to runner', {
      attributes: {
        runnerId,
        taskId: outbound.taskId,
        reason: outbound.reason,
      },
    });
  }
}

function writeOutboundEnvelope(call: RunnerServiceConnectCall, outbound: RunnerOutboundMessage): void {
  if (outbound.type === 'run_task') {
    call.write({
      runTask: toGrpcTaskRequest(outbound.task),
    });
    return;
  }
  call.write({
    cancelTask: {
      taskId: outbound.taskId,
      reason: outbound.reason,
    },
  });
}

function toGrpcTaskRequest(task: PendingRunnerTask): ServerEnvelopeMessage['runTask'] {
  const inputJson = task.input ? Buffer.from(JSON.stringify(task.input), 'utf8') : undefined;
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
    inputJson,
    engine: task.engine === 'docker' ? 'ENGINE_DOCKER' : 'ENGINE_HOST',
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
  };
}

function toInboundTaskEvent(event: RunnerTaskEventMessage):
  | { type: 'started'; timestamp?: string; runnerId?: string }
  | { type: 'stdout'; timestamp?: string; runnerId?: string; chunk: string }
  | { type: 'stderr'; timestamp?: string; runnerId?: string; chunk: string }
  | { type: 'progress'; timestamp?: string; runnerId?: string; message: string; percent?: number }
  | { type: 'result'; timestamp?: string; runnerId?: string; result: unknown }
  | { type: 'error'; timestamp?: string; runnerId?: string; error: string; retryable?: boolean }
  | { type: 'completed'; timestamp?: string; runnerId?: string; exitCode: number; durationMs: number } {
  const timestamp = event.timestamp ?? new Date().toISOString();
  const runnerId = event.runnerId;
  const normalizedType = normalizeTaskEventType(event.type);

  switch (normalizedType) {
    case 'started':
      return { type: 'started', timestamp, runnerId };
    case 'stdout':
      return { type: 'stdout', timestamp, runnerId, chunk: event.stdout?.chunk ?? '' };
    case 'stderr':
      return { type: 'stderr', timestamp, runnerId, chunk: event.stderr?.chunk ?? '' };
    case 'progress':
      return {
        type: 'progress',
        timestamp,
        runnerId,
        message: event.progress?.message ?? '',
        percent: event.progress?.percent,
      };
    case 'result': {
      const payload = decodeResultPayload(event.result?.outputJson);
      return {
        type: 'result',
        timestamp,
        runnerId,
        result: payload,
      };
    }
    case 'error':
      return {
        type: 'error',
        timestamp,
        runnerId,
        error: event.error?.message ?? 'runner error',
        retryable: event.error?.retryable,
      };
    case 'completed':
      return {
        type: 'completed',
        timestamp,
        runnerId,
        exitCode: event.completed?.exitCode ?? 0,
        durationMs: event.completed?.durationMs ?? 0,
      };
  }
}

function decodeResultPayload(raw: Uint8Array | string | undefined): unknown {
  if (!raw) return null;
  try {
    const text = typeof raw === 'string' ? raw : Buffer.from(raw).toString('utf8');
    if (!text.trim()) return null;
    return JSON.parse(text) as unknown;
  } catch {
    return raw;
  }
}

function normalizeTaskEventType(type: string | undefined): 'started' | 'stdout' | 'stderr' | 'progress' | 'result' | 'error' | 'completed' {
  switch (type) {
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

function resolveRunnerServiceDefinition(
  loaded: Record<string, unknown>,
): ServiceDefinition {
  const maybeService = (((loaded.agentflow as Record<string, unknown> | undefined)?.runner as
    | Record<string, unknown>
    | undefined)?.v1 as Record<string, unknown> | undefined)?.RunnerService as
    | { service?: ServiceDefinition }
    | undefined;
  if (!maybeService?.service) {
    throw new Error('RunnerService definition not found in loaded runner.proto package');
  }
  return maybeService.service;
}

function resolveRunnerProtoPath(): string {
  const here = fileURLToPath(new URL('.', import.meta.url));
  const candidates = [
    resolve(process.cwd(), 'protocol', 'proto', 'runner.proto'),
    resolve(process.cwd(), '..', '..', 'protocol', 'proto', 'runner.proto'),
    resolve(here, '..', '..', '..', '..', 'protocol', 'proto', 'runner.proto'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error(`runner.proto not found. checked: ${candidates.join(', ')}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
