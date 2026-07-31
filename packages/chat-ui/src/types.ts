import type {
  TextPart,
  ImagePart,
  ImageSource,
  FilePart,
  MessageRole,
  TextMessage,
  ImageMessage,
  ToolExecutionMessage,
  UnifiedMessage,
  MessageMetadata,
  MessageStatus,
  ToolExecution,
  TokenUsage,
} from '@agent-flow/core/messages';
import type { ReactNode } from 'react';

// Re-export base types
export type {
  TextPart,
  ImagePart,
  ImageSource,
  FilePart,
  MessageRole,
  TextMessage,
  ImageMessage,
  ToolExecutionMessage,
  UnifiedMessage,
  MessageMetadata,
  MessageStatus,
  ToolExecution,
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
  /**
   * Optional fine-grained control over which thought-chain items should be expanded by default.
   * When provided, it takes precedence over `defaultOpen`.
   */
  defaultExpandedKeys?: string[];
  items?: ThoughtChainItem[];
}

export interface CodeDiffPart {
  type: 'code-diff';
  language: string;
  filename?: string;
  oldCode: string;
  newCode: string;
}

export type ToolExecutionPart = ToolExecutionMessage;

/** All content parts the chat-ui understands */
export type ChatContentPart = TextPart | ImagePart | FilePart | ThinkingPart | ToolExecutionPart | CodeDiffPart;

/** Chat message with extended content types */
export type ChatMessage = UnifiedMessage;

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

export interface ChatSuggestion {
  id?: string;
  label: string;
  prompt: string;
  description?: string;
  behavior?: 'fill' | 'send';
}

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

