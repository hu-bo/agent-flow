import type {
  ContentPart,
  TextPart,
  ImagePart,
  ImageSource,
  ToolCallPart,
  ToolResultPart,
  FilePart,
  MessageRole,
  UnifiedMessage,
  MessageMetadata,
  TokenUsage,
} from '@agent-flow/model-contracts';

// Re-export base types
export type {
  ContentPart,
  TextPart,
  ImagePart,
  ImageSource,
  ToolCallPart,
  ToolResultPart,
  FilePart,
  MessageRole,
  UnifiedMessage,
  MessageMetadata,
  TokenUsage,
};

// --- UI-specific content part types ---

export interface ThinkingPart {
  type: 'thinking';
  text: string;
  durationMs?: number;
}

export interface CodeDiffPart {
  type: 'code-diff';
  language: string;
  filename?: string;
  oldCode: string;
  newCode: string;
}

/** All content parts the chat-ui understands */
export type ChatContentPart = ContentPart | ThinkingPart | CodeDiffPart;

/** Chat message with extended content types */
export interface ChatMessage extends Omit<UnifiedMessage, 'content'> {
  content: ChatContentPart[];
}

/** File attachment metadata */
export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  previewUrl?: string;
}
