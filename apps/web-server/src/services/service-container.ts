import type { AppEnv } from '../config/env.js';
import { AutoCompactor } from '@agent-flow/compact';
import { ConsoleEventSink, StructuredLogger, Tracer } from '@agent-flow/events';
import { MemoryService } from '@agent-flow/memory';
import type { AppDataSource } from '../db/data-source.js';
import { ChatService } from './chat-service.js';
import { CompactService } from './compact-service.js';
import { ModelService } from './model-service.js';
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
  await modelService.initialize();
  const sessionService = new SessionService(process.cwd());
  const runtime = createCoreAgentRuntime({
    cwd: process.cwd(),
  });
  const runtimeGateway = new CoreRuntimeGateway({
    runtime,
    memoryService,
    logger,
    tracer,
  });
  const taskService = new TaskService(modelService, sessionService, runtime, logger, tracer);
  const compactService = new CompactService(sessionService, new AutoCompactor());
  const chatService = new ChatService(sessionService, modelService, runtimeGateway, memoryService);

  return {
    modelService,
    sessionService,
    taskService,
    compactService,
    chatService,
  };
}
