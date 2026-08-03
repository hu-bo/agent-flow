import type { FilePart, ImageMessage, ImagePart, ImageSource, MessageMetadata, MessageRole, MessageStatus, TextMessage, TextPart, TokenUsage, ToolExecution, ToolExecutionMessage, UnifiedMessage } from '@agent-flow/core/messages';
export type { FilePart, ImageMessage, ImagePart, ImageSource, MessageMetadata, MessageRole, MessageStatus, TextMessage, TextPart, TokenUsage, ToolExecution, ToolExecutionMessage, UnifiedMessage, };
export type ChatMessage = UnifiedMessage;
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
