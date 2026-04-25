import type { AppEnv } from '../config/env.js';
import { ChatService } from './chat-service.js';
import { CompactService } from './compact-service.js';
import { ModelService } from './model-service.js';
import { MockRuntimeGateway } from './runtime-gateway.js';
import { SessionService } from './session-service.js';
import { TaskService } from './task-service.js';

export function createServices(env: AppEnv) {
  const modelService = new ModelService(env.defaultModel);
  const sessionService = new SessionService(process.cwd());
  const runtimeGateway = new MockRuntimeGateway();
  const taskService = new TaskService(modelService, sessionService);
  const compactService = new CompactService(sessionService);
  const chatService = new ChatService(sessionService, modelService, runtimeGateway);

  return {
    modelService,
    sessionService,
    taskService,
    compactService,
    chatService,
  };
}
