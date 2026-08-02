import type { ReactNode } from 'react';
import type { ChatMessage, FileAttachment } from '../../types';
import { cn } from '../../lib/utils';
import { MessageList } from '../MessageList/MessageList';
import { Composer, type ComposerConfig } from '../Composer/Composer';

export interface ChatPanelActions {
  onSend: (text: string, attachments?: FileAttachment[]) => void;
  onStop?: () => void;
  onRetryMessage?: (message: ChatMessage) => void | Promise<void>;
  onCopyMessage?: (message: ChatMessage) => void | Promise<void>;
  onDeleteMessage?: (message: ChatMessage) => void | Promise<void>;
  messageActionDisabled?: boolean;
}

export interface ChatPanelProps {
  messages: ChatMessage[];
  status?: 'idle' | 'connecting' | 'streaming';
  composer?: ComposerConfig;
  actions: ChatPanelActions;
  actionPrompt?: ReactNode;
  theme?: 'light' | 'dark';
  className?: string;
}

export function ChatPanel({ messages, status = 'idle', composer = {}, actions, actionPrompt, theme = 'light', className }: ChatPanelProps) {
  return (
    <div className={cn('chat-v2-root', className)} data-theme={theme}>
      <MessageList messages={messages} onRetryMessage={actions.onRetryMessage} onCopyMessage={actions.onCopyMessage} onDeleteMessage={actions.onDeleteMessage} messageActionDisabled={actions.messageActionDisabled} />
      {actionPrompt}
      <Composer {...composer} status={status} onSend={actions.onSend} onStop={actions.onStop} />
    </div>
  );
}
