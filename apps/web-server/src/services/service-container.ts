import type { AppEnv } from '../config/env.js';
import { AutoCompactor } from '@agent-flow/compact';
import { ConsoleEventSink, StructuredLogger, Tracer } from '@agent-flow/events';
import { MemoryService } from '@agent-flow/memory';
import type { AppDataSource } from '../db/data-source.js';
import { AuthService } from './auth-service.js';
import { ChatService } from './chat-service.js';
import { CompactService } from './compact-service.js';
import { ModelAdminService } from './model-admin-service.js';
import { ModelAdapterService } from './model-adapter-service.js';
import { ModelService } from './model-service.js';
import { RunnerRegistrationService } from './runner-registration-service.js';
import { RunnerRegistryService } from './runner-registry-service.js';
import { RunnerDispatchService } from './runner-dispatch-service.js';
import { RunnerApprovalService } from './runner-approval-service.js';
import { RemoteRunner } from './remote-runner.js';
import { CoreRuntimeGateway, createCoreAgentRuntime } from './runtime-gateway.js';
import { SessionService } from './session-service.js';
import { TaskService } from './task-service.js';

export async function createServices(env: AppEnv, db: AppDataSource) {
  const logger = new StructuredLogger({
    sinks: [new ConsoleEventSink()],
    defaultAttributes: {
      service: '@agent-flow/web-server',
    },
  });
  const tracer = new Tracer({ logger });
  const memoryService = new MemoryService();
  const modelService = new ModelService(db, env.defaultModel);
  const modelAdapterService = new ModelAdapterService(db);
  const modelAdminService = new ModelAdminService(db, {
    onModelConfigChanged: async () => {
      await modelService.refreshRuntimeModelCache();
    },
  });
  modelService.setRoutingPolicyWriter(modelAdminService);
  await modelService.initialize();

  const sessionService = new SessionService(process.cwd());
  const runnerRegistrationService = new RunnerRegistrationService(db, {
    runnerServerAddr: env.runnerServerAddr,
    runnerGrpcServerAddr: env.runnerGrpcServerAddr,
    runnerDownloadBaseUrl: env.runnerDownloadBaseUrl,
  });
  const runnerRegistryService = new RunnerRegistryService(db, runnerRegistrationService);
  const runnerApprovalService = new RunnerApprovalService();
  const runnerDispatchService = new RunnerDispatchService(runnerRegistryService, runnerApprovalService, logger);
  const remoteRunner = new RemoteRunner(runnerDispatchService);
  const runtime = createCoreAgentRuntime({
    cwd: process.cwd(),
    runners: [remoteRunner],
  });
  const runtimeGateway = new CoreRuntimeGateway({
    runtime,
    memoryService,
    modelAdapterService,
    logger,
    tracer,
  });
  const taskService = new TaskService(modelService, sessionService, runtime, logger, tracer);
  const compactService = new CompactService(sessionService, new AutoCompactor());
  const chatService = new ChatService(sessionService, modelService, runtimeGateway, memoryService);
  const authService = new AuthService(db, {
    authApiBaseUrl: env.authApiBaseUrl,
    appName: env.authAppName,
  });

  return {
    modelService,
    modelAdapterService,
    modelAdminService,
    sessionService,
    runnerRegistrationService,
    runnerRegistryService,
    runnerApprovalService,
    runnerDispatchService,
    taskService,
    compactService,
    chatService,
    authService,
  };
}
