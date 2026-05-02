import './MessageBubble.less';
import { useMemo } from 'react';
import type { ChatMessage } from '../../types';
import {
  ContentRendererRegistry,
  createDefaultRegistry,
  type ContentRendererContext,
} from '../../registry';

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
  isLatest?: boolean;
  registry?: ContentRendererRegistry;
  rendererContext?: ContentRendererContext;
  onRetry?: (message: ChatMessage) => void | Promise<void>;
  onCopy?: (message: ChatMessage) => void | Promise<void>;
  onDelete?: (message: ChatMessage) => void | Promise<void>;
  actionDisabled?: boolean;
}

export function MessageBubble({
  message,
  isStreaming,
  isLatest,
  registry,
  rendererContext,
  onRetry,
  onCopy,
  onDelete,
  actionDisabled,
}: MessageBubbleProps) {
  const reg = useMemo(() => registry ?? createDefaultRegistry(), [registry]);

  const mergedRendererContext = useMemo<ContentRendererContext>(
    () => ({
      ...(rendererContext ?? {}),
      chatUiIsStreaming: Boolean(isStreaming),
      chatUiIsLatest: Boolean(isLatest),
    }),
    [isLatest, isStreaming, rendererContext],
  );

  const isUser = message.role === 'user';
  const isTool = message.role === 'tool';
  const roleClass = isUser ? 'is-user' : isTool ? 'is-tool' : 'is-assistant';
  const showActions = !isUser && !isTool && Boolean(onRetry || onCopy || onDelete);

  return (
    <div className={`chat-ui-message-row ${roleClass}`}>
      <div className={`chat-ui-bubble ${roleClass}`}>
        {message.content.map((part, i) => {
          const Renderer = reg.get(part.type);
          if (Renderer) {
            return (
              <Renderer
                key={i}
                part={part}
                message={message}
                index={i}
                context={mergedRendererContext}
              />
            );
          }
          // Fallback: render as JSON
          return (
            <pre key={i} className="chat-ui-fallback-pre">
              {JSON.stringify(part, null, 2)}
            </pre>
          );
        })}
        {showActions && (
          <div className="chat-ui-message-actions" role="group" aria-label="Message actions">
            {onRetry && (
              <button
                type="button"
                className="chat-ui-action-btn"
                onClick={() => {
                  void onRetry(message);
                }}
                disabled={actionDisabled}
              >
                Retry
              </button>
            )}
            {onCopy && (
              <button
                type="button"
                className="chat-ui-action-btn"
                onClick={() => {
                  void onCopy(message);
                }}
                disabled={actionDisabled}
              >
                Copy
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="chat-ui-action-btn danger"
                onClick={() => {
                  void onDelete(message);
                }}
                disabled={actionDisabled}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
