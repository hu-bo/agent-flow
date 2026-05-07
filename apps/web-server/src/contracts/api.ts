import type { FilePart, UnifiedMessage } from '@agent-flow/core/messages';
import type { ApprovalRequiredPayload } from '../lib/approval.js';

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
  modelId: number;
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
  modelId: number;
  model: string;
  displayName: string;
  provider: string;
  providerType: string;
  providerModel: string;
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
  modelId: number;
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
  userId: string;
  message: string;
  modelId: number;
  model: string;
  requestId: string;
  reasoningEffort?: ReasoningEffort;
  attachments: FilePart[];
  preferredRunnerId?: string;
  approveRiskyOps?: boolean;
  approvalTicket?: string;
}

export interface ChatStreamMessageEvent {
  type: 'msg';
  msg: UnifiedMessage;
}

export interface ChatStreamMessageDeltaEvent {
  type: 'msg_delta';
  msg_id: string;
  delta: string;
}

export type ApprovalRiskLevel = ApprovalRequiredPayload['risk'];
export type ChatStreamApprovalPayload = ApprovalRequiredPayload;

export interface ChatStreamApprovalRequiredEvent {
  type: 'approval_req';
  approval: ChatStreamApprovalPayload;
}

export interface ChatStreamErrorEvent {
  type: 'error';
  err: {
    code: string;
    msg: string;
    details?: unknown;
  };
}

export type ChatStreamEvent =
  | ChatStreamMessageEvent
  | ChatStreamMessageDeltaEvent
  | ChatStreamApprovalRequiredEvent
  | ChatStreamErrorEvent;

export interface RuntimeGateway {
  streamChat(input: RuntimeChatInput): AsyncGenerator<ChatStreamEvent>;
}

export interface RequestContext {
  requestId: string;
  startedAt: string;
  source: 'browser' | 'server' | 'unknown';
  actorId?: string;
  idempotencyKey?: string;
}
