import { useCallback, useEffect, useRef, useState } from 'react';
import type { FileAttachment, ReasoningEffort } from '@agent-flow/chat-ui';
import type { FilePart, UnifiedMessage } from '@agent-flow/core/messages';
import type { ApprovalRequest, SpecDocType } from '@agent-flow/web-contracts';
import {
  cancelChat,
  decideRunnerApproval,
  fetchSession,
  streamChat,
  type SessionRecord,
} from '../api.js';
import {
  createChatEventState,
  reduceChatEvent,
  type ChatEventState,
} from '../chat-event-reducer.js';

export interface SendMessageInput {
  turnId?: string;
  text: string;
  sessionId: string;
  projectId?: string;
  mode?: 'vibe' | 'spec';
  model?: string | number;
  reasoningEffort?: ReasoningEffort;
  attachments?: FileAttachment[];
  optimisticUserMessage?: boolean;
  onSpecDocUpdate?: (event: { docType: SpecDocType; content: string }) => void;
}

export type PendingApprovalRequest = ApprovalRequest;

interface UseChatReturn {
  messages: UnifiedMessage[];
  sessionRecord: SessionRecord | null;
  sendMessage: (input: SendMessageInput) => Promise<void>;
  stopGenerating: () => void;
  pendingApproval: PendingApprovalRequest | null;
  loadSessionMessages: (sessionId: string | null) => Promise<void>;
  refreshSessionMessages: (sessionId: string | null) => Promise<void>;
  isConnecting: boolean;
  isStreaming: boolean;
  usageByMessageId: ChatEventState['usageByMessageId'];
}

