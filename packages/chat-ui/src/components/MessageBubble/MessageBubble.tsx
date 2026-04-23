import './MessageBubble.less';
import { useMemo } from 'react';
import type { ChatMessage } from '../../types';
import { ContentRendererRegistry, createDefaultRegistry } from '../../registry';

interface MessageBubbleProps {
  message: ChatMessage;
  registry?: ContentRendererRegistry;
}

export function MessageBubble({ message, registry }: MessageBubbleProps) {
  const reg = useMemo(() => registry ?? createDefaultRegistry(), [registry]);

  const isUser = message.role === 'user';
  const isTool = message.role === 'tool';
  const modelInfo = message.metadata?.modelId;

  const roleClass = isUser ? 'is-user' : isTool ? 'is-tool' : 'is-assistant';

  return (
    <div className={`chat-ui-message-row ${roleClass}`}>
      <div className={`chat-ui-bubble ${roleClass}`}>
        {message.content.map((part, i) => {
          const Renderer = reg.get(part.type);
          if (Renderer) {
            return <Renderer key={i} part={part} />;
          }
          // Fallback: render as JSON
          return (
            <pre key={i} className="chat-ui-fallback-pre">
              {JSON.stringify(part, null, 2)}
            </pre>
          );
        })}
        {modelInfo && !isUser && !isTool && (
          <div className="chat-ui-model-meta">{modelInfo}</div>
        )}
      </div>
    </div>
  );
}
