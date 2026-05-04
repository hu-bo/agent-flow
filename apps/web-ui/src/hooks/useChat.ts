import { useState, useEffect, useRef, useCallback } from 'react';
import type { FileAttachment, ReasoningEffort } from '@agent-flow/chat-ui';
import type { ContentPart, FilePart, UnifiedMessage } from '@agent-flow/core/messages';
import {
  fetchSession,
  streamChat,
  type ApprovalRequiredPayload,
  type ChatStreamEvent,
} from '../api.js';

interface SendMessageInput {
  text: string;
  sessionId: string;
  model?: string | number;
  reasoningEffort?: ReasoningEffort;
  approveRiskyOps?: boolean;
  approvalTicket?: string;
  attachments?: FileAttachment[];
  optimisticUserMessage?: boolean;
}

export interface PendingApprovalRequest {
  approval: ApprovalRequiredPayload;
  pendingInput: Omit<SendMessageInput, 'approvalTicket' | 'approveRiskyOps' | 'optimisticUserMessage'>;
}

interface UseChatReturn {
  messages: UnifiedMessage[];
  sendMessage: (input: SendMessageInput) => Promise<void>;
  approvePendingRequest: (approvalTicket: string) => Promise<void>;
  dismissPendingApproval: () => void;
  pendingApproval: PendingApprovalRequest | null;
  loadSessionMessages: (sessionId: string | null) => Promise<void>;
  refreshSessionMessages: (sessionId: string | null) => Promise<void>;
  isConnecting: boolean;
  isStreaming: boolean;
  typingMessageId: string | null;
}

function createMessageId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
  }
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  }
  return Math.random().toString(16).slice(2, 18).padEnd(16, '0');
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

function upsertMessage(messages: UnifiedMessage[], message: UnifiedMessage): UnifiedMessage[] {
  const index = messages.findIndex((candidate) => candidate.uuid === message.uuid);
  if (index < 0) {
    return [...messages, message];
  }
  const next = [...messages];
  next[index] = message;
  return next;
}

function upsertMessageDelta(
  messages: UnifiedMessage[],
  deltaEvent: Extract<ChatStreamEvent, { type: 'message_delta' }>,
): UnifiedMessage[] {
  const index = messages.findIndex((candidate) => candidate.uuid === deltaEvent.messageId);
  if (index < 0) {
    return [
      ...messages,
      {
        uuid: deltaEvent.messageId,
        parentUuid: null,
        role: 'assistant',
        content: [{ type: 'text', text: deltaEvent.delta }],
        timestamp: new Date().toISOString(),
        metadata: {},
      },
    ];
  }

  const target = messages[index];
  const currentText = target.content
    .filter((part): part is Extract<ContentPart, { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('');

  const next: UnifiedMessage = {
    ...target,
    role: 'assistant',
    timestamp: new Date().toISOString(),
    content: [{ type: 'text', text: `${currentText}${deltaEvent.delta}` }],
  };
  const cloned = [...messages];
  cloned[index] = next;
  return cloned;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [pendingApproval, setPendingApproval] = useState<PendingApprovalRequest | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const streamAbortRef = useRef<AbortController | null>(null);
  const activeSessionRef = useRef<string | null>(null);
  const loadSequenceRef = useRef(0);
  const pendingApprovalRef = useRef<PendingApprovalRequest | null>(null);

  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort();
    };
  }, []);

  const commitPendingApproval = useCallback((value: PendingApprovalRequest | null) => {
    pendingApprovalRef.current = value;
    setPendingApproval(value);
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
      commitPendingApproval(null);
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
      commitPendingApproval(null);
      return;
    }

    const payload = await fetchSession(sessionId);
    if (activeSessionRef.current === sessionId && !streamAbortRef.current) {
      setMessages(payload.messages);
      setTypingMessageId(null);
    }
  }, [commitPendingApproval]);

  const streamTurn = useCallback(
    async (
      {
        text,
        sessionId,
        model,
        reasoningEffort,
        approveRiskyOps,
        approvalTicket,
        attachments,
        optimisticUserMessage = true,
      }: SendMessageInput,
    ) => {
      const userInput = text.trim();
      if (!userInput) return;
      if (streamAbortRef.current) {
        throw new Error('Current response is still streaming');
      }

      activeSessionRef.current = sessionId;
      const userMsg: UnifiedMessage = {
        uuid: createMessageId(),
        parentUuid: null,
        role: 'user',
        content: createUserContent(userInput, attachments),
        timestamp: new Date().toISOString(),
        metadata: model ? { modelId: String(model) } : {},
      };

      if (optimisticUserMessage) {
        setMessages((prev) => [...prev, userMsg]);
      }
      commitPendingApproval(null);
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
          onEvent: (event) => {
            if (activeSessionRef.current !== sessionId) return;

            if (event.type === 'approval_required') {
              commitPendingApproval({
                approval: event.approval,
                pendingInput: {
                  text: userInput,
                  sessionId,
                  model,
                  reasoningEffort,
                  attachments,
                },
              });
              setTypingMessageId(null);
              return;
            }

            if (event.type === 'message_delta') {
              setMessages((prev) => upsertMessageDelta(prev, event));
              setTypingMessageId(event.messageId);
              return;
            }

            const msg = event.message;
            // Server stream includes the user message; skip it to avoid duplicates.
            if (msg.role === 'user') return;
            setMessages((prev) => upsertMessage(prev, msg));
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
    [commitPendingApproval],
  );

  const sendMessage = useCallback(
    async (input: SendMessageInput) => {
      await streamTurn({
        ...input,
        optimisticUserMessage: input.optimisticUserMessage ?? true,
      });
    },
    [streamTurn],
  );

  const approvePendingRequest = useCallback(
    async (approvalTicket: string) => {
      const pending = pendingApprovalRef.current;
      if (!pending) {
        throw new Error('No pending approval request');
      }
      commitPendingApproval(null);
      await streamTurn({
        ...pending.pendingInput,
        approvalTicket,
        optimisticUserMessage: false,
      });
    },
    [commitPendingApproval, streamTurn],
  );

  const dismissPendingApproval = useCallback(() => {
    commitPendingApproval(null);
  }, [commitPendingApproval]);

  return {
    messages,
    sendMessage,
    approvePendingRequest,
    dismissPendingApproval,
    pendingApproval,
    loadSessionMessages,
    refreshSessionMessages,
    isConnecting,
    isStreaming,
    typingMessageId,
  };
}
