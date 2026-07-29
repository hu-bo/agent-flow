import { useState, useEffect, useRef, useCallback } from 'react';
import type { FileAttachment, ReasoningEffort } from '@agent-flow/chat-ui';
import type { ContentPart, FilePart, TokenUsage, UnifiedMessage } from '@agent-flow/core/messages';
import {
  cancelChat,
  fetchSession,
  streamChat,
  type SessionRecord,
  type ApprovalReqPayload,
  type SpecDocType,
  type StreamDoc,
} from '../api.js';

interface SendMessageInput {
  text: string;
  sessionId: string;
  projectId?: string;
  mode?: 'vibe' | 'spec';
  model?: string | number;
  reasoningEffort?: ReasoningEffort;
  approveRiskyOps?: boolean;
  approvalTicket?: string;
  attachments?: FileAttachment[];
  optimisticUserMessage?: boolean;
  onSpecDocUpdate?: (event: { doc_type: SpecDocType; content: string }) => void;
}

export interface PendingApprovalRequest {
  approval: ApprovalReqPayload;
  pendingInput: Omit<SendMessageInput, 'approvalTicket' | 'approveRiskyOps' | 'optimisticUserMessage'>;
}

interface UseChatReturn {
  messages: UnifiedMessage[];
  sessionRecord: SessionRecord | null;
  sendMessage: (input: SendMessageInput) => Promise<void>;
  stopGenerating: () => void;
  approvePendingRequest: (approvalTicket: string) => Promise<void>;
  dismissPendingApproval: () => void;
  pendingApproval: PendingApprovalRequest | null;
  loadSessionMessages: (sessionId: string | null) => Promise<void>;
  refreshSessionMessages: (sessionId: string | null) => Promise<void>;
  isConnecting: boolean;
  isStreaming: boolean;
  typingMessageId: string | null;
  usageByMessageId: Record<string, TokenUsage>;
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

function toClientMessage(message: UnifiedMessage): UnifiedMessage {
  const metadata = message.metadata ?? {};
  const nextMetadata: UnifiedMessage['metadata'] = {};

  if (metadata.modelId !== undefined) nextMetadata.modelId = metadata.modelId;
  if (metadata.model !== undefined) nextMetadata.model = metadata.model;
  if (metadata.provider !== undefined) nextMetadata.provider = metadata.provider;
  if (metadata.isMeta !== undefined) nextMetadata.isMeta = metadata.isMeta;
  if (metadata.toolDuration !== undefined) nextMetadata.toolDuration = metadata.toolDuration;
  if (metadata.compactBoundary !== undefined) nextMetadata.compactBoundary = metadata.compactBoundary;

  return {
    ...message,
    content: [...message.content],
    metadata: nextMetadata,
  };
}

function extractUsageByMessageId(messages: UnifiedMessage[]): Record<string, TokenUsage> {
  return messages.reduce<Record<string, TokenUsage>>((usageByMessageId, message) => {
    const usage = message.metadata?.tokenUsage;
    if (usage) {
      usageByMessageId[message.uuid] = usage;
    }
    return usageByMessageId;
  }, {});
}

function mergeStreamDoc(messages: UnifiedMessage[], doc: StreamDoc): UnifiedMessage[] {
  if (!doc.order.length) return messages;

  const indexById = new Map(messages.map((message, index) => [message.uuid, index]));
  let next = messages;
  let cloned = false;

  for (const msgId of doc.order) {
    const message = doc.messages[msgId];
    if (!message) continue;

    const existingIndex = indexById.get(msgId);
    if (existingIndex == null) {
      if (!cloned) {
        next = [...next];
        cloned = true;
      }
      next.push(message);
      indexById.set(msgId, next.length - 1);
      continue;
    }

    if (next[existingIndex] !== message) {
      if (!cloned) {
        next = [...next];
        cloned = true;
      }
      next[existingIndex] = message;
    }
  }

  return next;
}

function findLatestAssistantMessageId(doc: StreamDoc): string | null {
  for (let i = doc.order.length - 1; i >= 0; i -= 1) {
    const msgId = doc.order[i];
    const message = doc.messages[msgId];
    if (!message) continue;
    if (message.role === 'assistant') return msgId;
  }
  return null;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [sessionRecord, setSessionRecord] = useState<SessionRecord | null>(null);
  const [pendingApproval, setPendingApproval] = useState<PendingApprovalRequest | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [usageByMessageId, setUsageByMessageId] = useState<Record<string, TokenUsage>>({});
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
    if (streamAbortRef.current && activeSessionRef.current === sessionId) {
      return;
    }

    activeSessionRef.current = sessionId;
    loadSequenceRef.current += 1;
    const currentLoad = loadSequenceRef.current;

    streamAbortRef.current?.abort();
    streamAbortRef.current = null;
    setIsStreaming(false);

    if (!sessionId) {
      setMessages([]);
      setSessionRecord(null);
      setTypingMessageId(null);
      setUsageByMessageId({});
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
      setMessages(payload.messages.map(toClientMessage));
      setSessionRecord(payload.session);
      setTypingMessageId(null);
      setUsageByMessageId(extractUsageByMessageId(payload.messages));
    } finally {
      if (loadSequenceRef.current === currentLoad) {
        setIsConnecting(false);
      }
    }
  }, []);

  const refreshSessionMessages = useCallback(async (sessionId: string | null) => {
    if (!sessionId) {
      setMessages([]);
      setSessionRecord(null);
      setTypingMessageId(null);
      setUsageByMessageId({});
      commitPendingApproval(null);
      return;
    }

    const payload = await fetchSession(sessionId);
    if (activeSessionRef.current === sessionId && !streamAbortRef.current) {
      setMessages(payload.messages.map(toClientMessage));
      setSessionRecord(payload.session);
      setTypingMessageId(null);
      setUsageByMessageId(extractUsageByMessageId(payload.messages));
    }
  }, [commitPendingApproval]);

  const streamTurn = useCallback(
    async (
      {
        text,
        sessionId,
        projectId,
        mode,
        model,
        reasoningEffort,
        approveRiskyOps,
        approvalTicket,
        attachments,
        optimisticUserMessage = true,
        onSpecDocUpdate,
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
      setUsageByMessageId({});

      const controller = new AbortController();
      streamAbortRef.current = controller;

      const attachmentParts = (attachments ?? [])
        .map(attachmentToFilePart)
        .filter((part): part is FilePart => part !== null);

      try {
        let lastSpecDocs: Partial<Record<SpecDocType, string>> = {};

        await streamChat({
          message: userInput,
          model_id: model,
          reasoning_effort: reasoningEffort,
          session_id: sessionId,
          project_id: projectId,
          mode,
          approve_risky_ops: approveRiskyOps,
          approval_ticket: approvalTicket,
          attachments: attachmentParts.length ? attachmentParts : undefined,
          signal: controller.signal,
          onDeltaApplied: (doc) => {
            if (activeSessionRef.current !== sessionId) return;

            if (doc.approval) {
              if (!pendingApprovalRef.current) {
                commitPendingApproval({
                  approval: doc.approval,
                  pendingInput: {
                    text: userInput,
                    sessionId,
                    projectId,
                    mode,
                    model,
                    reasoningEffort,
                    attachments,
                    onSpecDocUpdate,
                  },
                });
              }
              setTypingMessageId(null);
            } else if (pendingApprovalRef.current) {
              commitPendingApproval(null);
            }

            if (onSpecDocUpdate) {
              (Object.keys(doc.spec_docs) as SpecDocType[]).forEach((docType) => {
                const content = doc.spec_docs[docType];
                if (typeof content !== 'string') return;
                if (lastSpecDocs[docType] === content) return;
                lastSpecDocs = { ...lastSpecDocs, [docType]: content };
                onSpecDocUpdate({ doc_type: docType, content });
              });
            }

            setUsageByMessageId(doc.usage_by_msg);
            setMessages((prev) => mergeStreamDoc(prev, doc));
            setTypingMessageId(findLatestAssistantMessageId(doc));
          },
          onUsage: (usage, doc) => {
            if (activeSessionRef.current !== sessionId) return;
            setUsageByMessageId((prev) => ({ ...prev, ...(usage.usage_by_msg ?? {}) }));
            setMessages((prev) => mergeStreamDoc(prev, doc));
          },
        });
      } catch (error) {
        if (controller.signal.aborted || isAbortError(error)) {
          return;
        }
        throw error;
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

  const stopGenerating = useCallback(() => {
    const controller = streamAbortRef.current;
    const sessionId = activeSessionRef.current;
    if (!controller || !sessionId) return;

    controller.abort();
    streamAbortRef.current = null;
    setIsStreaming(false);
    setTypingMessageId(null);
    commitPendingApproval(null);
    void cancelChat(sessionId).catch(() => {
      // Closing the stream already notifies the server; the explicit endpoint is a reliable fallback.
    });
  }, [commitPendingApproval]);

  return {
    messages,
    sessionRecord,
    sendMessage,
    stopGenerating,
    approvePendingRequest,
    dismissPendingApproval,
    pendingApproval,
    loadSessionMessages,
    refreshSessionMessages,
    isConnecting,
    isStreaming,
    typingMessageId,
    usageByMessageId,
  };
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}
