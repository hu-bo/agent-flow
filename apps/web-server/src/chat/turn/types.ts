import type { FilePart, UnifiedMessage } from '@agent-flow/core/messages';
import type { ReasoningEffort, SessionRecord } from '../../contracts/api.js';

export interface ChatTurnInput {
  userId: string;
  sessionId?: string;
  projectId?: string;
  mode?: 'vibe' | 'spec';
  specAutoPrompt?: boolean;
  message: string;
  profileId?: string;
  modelId?: number;
  reasoningEffort?: ReasoningEffort;
  attachments?: FilePart[];
  approveRiskyOps?: boolean;
  approvalTicket?: string;
  requestId: string;
}

export interface ChatTurnResult {
  session: SessionRecord;
  messages: UnifiedMessage[];
}

export interface SpecConfirmResult {
  session: SessionRecord;
  messages: UnifiedMessage[];
  workflow: SessionRecord['specWorkflow'];
  progressed: boolean;
}

export interface RetryChatMessageInput {
  userId: string;
  sessionId: string;
  messageId: string;
  modelId?: number;
  reasoningEffort?: ReasoningEffort;
  requestId: string;
}

export interface PreparedTurn {
  session: SessionRecord;
  history: UnifiedMessage[];
  userMessage: UnifiedMessage;
  modelId: number;
  model: string;
  attachments: FilePart[];
}
