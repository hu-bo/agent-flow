import './MessageList.less';
import { useRef, useEffect } from 'react';
import type { ChatMessage } from '../../types';
import type { ContentRendererContext, ContentRendererRegistry } from '../../registry';
import { MessageBubble } from '../MessageBubble/MessageBubble';

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming?: boolean;
  registry?: ContentRendererRegistry;
  rendererContext?: ContentRendererContext;
  onRetryMessage?: (message: ChatMessage) => void | Promise<void>;
  onCopyMessage?: (message: ChatMessage) => void | Promise<void>;
  onDeleteMessage?: (message: ChatMessage) => void | Promise<void>;
  messageActionDisabled?: boolean;
}

export function MessageList({
  messages,
  isStreaming,
  registry,
  rendererContext,
  onRetryMessage,
  onCopyMessage,
  onDeleteMessage,
  messageActionDisabled,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-ui-list">
      {messages.length === 0 && (
        <div className="chat-ui-empty">
          Send a message to start chatting.
        </div>
      )}
      {messages.map((msg, index) => (
        <MessageBubble
          key={msg.uuid}
          message={msg}
          isStreaming={Boolean(isStreaming)}
          isLatest={index === messages.length - 1}
          registry={registry}
          rendererContext={rendererContext}
          onRetry={onRetryMessage}
          onCopy={onCopyMessage}
          onDelete={onDeleteMessage}
          actionDisabled={messageActionDisabled}
        />
      ))}
      {isStreaming && (
        <div className="chat-ui-streaming" aria-live="polite">
          <span className="chat-ui-stream-dot" />
          <span className="chat-ui-stream-dot [animation-delay:0.2s]" />
          <span className="chat-ui-stream-dot [animation-delay:0.4s]" />
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
