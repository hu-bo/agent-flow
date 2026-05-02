import { useState, useEffect, useRef, useCallback } from 'react';
import type { FileAttachment, ReasoningEffort } from '@agent-flow/chat-ui';
import type { ContentPart, FilePart, UnifiedMessage } from '@agent-flow/core/messages';
import { fetchSession, streamChat } from '../api.js';

interface SendMessageInput {
  text: string;
  sessionId: string;
  model?: string | number;
  reasoningEffort?: ReasoningEffort;
  approveRiskyOps?: boolean;
  approvalTicket?: string;
  attachments?: FileAttachment[];
}

interface UseChatReturn {
  messages: UnifiedMessage[];
  sendMessage: (input: SendMessageInput) => Promise<void>;
  loadSessionMessages: (sessionId: string | null) => Promise<void>;
  refreshSessionMessages: (sessionId: string | null) => Promise<void>;
  isConnecting: boolean;
  isStreaming: boolean;
  typingMessageId: string | null;
}

function attachmentToFilePart(attachment: FileAttachment): FilePart | null {
  if (!attachment.url) return null;
  const matched = /^data:(.*?);base64,(.*)$/i.exec(attachment.url);
  if (!matched) return null;
  const [, mimeType, data] = matched;
  return {
    type: 'file',
    mimeType: mimeType || attachment.type || 'application/octet-stream',
    data,
  };
}

function createUserContent(text: string, attachments?: FileAttachment[]): ContentPart[] {
  const content: ContentPart[] = [{ type: 'text', text }];
  const fileParts = (attachments ?? [])
    .map(attachmentToFilePart)
    .filter((part): part is FilePart => part !== null);
  return fileParts.length ? [...content, ...fileParts] : content;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const streamAbortRef = useRef<AbortController | null>(null);
  const activeSessionRef = useRef<string | null>(null);
  const loadSequenceRef = useRef(0);

  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort();
    };
  }, []);

  const loadSessionMessages = useCallback(async (sessionId: string | null) => {
    activeSessionRef.current = sessionId;
    loadSequenceRef.current += 1;
    const currentLoad = loadSequenceRef.current;

    streamAbortRef.current?.abort();
    streamAbortRef.current = null;
    setIsStreaming(false);

    if (!sessionId) {
      setMessages([]);
      setTypingMessageId(null);
      setIsConnecting(false);
      return;
    }

    setIsConnecting(true);
    try {
      const payload = await fetchSession(sessionId);
      if (loadSequenceRef.current !== currentLoad || activeSessionRef.current !== sessionId) {
        return;
      }
      // Avoid overriding optimistic stream state while a response is still in flight.
      if (streamAbortRef.current) return;
      setMessages(payload.messages);
      setTypingMessageId(null);
    } finally {
      if (loadSequenceRef.current === currentLoad) {
        setIsConnecting(false);
      }
    }
  }, []);

  const refreshSessionMessages = useCallback(async (sessionId: string | null) => {
    if (!sessionId) {
      setMessages([]);
      setTypingMessageId(null);
      return;
    }

    const payload = await fetchSession(sessionId);
    if (activeSessionRef.current === sessionId && !streamAbortRef.current) {
      setMessages(payload.messages);
      setTypingMessageId(null);
    }
  }, []);

  const sendMessage = useCallback(
    async ({ text, sessionId, model, reasoningEffort, approveRiskyOps, approvalTicket, attachments }: SendMessageInput) => {
      const userInput = text.trim();
      if (!userInput) return;
      if (streamAbortRef.current) {
        throw new Error('Current response is still streaming');
      }

      activeSessionRef.current = sessionId;
      const userMsg: UnifiedMessage = {
        uuid: crypto.randomUUID(),
        parentUuid: null,
        role: 'user',
        content: createUserContent(userInput, attachments),
        timestamp: new Date().toISOString(),
        metadata: model ? { modelId: String(model) } : {},
      };

      setMessages((prev) => [...prev, userMsg]);
      setTypingMessageId(null);
      setIsStreaming(true);
      setIsConnecting(false);

      const controller = new AbortController();
      streamAbortRef.current = controller;

      const attachmentParts = (attachments ?? [])
        .map(attachmentToFilePart)
        .filter((part): part is FilePart => part !== null);

      try {
        await streamChat({
          message: userInput,
          model,
          reasoningEffort,
          sessionId,
          approveRiskyOps,
          approvalTicket,
          attachments: attachmentParts.length ? attachmentParts : undefined,
          signal: controller.signal,
          onMessage: (msg) => {
            if (activeSessionRef.current !== sessionId) return;
            // Server stream includes the user message; skip it to avoid duplicates.
            if (msg.role === 'user') return;
            setMessages((prev) => [...prev, msg]);
            if (msg.role === 'assistant' && !msg.metadata?.isMeta) {
              setTypingMessageId(msg.uuid);
            }
          },
        });
      } finally {
        if (streamAbortRef.current === controller) {
          streamAbortRef.current = null;
        }
        setIsStreaming(false);
      }
    },
    [],
  );

  return {
    messages,
    sendMessage,
    loadSessionMessages,
    refreshSessionMessages,
    isConnecting,
    isStreaming,
    typingMessageId,
  };
}
