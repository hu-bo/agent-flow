import { useMemo } from 'react';
import type { ChatMessage } from '../types';
import { ContentRendererRegistry, createDefaultRegistry } from '../registry';

interface MessageBubbleProps {
  message: ChatMessage;
  registry?: ContentRendererRegistry;
}

export function MessageBubble({ message, registry }: MessageBubbleProps) {
  const reg = useMemo(() => registry ?? createDefaultRegistry(), [registry]);

  const isUser = message.role === 'user';
  const isTool = message.role === 'tool';
  const modelInfo = message.metadata?.modelId;

  const bubbleStyle = isUser
    ? 'bg-blue-500 text-white rounded-br-sm'
    : isTool
      ? 'bg-gray-50 border border-gray-200 rounded-lg font-mono text-xs'
      : 'bg-white border border-gray-200 rounded-bl-sm';

  return (
    <div className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] rounded-xl px-3.5 py-2.5 leading-relaxed break-words ${bubbleStyle}`}>
        {message.content.map((part, i) => {
          const Renderer = reg.get(part.type);
          if (Renderer) {
            return <Renderer key={i} part={part} />;
          }
          // Fallback: render as JSON
          return (
            <pre key={i} className="text-xs text-gray-400 whitespace-pre-wrap">
              {JSON.stringify(part, null, 2)}
            </pre>
          );
        })}
        {modelInfo && !isUser && !isTool && (
          <div className="mt-1.5 text-[10px] text-gray-400">{modelInfo}</div>
        )}
      </div>
    </div>
  );
}
