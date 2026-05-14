import type { AuthService } from './auth-service.js';
import type { ChatService } from './chat-service.js';
import type { CompactService } from './compact-service.js';
import type { ModelAdminService } from './model-admin-service.js';
import type { ModelAdapterService } from './model-adapter-service.js';
import type { ModelService } from './model-service.js';
import type { ProjectService } from './project-service.js';
import type { RunnerDirectoryService } from './runner-directory-service.js';
import type { RunnerRegistrationService } from './runner-registration-service.js';
import type { RunnerRegistryService } from './runner-registry-service.js';
import type { RunnerDispatchService } from './runner-dispatch-service.js';
import type { RunnerApprovalService } from './runner-approval-service.js';
import type { SessionService } from './session-service.js';
import type { SpecWorkflowService } from './spec-workflow-service.js';
import type { TaskService } from './task-service.js';

export interface AppServices {
  modelService: ModelService;
  modelAdapterService: ModelAdapterService;
  modelAdminService: ModelAdminService;
  projectService: ProjectService;
  sessionService: SessionService;
  runnerRegistrationService: RunnerRegistrationService;
  runnerRegistryService: RunnerRegistryService;
  runnerApprovalService: RunnerApprovalService;
  runnerDirectoryService: RunnerDirectoryService;
  runnerDispatchService: RunnerDispatchService;
  taskService: TaskService;
  compactService: CompactService;
  specWorkflowService: SpecWorkflowService;
  chatService: ChatService;
  authService: AuthService;
}
