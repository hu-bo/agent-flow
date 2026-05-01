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
} from '@agent-flow/core/messages';
import type { ReactNode } from 'react';

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

export type ThoughtChainItemStatus = 'pending' | 'running' | 'success' | 'error';

export interface ThoughtChainItem {
  key: string;
  title?: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
  footer?: ReactNode;
  extra?: ReactNode;
  icon?: ReactNode;
  status?: ThoughtChainItemStatus;
  durationMs?: number;
  collapsible?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface ThinkingPart {
  type: 'thinking';
  text: string;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
  status?: ThoughtChainItemStatus;
  durationMs?: number;
  defaultOpen?: boolean;
  items?: ThoughtChainItem[];
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

export type ReasoningEffort = 'low' | 'medium' | 'high';

export interface ChatOption {
  value: string;
  label: string;
  provider?: string;
  maxInputTokens?: number;
}

export interface TokenUsageSummary {
  usedTokens: number;
  remainingTokens: number | null;
  tokenBudget: number | null;
}

