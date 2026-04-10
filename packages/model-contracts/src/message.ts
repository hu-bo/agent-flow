/** Content block types */
export type ContentPart =
  | TextPart
  | ImagePart
  | ToolCallPart
  | ToolResultPart
  | FilePart;

export interface TextPart {
  type: 'text';
  text: string;
}

export interface ImagePart {
  type: 'image';
  source: ImageSource;
}

export type ImageSource =
  | { type: 'base64'; mediaType: string; data: string }
  | { type: 'url'; url: string };

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

export interface FilePart {
  type: 'file';
  mimeType: string;
  data: string;
}

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

/** Unified message format — model-agnostic internal representation */
export interface UnifiedMessage {
  uuid: string;
  parentUuid: string | null;
  role: MessageRole;
  content: ContentPart[];
  timestamp: string;
  metadata: MessageMetadata;
}

export interface MessageMetadata {
  modelId?: string;
  provider?: string;
  tokenUsage?: TokenUsage;
  isMeta?: boolean;
  compactBoundary?: CompactBoundaryInfo;
  toolDuration?: number;
  extensions?: Record<string, unknown>;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
}

export interface CompactBoundaryInfo {
  trigger: 'auto' | 'manual' | 'model-switch';
  preCompactTokenCount: number;
  postCompactTokenCount: number;
  summarizedMessageCount: number;
  lastPreCompactMessageUuid: string;
}

/** Serialized message for JSONL persistence */
export interface SerializedMessage extends UnifiedMessage {
  sessionId: string;
  cwd: string;
  version: string;
  gitBranch?: string;
}
