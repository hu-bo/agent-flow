import type { AppEnv } from '../config/env.js';
import { resolve } from 'node:path';
import { AutoCompactor } from '@agent-flow/compact';
import { StructuredLogger, Tracer } from '@agent-flow/events';
import { MemoryService } from '@agent-flow/memory';
import type { AppDataSource } from '../db/data-source.js';
import { AuthService } from './auth-service.js';
import { ChatService } from './chat-service.js';
import { ChatModeStrategyRegistry } from './chat-mode-strategy.js';
import { CompactService } from './compact-service.js';
import { ModelAdminService } from './model-admin-service.js';
import { ModelAdapterService } from './model-adapter-service.js';
import { ModelService } from './model-service.js';
import { ProjectService } from './project-service.js';
import { RunnerDirectoryService } from './runner-directory-service.js';
import { RunnerPackageService } from './runner-package-service.js';
import { RunnerRegistrationService } from './runner-registration-service.js';
import { RunnerRegistryService } from './runner-registry-service.js';
import { RunnerDispatchService } from './runner-dispatch-service.js';
import { RunnerApprovalService } from './runner-approval-service.js';
import { RemoteRunner } from './remote-runner.js';
import { createCoreAgentRuntimeBundle } from '../runtime/core-runtime-factory.js';
import { ModelBackedLlmStepExecutor } from '../runtime/llm-step-executor.js';
import { ModelChatDriver } from '../runtime/model-chat-driver.js';
import { ModelToolRunner } from '../runtime/model-tool-runner.js';
import { RuntimeTurnEngine } from '../runtime/runtime-turn-engine.js';
import { ModelBackedWorkflowTriageAgent } from '../runtime/workflow-triage-agent.js';
import { DbCheckpointStore, DbReplayStore, DbSessionStore } from '../runtime/db-runtime-stores.js';
import { SessionService } from './session-service.js';
import { SpecWorkflowService } from './spec-workflow-service.js';
import { SpecConversationService } from './spec-conversation-service.js';
import { TaskService } from './task-service.js';
import { PinoEventSink } from '../lib/pino-event-sink.js';

const LOG_LEVEL = 'info' as const;

export async function createServices(env: AppEnv, db: AppDataSource) {
  const LOG_DIR = resolve(process.cwd(), 'logs');
  const logger = new StructuredLogger({
    sinks: [
      new PinoEventSink({
        service: '@agent-flow/web-server',
        logLevel: LOG_LEVEL,
        logDir: LOG_DIR,
        output: 'file',
        envLabel: env.nodeEnv,
      }),
    ],
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
  const runnerApprovalService = new RunnerApprovalService(db);
  const sessionService = new SessionService(db, process.cwd());
  const runnerDispatchService = new RunnerDispatchService(
    runnerRegistryService,
    runnerApprovalService,
    db,
    logger,
    {
      getBoundRunner: (sessionId, ownerUserId) => sessionService.getBoundRunner(sessionId, ownerUserId),
      bindRunnerIfUnset: (sessionId, runnerId, ownerUserId) =>
        sessionService.bindRunnerIfUnset(sessionId, runnerId, ownerUserId),
    },
  );
  await runnerDispatchService.initialize();
  const runnerPackageService = new RunnerPackageService(runnerRegistrationService, {
    templateDir: env.runnerPackageTemplateDir,
    tempDir: resolve(process.cwd(), 'temp', 'runner-packages'),
  });
  const projectService = new ProjectService(db, runnerRegistryService);
  const runnerDirectoryService = new RunnerDirectoryService(runnerDispatchService, runnerRegistryService);
  const remoteRunner = new RemoteRunner(runnerDispatchService);
  const coreSessionStore = new DbSessionStore(db);
  const coreCheckpointStore = new DbCheckpointStore(db);
  const coreReplayStore = new DbReplayStore(db);
  const recoveredCoreSessions = await coreSessionStore.recoverInterruptedSessions(coreReplayStore);
  if (recoveredCoreSessions > 0) {
    logger.warn('core.runtime.recovered', 'interrupted core runtime sessions were terminalized', {
      attributes: { recoveredCoreSessions },
    });
  }
  const runtimeBundle = createCoreAgentRuntimeBundle({
    cwd: process.cwd(),
    runners: [remoteRunner],
    runnerDispatchService,
    createLlmExecutor: ({ toolRegistry, toolExecutor }) =>
      new ModelBackedLlmStepExecutor(modelAdapterService, {
        toolRegistry,
        toolExecutor,
      }),
    workflowTriageAgent: new ModelBackedWorkflowTriageAgent(modelAdapterService),
    sessionStore: coreSessionStore,
    checkpointStore: coreCheckpointStore,
    replayStore: coreReplayStore,
  });
  const { runtime, toolRegistry, toolExecutor } = runtimeBundle;
  const modelToolRunner = new ModelToolRunner(toolRegistry, toolExecutor);
  const modelChatDriver = new ModelChatDriver(modelAdapterService, modelToolRunner, logger);
  const runtimeTurnEngine = new RuntimeTurnEngine({
    runtime,
    memoryService,
    modelChatDriver,
    logger,
    tracer,
  });
  const taskService = new TaskService(modelService, sessionService, runtime, logger, tracer);
  const compactService = new CompactService(sessionService, new AutoCompactor());
  const specWorkflowService = new SpecWorkflowService(sessionService);
  const chatModeStrategies = new ChatModeStrategyRegistry(specWorkflowService);
  const chatService = new ChatService(
    sessionService,
    modelService,
    runtimeTurnEngine,
    chatModeStrategies,
    runnerRegistryService,
    memoryService,
  );
  const specConversationService = new SpecConversationService(
    chatService,
    sessionService,
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
    runnerPackageService,
    runnerDispatchService,
    taskService,
    compactService,
    specWorkflowService,
    specConversationService,
    chatService,
    authService,
  };
}

export type AppServices = Awaited<ReturnType<typeof createServices>>;
