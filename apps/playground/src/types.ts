/** Local type definitions mirroring @agent-flow/model-contracts */

export interface TextPart {
  type: 'text';
  text: string;
}

export interface ToolCallPart {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  input: unknown;
}

export interface ToolResultPart {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  output: unknown;
  isError?: boolean;
}

export type ContentPart = TextPart | ToolCallPart | ToolResultPart;

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface MessageMetadata {
  modelId?: string;
  provider?: string;
  tokenUsage?: TokenUsage;
  isMeta?: boolean;
  toolDuration?: number;
}

export interface UnifiedMessage {
  uuid: string;
  parentUuid: string | null;
  role: MessageRole;
  content: ContentPart[];
  timestamp: string;
  metadata: MessageMetadata;
}

/** WebSocket incoming message types */
export type WsServerMessage =
  | { type: 'message'; data: UnifiedMessage }
  | { type: 'text-delta'; textDelta: string }
  | { type: 'tool-call'; toolName: string; toolCallId: string }
  | { type: 'tool-result'; toolCallId: string; output: unknown }
  | { type: 'done' }
  | { type: 'error'; error: string };
