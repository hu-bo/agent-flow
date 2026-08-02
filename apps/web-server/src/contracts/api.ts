import type { FilePart, UnifiedMessage } from '@agent-flow/core/messages';
import type { AgentEvent } from '@agent-flow/core';
import type {
  ModelDescriptor,
  ProjectRecord,
  ReasoningEffort,
  RunnerDirectoryEntry,
  RunnerPlatformProfile,
  SessionMode,
  SessionRecord,
  SessionState,
  SpecDocType,
  SpecWorkflowPhase,
  SpecWorkflowState,
  TaskAction,
  TaskRecord,
  TaskStatus,
} from '@agent-flow/web-contracts';

export type {
  ModelDescriptor,
  ProjectRecord,
  ReasoningEffort,
  RunnerDirectoryEntry,
  RunnerPlatformProfile,
  SessionMode,
  SessionRecord,
  SessionState,
  SpecDocType,
  SpecWorkflowPhase,
  SpecWorkflowState,
  TaskAction,
  TaskRecord,
  TaskStatus,
};

export type TaskType = 'chat' | 'workflow' | 'compact';
export type TaskEventType =
  | 'task.created'
  | 'task.updated'
  | 'task.log'
  | 'task.completed'
  | 'task.failed'
  | 'task.cancelled';

export interface RunnerRootsResult {
  roots: RunnerDirectoryEntry[];
}

export interface RunnerDirectoryListResult {
  path: string;
  entries: RunnerDirectoryEntry[];
  total: number;
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
  turnId: string;
  reasoningEffort?: ReasoningEffort;
  attachments: FilePart[];
  preferredRunnerId?: string;
  runnerPlatform?: RunnerPlatformProfile;
  /** Cancels model, tool, and runtime work for this chat turn. */
  signal?: AbortSignal;
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

export interface ChatStreamSpecDocUpdateEvent {
  type: 'spec_doc_update';
  msg_id: string;
  doc_type: SpecDocType;
  content: string;
  delta?: string;
  done: boolean;
}

export interface ChatStreamThinkingEvent {
  type: 'thinking';
  msg: UnifiedMessage;
}

export interface ChatStreamRuntimeEvent {
  type: 'runtime_event';
  event: AgentEvent;
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
  | ChatStreamSpecDocUpdateEvent
  | ChatStreamThinkingEvent
  | ChatStreamRuntimeEvent
  | ChatStreamErrorEvent;

export interface RequestContext {
  requestId: string;
  startedAt: string;
  source: 'browser' | 'server' | 'unknown';
  actorId?: string;
  idempotencyKey?: string;
}
