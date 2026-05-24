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
import { ProjectService } from './project-service.js';
import { RunnerDirectoryService } from './runner-directory-service.js';
import { RunnerRegistrationService } from './runner-registration-service.js';
import { RunnerRegistryService } from './runner-registry-service.js';
import { RunnerDispatchService } from './runner-dispatch-service.js';
import { RunnerApprovalService } from './runner-approval-service.js';
import { RemoteRunner } from './remote-runner.js';
import { CoreRuntimeGateway, ModelBackedLlmStepExecutor, createCoreAgentRuntimeBundle } from './runtime-gateway.js';
import { SessionService } from './session-service.js';
import { SpecWorkflowService } from './spec-workflow-service.js';
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

  const runnerRegistrationService = new RunnerRegistrationService(db, {
    runnerServerAddr: env.runnerServerAddr,
    runnerGrpcServerAddr: env.runnerGrpcServerAddr,
    runnerDownloadBaseUrl: env.runnerDownloadBaseUrl,
  });
  const runnerRegistryService = new RunnerRegistryService(db, runnerRegistrationService);
  const runnerApprovalService = new RunnerApprovalService();
  const runnerDispatchService = new RunnerDispatchService(runnerRegistryService, runnerApprovalService, logger);
  const projectService = new ProjectService(db, runnerRegistryService);
  const sessionService = new SessionService(db, process.cwd());
  const runnerDirectoryService = new RunnerDirectoryService(runnerDispatchService, runnerRegistryService);
  const remoteRunner = new RemoteRunner(runnerDispatchService);
  const runtimeBundle = createCoreAgentRuntimeBundle({
    cwd: process.cwd(),
    runners: [remoteRunner],
    runnerDispatchService,
    llmExecutor: new ModelBackedLlmStepExecutor(modelAdapterService),
  });
  const { runtime, toolRegistry, toolExecutor } = runtimeBundle;
  const runtimeGateway = new CoreRuntimeGateway({
    runtime,
    memoryService,
    modelAdapterService,
    toolRegistry,
    toolExecutor,
    logger,
    tracer,
  });
  const taskService = new TaskService(modelService, sessionService, runtime, logger, tracer);
  const compactService = new CompactService(sessionService, new AutoCompactor());
  const specWorkflowService = new SpecWorkflowService(sessionService);
  const chatService = new ChatService(
    sessionService,
    modelService,
    runtimeGateway,
    specWorkflowService,
    memoryService,
  );
  const authService = new AuthService(db, {
    authApiBaseUrl: env.authApiBaseUrl,
    appName: env.authAppName,
  });

  return {
    modelService,
    modelAdapterService,
    modelAdminService,
    projectService,
    sessionService,
    runnerRegistrationService,
    runnerRegistryService,
    runnerApprovalService,
    runnerDirectoryService,
    runnerDispatchService,
    taskService,
    compactService,
    specWorkflowService,
    chatService,
    authService,
  };
}
