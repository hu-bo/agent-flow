import { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useChat } from './hooks/useChat';
import type {
  ChatMessage,
  ChatModelOption,
  FileAttachment,
  ReasoningEffort,
  TokenUsageSummary,
} from '@agent-flow/chat-ui';
import { fetchModels, switchModel, triggerCompact } from './api';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Workspace } from './components/Workspace/Workspace';

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

export function App() {
  const {
    messages,
    sendMessage,
    loadSessionMessages,
    refreshSessionMessages,
    isConnecting,
    isStreaming,
  } = useChat();
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [modelOptions, setModelOptions] = useState<ChatModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [reasoningEffort, setReasoningEffort] = useState<ReasoningEffort>('medium');
  const [notice, setNotice] = useState<NoticeState>(null);
  const statusLabel = isConnecting ? 'LOADING_SESSION' : isStreaming ? 'STREAMING' : 'READY';

  useEffect(() => {
    void loadSessionMessages(activeSession).catch((error: unknown) => {
      setNotice({
        kind: 'error',
        message: readErrorMessage(error, 'Failed to load session'),
      });
    });
  }, [activeSession, loadSessionMessages]);

  useEffect(() => {
    void fetchModels()
      .then((payload) => {
        const options = payload.models.map((model) => ({
          modelId: model.modelId,
          label: model.displayName,
          provider: model.provider,
          maxInputTokens: model.maxInputTokens,
        }));
        setModelOptions(options);
        setSelectedModel(payload.currentModel);
      })
      .catch((error: unknown) => {
        setNotice({
          kind: 'error',
          message: readErrorMessage(error, 'Failed to load models'),
        });
      });
  }, []);

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
    (text: string, attachments?: FileAttachment[]) => {
      if (!activeSession) {
        setNotice({
          kind: 'error',
          message: 'Please create or select a session first.',
        });
        return;
      }

      void sendMessage({
        text,
        sessionId: activeSession,
        model: selectedModel || undefined,
        reasoningEffort,
        attachments,
      }).catch((error: unknown) => {
        setNotice({
          kind: 'error',
          message: readErrorMessage(error, 'Failed to send message'),
        });
      });
    },
    [activeSession, reasoningEffort, selectedModel, sendMessage],
  );

  const handleCompact = useCallback(() => {
    if (!activeSession) {
      setNotice({
        kind: 'error',
        message: 'Select a session before compacting context.',
      });
      return;
    }

    void (async () => {
      await triggerCompact(activeSession);
      await refreshSessionMessages(activeSession);
      setNotice({
        kind: 'success',
        message: 'Context compaction completed.',
      });
    })().catch((error: unknown) => {
      setNotice({
        kind: 'error',
        message: readErrorMessage(error, 'Failed to compact session context'),
      });
    });
  }, [activeSession, refreshSessionMessages]);

  const tokenBudget =
    modelOptions.find((model) => model.modelId === selectedModel)?.maxInputTokens ?? null;
  const tokenUsage = buildTokenUsage(messages as ChatMessage[], tokenBudget);

  return (
    <div className="playground-shell">
      <Sidebar activeSessionId={activeSession} onSelectSession={setActiveSession} />

      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route
          path="/chat"
          element={
            <Workspace
              mode="chat"
              statusLabel={statusLabel}
              activeSessionId={activeSession}
              selectedModel={selectedModel}
              modelOptions={modelOptions}
              reasoningEffort={reasoningEffort}
              messages={messages as ChatMessage[]}
              isStreaming={isStreaming}
              isConnecting={isConnecting}
              onModelChange={handleModelChange}
              onReasoningEffortChange={setReasoningEffort}
              onSend={handleSend}
              onCompact={handleCompact}
              compactDisabled={!activeSession || isConnecting || isStreaming}
              onFileSelect={handleFileSelect}
              tokenUsage={tokenUsage}
              notice={notice}
            />
          }
        />
        <Route
          path="/agent"
          element={
            <Workspace
              mode="agent"
              statusLabel={statusLabel}
              activeSessionId={activeSession}
              selectedModel={selectedModel}
              messages={messages as ChatMessage[]}
              isStreaming={isStreaming}
              isConnecting={isConnecting}
              onSend={handleSend}
              notice={notice}
            />
          }
        />
        <Route
          path="/flow"
          element={
            <Workspace
              mode="flow"
              statusLabel={statusLabel}
              activeSessionId={activeSession}
              selectedModel={selectedModel}
              messages={messages as ChatMessage[]}
              isStreaming={isStreaming}
              isConnecting={isConnecting}
              onSend={handleSend}
              notice={notice}
            />
          }
        />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </div>
  );
}
