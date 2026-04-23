import type { TokenUsage } from '../messages/index.js';

export interface ToolExecutionState {
  currentTool: { toolName: string; toolCallId: string; input: unknown } | null;
  pendingResults: unknown[];
}

export interface FileHistoryEntry {
  path: string;
  action: 'create' | 'edit' | 'delete';
  timestamp: string;
}

export interface TodoItem {
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface Checkpoint {
  checkpointId: string;
  sessionId: string;
  timestamp: string;
  version: number;

  messagesRef: string;
  lastMessageUuid: string;
  modelId: string;

  currentStepIndex: number;
  toolExecutionState: ToolExecutionState;
  totalUsage: TokenUsage;

  cwd: string;
  fileHistory: FileHistoryEntry[];
  todos: TodoItem[];
  envSnapshot: Record<string, string>;
}

