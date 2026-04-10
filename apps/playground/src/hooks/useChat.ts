import { useState, useEffect, useRef, useCallback } from 'react';
import { createWebSocket } from '../api';
import type { UnifiedMessage, WsServerMessage } from '../types';

interface UseChatReturn {
  messages: UnifiedMessage[];
  sendMessage: (text: string) => void;
  isConnecting: boolean;
  isStreaming: boolean;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState <= WebSocket.OPEN) return;

    setIsConnecting(true);
    const ws = createWebSocket();

    ws.addEventListener('open', () => {
      setIsConnecting(false);
    });

    ws.addEventListener('message', (event) => {
      const msg: WsServerMessage = JSON.parse(event.data);

      switch (msg.type) {
        case 'message':
          setMessages((prev) => [...prev, msg.data]);
          break;

        case 'text-delta':
          // Accumulate text delta into the last assistant message
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'assistant') {
              const updated = { ...last, content: [...last.content] };
              const lastPart = updated.content[updated.content.length - 1];
              if (lastPart && lastPart.type === 'text') {
                updated.content[updated.content.length - 1] = {
                  ...lastPart,
                  text: lastPart.text + msg.textDelta,
                };
              } else {
                updated.content.push({ type: 'text', text: msg.textDelta });
              }
              return [...prev.slice(0, -1), updated];
            }
            // Create a new assistant message for the delta
            const newMsg: UnifiedMessage = {
              uuid: crypto.randomUUID(),
              parentUuid: null,
              role: 'assistant',
              content: [{ type: 'text', text: msg.textDelta }],
              timestamp: new Date().toISOString(),
              metadata: {},
            };
            return [...prev, newMsg];
          });
          break;

        case 'tool-call':
          setMessages((prev) => {
            const toolMsg: UnifiedMessage = {
              uuid: crypto.randomUUID(),
              parentUuid: null,
              role: 'assistant',
              content: [
                {
                  type: 'tool-call',
                  toolCallId: msg.toolCallId,
                  toolName: msg.toolName,
                  input: {},
                },
              ],
              timestamp: new Date().toISOString(),
              metadata: {},
            };
            return [...prev, toolMsg];
          });
          break;

        case 'tool-result':
          setMessages((prev) => {
            const resultMsg: UnifiedMessage = {
              uuid: crypto.randomUUID(),
              parentUuid: null,
              role: 'tool',
              content: [
                {
                  type: 'tool-result',
                  toolCallId: msg.toolCallId,
                  toolName: '',
                  output: msg.output,
                },
              ],
              timestamp: new Date().toISOString(),
              metadata: {},
            };
            return [...prev, resultMsg];
          });
          break;

        case 'done':
          setIsStreaming(false);
          break;

        case 'error':
          setIsStreaming(false);
          console.error('Server error:', msg.error);
          break;
      }
    });

    ws.addEventListener('close', () => {
      setIsConnecting(true);
      wsRef.current = null;
      reconnectTimer.current = setTimeout(connect, 2000);
    });

    ws.addEventListener('error', () => {
      ws.close();
    });

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      // Add user message locally
      const userMsg: UnifiedMessage = {
        uuid: crypto.randomUUID(),
        parentUuid: null,
        role: 'user',
        content: [{ type: 'text', text }],
        timestamp: new Date().toISOString(),
        metadata: {},
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);

      wsRef.current.send(
        JSON.stringify({ type: 'chat', message: text })
      );
    },
    []
  );

  return { messages, sendMessage, isConnecting, isStreaming };
}