export function useChat(): UseChatReturn {
  const [chatState, setChatState] = useState(() => createChatEventState());
  const [sessionRecord, setSessionRecord] = useState<SessionRecord | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamAbortRef = useRef<AbortController | null>(null);
  const activeSessionRef = useRef<string | null>(null);
  const loadSequenceRef = useRef(0);
  const pendingApprovalRef = useRef<ApprovalRequest | null>(null);

  useEffect(() => {
    pendingApprovalRef.current = chatState.pendingApproval;
  }, [chatState.pendingApproval]);

  useEffect(() => () => streamAbortRef.current?.abort(), []);

  const loadSessionMessages = useCallback(async (sessionId: string | null) => {
    if (streamAbortRef.current && activeSessionRef.current === sessionId) return;
    activeSessionRef.current = sessionId;
    loadSequenceRef.current += 1;
    const currentLoad = loadSequenceRef.current;
    streamAbortRef.current?.abort();
    streamAbortRef.current = null;
    setIsStreaming(false);

    if (!sessionId) {
      setChatState(createChatEventState());
      setSessionRecord(null);
      setIsConnecting(false);
      return;
    }

    setIsConnecting(true);
    try {
      const payload = await fetchSession(sessionId);
      if (loadSequenceRef.current !== currentLoad || activeSessionRef.current !== sessionId) return;
      if (streamAbortRef.current) return;
      setChatState(createChatEventState(payload.messages.map(toClientMessage)));
      setSessionRecord(payload.session);
    } finally {
      if (loadSequenceRef.current === currentLoad) setIsConnecting(false);
    }
  }, []);

  const refreshSessionMessages = useCallback(async (sessionId: string | null) => {
    if (!sessionId) {
      setChatState(createChatEventState());
      setSessionRecord(null);
      return;
    }
    const payload = await fetchSession(sessionId);
    if (activeSessionRef.current === sessionId && !streamAbortRef.current) {
      setChatState(createChatEventState(payload.messages.map(toClientMessage)));
      setSessionRecord(payload.session);
    }
  }, []);

  const sendMessage = useCallback(async ({
    turnId: requestedTurnId,
    text,
    sessionId,
    model,
    reasoningEffort,
    attachments,
    optimisticUserMessage = true,
    onSpecDocUpdate,
  }: SendMessageInput) => {
    const userInput = text.trim();
    if (!userInput) return;
    if (streamAbortRef.current) throw new Error('Current response is still streaming');

    activeSessionRef.current = sessionId;
    const turnId = requestedTurnId ?? createMessageId();
    const attachmentParts = createUserAttachments(attachments);
    const userMessage: UnifiedMessage = {
      uuid: turnId,
      parentUuid: null,
      role: 'user',
      type: 'text',
      text: userInput,
      ...(attachmentParts.length > 0 ? { attachments: attachmentParts } : {}),
      timestamp: new Date().toISOString(),
      metadata: { turnId, ...(model ? { modelId: String(model) } : {}) },
    };
    if (optimisticUserMessage) {
      setChatState((state) => ({ ...state, messages: [...state.messages, userMessage], done: false, error: null }));
    }
    setIsStreaming(true);
    setIsConnecting(false);
    const controller = new AbortController();
    streamAbortRef.current = controller;

    try {
      await streamChat({
        turnId,
        message: userInput,
        modelId: model,
        reasoningEffort,
        sessionId,
        attachments: attachmentParts.length ? attachmentParts : undefined,
        signal: controller.signal,
        onEvent: (event) => {
          if (activeSessionRef.current !== sessionId) return;
          setChatState((state) => reduceChatEvent(state, event));
          if (event.type === 'spec.document') {
            onSpecDocUpdate?.({ docType: event.docType, content: event.content });
          }
        },
      });
    } catch (error) {
      if (!controller.signal.aborted && !isAbortError(error)) throw error;
    } finally {
      if (streamAbortRef.current === controller) streamAbortRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  const stopGenerating = useCallback(() => {
    const controller = streamAbortRef.current;
    const sessionId = activeSessionRef.current;
    if (!controller || !sessionId) return;
    const approval = pendingApprovalRef.current;
    const stop = async () => {
      if (approval) {
        await decideRunnerApproval(approval.requestId, 'deny').catch(() => undefined);
      }
      controller.abort();
      if (streamAbortRef.current === controller) streamAbortRef.current = null;
      setIsStreaming(false);
      await cancelChat(sessionId).catch(() => undefined);
    };
    void stop();
  }, []);

  return {
    messages: chatState.messages,
    sessionRecord,
    sendMessage,
    stopGenerating,
    pendingApproval: chatState.pendingApproval,
    loadSessionMessages,
    refreshSessionMessages,
    isConnecting,
    isStreaming,
    usageByMessageId: chatState.usageByMessageId,
  };
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

function createUserAttachments(attachments?: FileAttachment[]): FilePart[] {
  return (attachments ?? []).map(attachmentToFilePart).filter((part): part is FilePart => part !== null);
}

function attachmentToFilePart(attachment: FileAttachment): FilePart | null {
  if (!attachment.url) return null;
  const matched = /^data:(.*?);base64,(.*)$/i.exec(attachment.url);
  if (!matched) return null;
  return { type: 'file', mimeType: matched[1] || attachment.type || 'application/octet-stream', data: matched[2] };
}

function toClientMessage(message: UnifiedMessage): UnifiedMessage {
  const metadata = message.metadata ?? {};
  return {
    ...message,
    metadata: {
      ...(metadata.modelId !== undefined ? { modelId: metadata.modelId } : {}),
      ...(metadata.turnId !== undefined ? { turnId: metadata.turnId } : {}),
      ...(metadata.model !== undefined ? { model: metadata.model } : {}),
      ...(metadata.provider !== undefined ? { provider: metadata.provider } : {}),
      ...(metadata.isMeta !== undefined ? { isMeta: metadata.isMeta } : {}),
      ...(metadata.toolDuration !== undefined ? { toolDuration: metadata.toolDuration } : {}),
      ...(metadata.compactBoundary !== undefined ? { compactBoundary: metadata.compactBoundary } : {}),
      ...(metadata.tokenUsage !== undefined ? { tokenUsage: metadata.tokenUsage } : {}),
    },
  };
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}
