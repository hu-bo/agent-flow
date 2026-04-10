import { useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import type { ContentRendererRegistry } from '../registry';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming?: boolean;
  registry?: ContentRendererRegistry;
}

export function MessageList({ messages, isStreaming, registry }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      {messages.length === 0 && (
        <div className="text-center text-gray-400 mt-[40vh] text-base">
          Send a message to start chatting.
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.uuid} message={msg} registry={registry} />
      ))}
      {isStreaming && (
        <div className="flex gap-1 px-3.5 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-pulse" />
          <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-pulse [animation-delay:0.2s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-pulse [animation-delay:0.4s]" />
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
