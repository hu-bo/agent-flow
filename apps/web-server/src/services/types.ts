import type { ChatService } from './chat-service.js';
import type { CompactService } from './compact-service.js';
import type { ModelService } from './model-service.js';
import type { SessionService } from './session-service.js';
import type { TaskService } from './task-service.js';

export interface AppServices {
  modelService: ModelService;
  sessionService: SessionService;
  taskService: TaskService;
  compactService: CompactService;
  chatService: ChatService;
}
