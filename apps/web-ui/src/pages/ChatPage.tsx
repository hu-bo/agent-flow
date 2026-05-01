import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChatPanel } from '@agent-flow/chat-ui';
import type {
  ChatMessage,
  FileAttachment,
  ReasoningEffort,
  TokenUsageSummary,
} from '@agent-flow/chat-ui';

import {
  bindSessionRunner,
  createSession,
  fetchModels,
  fetchRunners,
  issueRunnerApprovalTicket,
  switchModel,
  triggerCompact,
} from '../api';
import { useChat } from '../hooks/useChat';
import { useChatStore } from '../store/chat-store';
import './pages.less';

type NoticeState = { kind: 'success' | 'error'; message: string } | null;
type ModelSelectOption = {
  value: string;
  label: string;
  provider?: string;
  maxInputTokens?: number;
};

function readErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

function parseApprovalCommand(message: string): string {
  const exact = message.match(/command\s+"([^"]+)"/i)?.[1];
  if (exact && exact.trim()) {
    return exact.trim();
  }
  if (/fs\.write/i.test(message)) return 'fs.write';
  if (/fs\.patch/i.test(message)) return 'fs.patch';
  if (/shell\.exec/i.test(message)) return 'shell.exec';
  return 'shell.exec';
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
  const { sessionId: routeSessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const {
    messages,
    sendMessage,
    loadSessionMessages,
    refreshSessionMessages,
    isConnecting,
    isStreaming,
  } = useChat();
  const activeSession = useChatStore((state) => state.activeSessionId);
  const setActiveSession = useChatStore((state) => state.setActiveSession);
  const [modelOptions, setModelOptions] = useState<ModelSelectOption[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [reasoningEffort, setReasoningEffort] = useState<ReasoningEffort>('medium');
  const [notice, setNotice] = useState<NoticeState>(null);
  const [runnerOnlineCount, setRunnerOnlineCount] = useState(0);
  const lastBoundRef = useRef<string>('');
  const statusLabel = isConnecting ? 'LOADING_SESSION' : isStreaming ? 'STREAMING' : 'READY';

  useEffect(() => {
    const nextSessionId = routeSessionId ?? null;
    if (activeSession !== nextSessionId) {
      setActiveSession(nextSessionId);
    }
  }, [activeSession, routeSessionId, setActiveSession]);

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
          value: String(model.modelId),
          label: model.displayName,
          provider: model.provider,
          maxInputTokens: model.maxInputTokens,
        }));
        setModelOptions(options);
        // Keep user choice when route switches unless selected model is missing.
        if (
          selectedModelId === null ||
          !options.some((option) => Number(option.value) === selectedModelId)
        ) {
          setSelectedModelId(payload.currentModel);
        }
      } catch (error: unknown) {
        setNotice({
          kind: 'error',
          message: readErrorMessage(error, 'Failed to load models'),
        });
      }
    }

    syncModels();
  }, [selectedModelId]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => {
      setNotice(null);
    }, 3600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    let cancelled = false;

    const syncRunnerState = async () => {
      try {
        const payload = await fetchRunners();
        if (cancelled) return;
        const online = (payload.runners ?? []).filter((runner) => runner.status === 'online');
        setRunnerOnlineCount(online.length);

        if (!activeSession || online.length === 0) return;
        const candidate = online[0];
        if (!candidate) return;

        const nextBoundKey = `${activeSession}:${candidate.runnerId}`;
        if (lastBoundRef.current === nextBoundKey) return;
        await bindSessionRunner(activeSession, candidate.runnerId);
        lastBoundRef.current = nextBoundKey;
      } catch {
        if (!cancelled) {
          setRunnerOnlineCount(0);
        }
      }
    };

    void syncRunnerState();
    const timer = window.setInterval(() => {
      void syncRunnerState();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [activeSession]);

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
    async (value: string) => {
      try {
        const modelId = Number(value);
        await switchModel(modelId);
        setSelectedModelId(modelId);
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
      let targetSessionId = activeSession;
      try {
        if (!targetSessionId) {
          const created = await createSession({
            model: selectedModelId ?? undefined,
          });
          targetSessionId = created.session.sessionId;
          setActiveSession(targetSessionId);
          navigate(`/chat/${targetSessionId}`, { replace: true });
        }

        await sendMessage({
          text,
          sessionId: targetSessionId,
          model: selectedModelId ?? undefined,
          reasoningEffort,
          attachments,
        });
      } catch (error: unknown) {
        const message = readErrorMessage(error, 'Failed to send message');
        const needApproval =
          /approval required/i.test(message) || /approveRiskyOps/i.test(message) || /APPROVAL_REQUIRED/i.test(message);
        if (needApproval) {
          const confirmed = window.confirm(
            'This action is high-risk (write/patch/shell). Approve this turn and continue execution?',
          );
          if (confirmed) {
            try {
              const approvalCommand = parseApprovalCommand(message);
              if (!targetSessionId) {
                throw new Error('Session missing for approval flow');
              }
              const ticket = await issueRunnerApprovalTicket({
                sessionId: targetSessionId,
                command: approvalCommand,
              });
              await sendMessage({
                text,
                sessionId: targetSessionId,
                model: selectedModelId ?? undefined,
                reasoningEffort,
                approvalTicket: ticket.approvalTicket,
                attachments,
              });
              return;
            } catch (retryError: unknown) {
              setNotice({
                kind: 'error',
                message: readErrorMessage(retryError, 'Failed to run approved risky operation'),
              });
              return;
            }
          }
        }
        setNotice({
          kind: 'error',
          message,
        });
      }
    },
    [activeSession, navigate, reasoningEffort, selectedModelId, sendMessage, setActiveSession],
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
    modelOptions.find((model) => Number(model.value) === selectedModelId)?.maxInputTokens ?? null;
  const chatMessages = useMemo(() => messages as ChatMessage[], [messages]);
  const tokenUsage = buildTokenUsage(chatMessages, tokenBudget);
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
        {runnerOnlineCount === 0 && (
          <div className="chat-runner-hint">
            No online runner is available. Go to <Link to="/runners">Runner page</Link> to start one.
          </div>
        )}
        {notice && <div className={`workspace-notice workspace-notice-${notice.kind}`}>{notice.message}</div>}

        <ChatPanel
          className="playground-chat-panel"
          messages={chatMessages}
          onSend={handleSend}
          selectedModel={selectedModelId === null ? undefined : String(selectedModelId)}
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
