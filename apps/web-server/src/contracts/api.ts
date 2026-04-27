import type { FilePart, UnifiedMessage } from '@agent-flow/core/messages';

export type ReasoningEffort = 'low' | 'medium' | 'high';
export type TaskStatus =
  | 'pending'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';
export type TaskAction = 'pause' | 'resume' | 'cancel' | 'retry';
export type TaskType = 'chat' | 'workflow' | 'compact';
export type TaskEventType =
  | 'task.created'
  | 'task.updated'
  | 'task.log'
  | 'task.completed'
  | 'task.failed'
  | 'task.cancelled';

export interface SessionRecord {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  modelId: string;
  cwd: string;
  messageCount: number;
  systemPrompt?: string;
  latestCheckpointId?: string;
}

export interface SessionState {
  session: SessionRecord;
  messages: UnifiedMessage[];
}

export interface ModelDescriptor {
  modelId: string;
  displayName: string;
  provider: string;
  maxInputTokens: number;
}

export interface TaskRecord {
  taskId: string;
  sessionId: string;
  profileId?: string;
  type: TaskType;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  latestCheckpointId: string;
  retryCount: number;
  maxRetries: number;
  modelId: string;
  prompt: string;
  error?: string;
  outputs?: unknown;
}

export interface TaskEvent {
  eventId: string;
  taskId: string;
  sequence: number;
  type: TaskEventType;
  timestamp: string;
  payload: Record<string, unknown>;
}

export interface RuntimeChatInput {
  session: SessionRecord;
  history: UnifiedMessage[];
  message: string;
  modelId: string;
  requestId: string;
  reasoningEffort?: ReasoningEffort;
  attachments: FilePart[];
}

export interface RuntimeGateway {
  streamChat(input: RuntimeChatInput): AsyncGenerator<UnifiedMessage>;
}

export interface RequestContext {
  requestId: string;
  startedAt: string;
  source: 'browser' | 'server' | 'unknown';
  actorId?: string;
  idempotencyKey?: string;
}
