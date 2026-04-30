import './ChatPanel.less';
import type {
  ChatMessage,
  ChatModelOption,
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
  selectedModel?: string;
  modelOptions?: ChatModelOption[];
  onModelChange?: (modelId: string) => void;
  reasoningEffort?: ReasoningEffort;
  onReasoningEffortChange?: (effort: ReasoningEffort) => void;
  tokenUsage?: TokenUsageSummary;
  isStreaming?: boolean;
  isConnecting?: boolean;
  theme?: 'light' | 'dark';
  registry?: ContentRendererRegistry;
  rendererContext?: ContentRendererContext;
  onFileSelect?: (files: File[]) => Promise<FileAttachment[]>;
  className?: string;
}

export function ChatPanel({
  messages,
  onSend,
  selectedModel,
  modelOptions,
  onModelChange,
  reasoningEffort = 'medium',
  onReasoningEffortChange,
  tokenUsage,
  isStreaming,
  isConnecting,
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
      />
      <InputArea
        onSend={onSend}
        selectedModel={selectedModel}
        modelOptions={modelOptions}
        onModelChange={onModelChange}
        reasoningEffort={reasoningEffort}
        onReasoningEffortChange={onReasoningEffortChange}
        tokenUsage={tokenUsage}
        isStreaming={isStreaming}
        isConnecting={isConnecting}
        onFileSelect={onFileSelect}
      />
    </div>
  );
}
