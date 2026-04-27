import { useCallback, useEffect, useState } from 'react';
import { ChatPanel } from '@agent-flow/chat-ui';
import type {
  ChatMessage,
  ChatModelOption,
  FileAttachment,
  ReasoningEffort,
  TokenUsageSummary,
} from '@agent-flow/chat-ui';

import { fetchModels, switchModel, triggerCompact } from '../api';
import { useChat } from '../hooks/useChat';
import { useChatStore } from '../store/chat-store';
import './pages.less';

type NoticeState = { kind: 'success' | 'error'; message: string } | null;

function readErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function buildTokenUsage(messages: ChatMessage[], tokenBudget: number | null): TokenUsageSummary {
  const usedTokens = messages.reduce((sum, message) => {
    return sum + (message.metadata?.tokenUsage?.totalTokens ?? 0);
  }, 0);
  const remainingTokens = tokenBudget === null ? null : Math.max(0, tokenBudget - usedTokens);
  return { usedTokens, remainingTokens, tokenBudget };
}

export function ChatPage() {
  const {
    messages,
    sendMessage,
    loadSessionMessages,
    refreshSessionMessages,
    isConnecting,
    isStreaming,
  } = useChat();
  const activeSession = useChatStore((state) => state.activeSessionId);
  const [modelOptions, setModelOptions] = useState<ChatModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [reasoningEffort, setReasoningEffort] = useState<ReasoningEffort>('medium');
  const [notice, setNotice] = useState<NoticeState>(null);
  const statusLabel = isConnecting ? 'LOADING_SESSION' : isStreaming ? 'STREAMING' : 'READY';

  useEffect(() => {
    async function syncSessionMessages() {
      try {
        await loadSessionMessages(activeSession);
      } catch (error: unknown) {
        setNotice({
          kind: 'error',
          message: readErrorMessage(error, 'Failed to load session'),
        });
      }
    }

    syncSessionMessages();
  }, [activeSession, loadSessionMessages]);

  useEffect(() => {
    async function syncModels() {
      try {
        const payload = await fetchModels();
        const options = payload.models.map((model) => ({
          modelId: model.modelId,
          label: model.displayName,
          provider: model.provider,
          maxInputTokens: model.maxInputTokens,
        }));
        setModelOptions(options);
        // Keep user choice when route switches unless selected model is missing.
        if (!selectedModel || !options.some((option) => option.modelId === selectedModel)) {
          setSelectedModel(payload.currentModel);
        }
      } catch (error: unknown) {
        setNotice({
          kind: 'error',
          message: readErrorMessage(error, 'Failed to load models'),
        });
      }
    }

    syncModels();
  }, [selectedModel]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => {
      setNotice(null);
    }, 3600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const handleFileSelect = useCallback(async (files: File[]): Promise<FileAttachment[]> => {
    const prepared = await Promise.all(
      files.map(async (file) => {
        const dataUrl = await fileToDataUrl(file);
        return {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          url: dataUrl,
          previewUrl: file.type.startsWith('image/') ? dataUrl : undefined,
        } satisfies FileAttachment;
      }),
    );
    return prepared;
  }, []);

  const handleModelChange = useCallback(
    async (modelId: string) => {
      try {
        await switchModel(modelId);
        setSelectedModel(modelId);
      } catch (error: unknown) {
        setNotice({
          kind: 'error',
          message: readErrorMessage(error, 'Failed to switch model'),
        });
      }
    },
    [],
  );

  const handleSend = useCallback(
    async (text: string, attachments?: FileAttachment[]) => {
      if (!activeSession) {
        setNotice({
          kind: 'error',
          message: 'Please create or select a session first.',
        });
        return;
      }

      try {
        await sendMessage({
          text,
          sessionId: activeSession,
          model: selectedModel || undefined,
          reasoningEffort,
          attachments,
        });
      } catch (error: unknown) {
        setNotice({
          kind: 'error',
          message: readErrorMessage(error, 'Failed to send message'),
        });
      }
    },
    [activeSession, reasoningEffort, selectedModel, sendMessage],
  );

  const handleCompact = useCallback(async () => {
    if (!activeSession) {
      setNotice({
        kind: 'error',
        message: 'Select a session before compacting context.',
      });
      return;
    }

    try {
      await triggerCompact(activeSession);
      await refreshSessionMessages(activeSession);
      setNotice({
        kind: 'success',
        message: 'Context compaction completed.',
      });
    } catch (error: unknown) {
      setNotice({
        kind: 'error',
        message: readErrorMessage(error, 'Failed to compact session context'),
      });
    }
  }, [activeSession, refreshSessionMessages]);

  const tokenBudget =
    modelOptions.find((model) => model.modelId === selectedModel)?.maxInputTokens ?? null;
  const tokenUsage = buildTokenUsage(messages as ChatMessage[], tokenBudget);
  const compactDisabled = !activeSession || isConnecting || isStreaming;

  return (
    < >
      <header className="workspace-header">
        <div className="workspace-header-left">
          <span className="workspace-path">Pages / Chat</span>
          <h1 className="workspace-title">AGENT_COLLAB_LIGHT</h1>
        </div>
        <div className="workspace-header-right">
          <button className="workspace-action-btn" onClick={handleCompact} disabled={compactDisabled}>
            Compact Context
          </button>
          <span className="workspace-status">{statusLabel}</span>
        </div>
      </header>
      <section className="workspace-canvas">
        {notice && <div className={`workspace-notice workspace-notice-${notice.kind}`}>{notice.message}</div>}

        <ChatPanel
          className="playground-chat-panel"
          messages={messages as ChatMessage[]}
          onSend={handleSend}
          selectedModel={selectedModel}
          modelOptions={modelOptions}
          onModelChange={handleModelChange}
          reasoningEffort={reasoningEffort}
          onReasoningEffortChange={setReasoningEffort}
          tokenUsage={tokenUsage}
          isStreaming={isStreaming}
          isConnecting={isConnecting}
          onFileSelect={handleFileSelect}
        />
      </section>
    </>
  );
}
