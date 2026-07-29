import './ChatPanel.less';
import type { ReactNode } from 'react';
import type {
  ChatMessage,
  ChatOption,
  ChatSuggestion,
  FileAttachment,
  ReasoningEffort,
  TokenUsageSummary,
} from '../../types';
import { ContentRendererRegistry, type ContentRendererContext } from '../../registry';
import { MessageList } from '../MessageList/MessageList';
import { InputArea } from '../InputArea/InputArea';

export interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string, attachments?: FileAttachment[]) => void;
  onStop?: () => void;
  onRetryMessage?: (message: ChatMessage) => void | Promise<void>;
  onCopyMessage?: (message: ChatMessage) => void | Promise<void>;
  onDeleteMessage?: (message: ChatMessage) => void | Promise<void>;
  messageActionDisabled?: boolean;
  selectedModel?: string;
  modelOptions?: ChatOption[];
  onModelChange?: (value: string) => void;
  reasoningEffort?: ReasoningEffort;
  onReasoningEffortChange?: (effort: ReasoningEffort) => void;
  tokenUsage?: TokenUsageSummary;
  isStreaming?: boolean;
  isConnecting?: boolean;
  onCompactContext?: () => void | Promise<void>;
  compactContextDisabled?: boolean;
  compactContextLabel?: string;
  suggestions?: ChatSuggestion[];
  onSuggestionSelect?: (suggestion: ChatSuggestion) => void;
  actionPrompt?: ReactNode;
  theme?: 'light' | 'dark';
  registry?: ContentRendererRegistry;
  rendererContext?: ContentRendererContext;
  onFileSelect?: (files: File[]) => Promise<FileAttachment[]>;
  className?: string;
}

export function ChatPanel({
  messages,
  onSend,
  onStop,
  onRetryMessage,
  onCopyMessage,
  onDeleteMessage,
  messageActionDisabled,
  selectedModel,
  modelOptions,
  onModelChange,
  reasoningEffort = 'medium',
  onReasoningEffortChange,
  tokenUsage,
  isStreaming,
  isConnecting,
  onCompactContext,
  compactContextDisabled,
  compactContextLabel,
  suggestions,
  onSuggestionSelect,
  actionPrompt,
  theme = 'light',
  registry,
  rendererContext,
  onFileSelect,
  className,
}: ChatPanelProps) {
  return (
    <div className={`chat-ui-root flex flex-1 min-w-0 flex-col ${className ?? ''}`} data-theme={theme}>
      <MessageList
        messages={messages}
        isStreaming={isStreaming}
        registry={registry}
        rendererContext={rendererContext}
        onRetryMessage={onRetryMessage}
        onCopyMessage={onCopyMessage}
        onDeleteMessage={onDeleteMessage}
        messageActionDisabled={messageActionDisabled}
      />
      {actionPrompt}
      <InputArea
        onSend={onSend}
        onStop={onStop}
        selectedModel={selectedModel}
        modelOptions={modelOptions}
        onModelChange={onModelChange}
        reasoningEffort={reasoningEffort}
        onReasoningEffortChange={onReasoningEffortChange}
        tokenUsage={tokenUsage}
        isStreaming={isStreaming}
        isConnecting={isConnecting}
        onCompactContext={onCompactContext}
        compactContextDisabled={compactContextDisabled}
        compactContextLabel={compactContextLabel}
        onFileSelect={onFileSelect}
        suggestions={suggestions}
        onSuggestionSelect={onSuggestionSelect}
      />
    </div>
  );
}
