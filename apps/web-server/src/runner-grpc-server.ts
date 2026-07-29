import type { StructuredLogger } from '@agent-flow/events';
import {
  Server,
  ServerCredentials,
  status as GrpcStatus,
} from '@grpc/grpc-js';
import type {
  handleServerStreamingCall,
  sendUnaryData,
  ServerDuplexStream,
  ServerUnaryCall,
  ServerWritableStream,
  UntypedServiceImplementation,
} from '@grpc/grpc-js';
import {
  toInboundTaskEvent,
  toRunnerHeartbeatInput,
  toRunnerRegisterInput,
  toServerEnvelope,
} from './grpc/runner-message-mappers.js';
import {
  loadRunnerServiceDefinition,
  type RunnerEnvelopeMessage,
  type ServerEnvelopeMessage,
} from './grpc/runner-protocol.js';
import type {
  RunnerDispatchService,
  RunnerOutboundMessage,
} from './services/runner-dispatch-service.js';
import type { RunnerRegistryService } from './services/runner-registry-service.js';

interface RunnerGrpcServerOptions {
  host: string;
  port: number;
  logger?: StructuredLogger;
}

interface RunnerGrpcServerDeps {
  runnerRegistryService: RunnerRegistryService;
  runnerDispatchService: RunnerDispatchService;
}

interface RunnerServiceConnectCall
  extends ServerDuplexStream<RunnerEnvelopeMessage, ServerEnvelopeMessage> {}

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
  const server = new Server();
  const handlers: RunnerServiceHandlers = {
    Connect: (call) => {
      void handleConnectStream(call, deps, options.logger);
    },
    RunTask: (_call: ServerWritableStream<Record<string, unknown>, Record<string, unknown>>) => {
      // The bidirectional Connect stream is the primary control-plane path.
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
      const accepted = deps.runnerDispatchService.requestCancellation(
        taskId,
        request.reason ?? 'grpc cancel request',
      );
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

  server.addService(
    loadRunnerServiceDefinition(),
    handlers as unknown as UntypedServiceImplementation,
  );
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
          const registered = await deps.runnerRegistryService.register(
            toRunnerRegisterInput(message.register),
          );

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
              hostName: registered.hostName ?? undefined,
              hostIp: registered.hostIp ?? undefined,
              version: registered.version ?? undefined,
              os: registered.os ?? undefined,
              arch: registered.arch ?? undefined,
              defaultShell: registered.defaultShell ?? undefined,
            },
          });

          if (!pumpStarted) {
            pumpStarted = true;
            void pumpOutboundToRunner(
              call,
              deps,
              () => closed,
              () => ({ runnerId, runnerToken }),
              logger,
            ).catch(closeWithError);
          }
          return;
        }

        if (message.heartbeat) {
          await deps.runnerRegistryService.heartbeat(toRunnerHeartbeatInput(message.heartbeat));
          return;
        }

        if (message.taskEvent) {
          if (!runnerId || !runnerToken) {
            throw new Error('runner is not registered for task events');
          }
          const acknowledgedSequence = await deps.runnerDispatchService.acceptTaskEvent({
            runnerId,
            runnerToken,
            taskId: message.taskEvent.taskId,
            event: toInboundTaskEvent(message.taskEvent),
          });
          call.write({
            eventAck: {
              executionId: message.taskEvent.executionId ?? message.taskEvent.taskId,
              attempt: message.taskEvent.attempt ?? 1,
              eventSequence: acknowledgedSequence,
            },
          });
          return;
        }

        if (message.dispatchAck) {
          if (!runnerId || !runnerToken) {
            throw new Error('runner is not registered for dispatch acknowledgements');
          }
          await deps.runnerDispatchService.acceptDispatchAck({
            runnerId,
            runnerToken,
            ...message.dispatchAck,
          });
          return;
        }

        if (message.cancelAck) {
          if (!runnerId || !runnerToken) {
            throw new Error('runner is not registered for cancel acknowledgements');
          }
          await deps.runnerDispatchService.acceptCancelAck({
            runnerId,
            runnerToken,
            ...message.cancelAck,
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

    call.write(toServerEnvelope(outbound));
    logOutboundMessage(logger, runnerId, outbound);
  }
}

function logOutboundMessage(
  logger: StructuredLogger | undefined,
  runnerId: string,
  outbound: RunnerOutboundMessage,
): void {
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
    return;
  }
  logger?.info('runner.grpc.cancel.dispatched', 'grpc cancel_task pushed to runner', {
    attributes: {
      runnerId,
      taskId: outbound.taskId,
      reason: outbound.reason,
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
