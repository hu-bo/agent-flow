import type { ChatMessage, FileAttachment } from '../types';
import { ContentRendererRegistry } from '../registry';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';

export interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string, attachments?: FileAttachment[]) => void;
  isStreaming?: boolean;
  isConnecting?: boolean;
  registry?: ContentRendererRegistry;
  onFileSelect?: (files: File[]) => Promise<FileAttachment[]>;
  className?: string;
}

export function ChatPanel({
  messages,
  onSend,
  isStreaming,
  isConnecting,
  registry,
  onFileSelect,
  className,
}: ChatPanelProps) {
  return (
    <div className={`flex flex-1 flex-col min-w-0 ${className ?? ''}`}>
      <MessageList messages={messages} isStreaming={isStreaming} registry={registry} />
      <InputArea
        onSend={onSend}
        isStreaming={isStreaming}
        isConnecting={isConnecting}
        onFileSelect={onFileSelect}
      />
    </div>
  );
}
