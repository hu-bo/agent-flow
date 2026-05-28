import './MessageBubble.less';
import { useMemo } from 'react';
import type { ChatMessage } from '../../types';
import {
  ContentRendererRegistry,
  createDefaultRegistry,
  type ContentRendererContext,
} from '../../registry';

function RetryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="chat-ui-action-icon" aria-hidden="true">
      <path
        d="M20 11a8 8 0 1 0-2.34 5.66"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 4v7h-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="chat-ui-action-icon" aria-hidden="true">
      <rect
        x="9"
        y="9"
        width="11"
        height="11"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
  onDelete: _onDelete,
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
  const showActions = !isUser && !isTool && !message.metadata?.isMeta && Boolean(onRetry || onCopy);

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
                aria-label="Retry message"
                title="Retry"
              >
                <RetryIcon />
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
                aria-label="Copy message"
                title="Copy"
              >
                <CopyIcon />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
