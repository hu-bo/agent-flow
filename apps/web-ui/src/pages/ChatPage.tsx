import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
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
  deleteSessionMessage,
  fetchModels,
  issueRunnerApprovalTicket,
  retrySessionMessage,
  streamRunners,
  type RunnerRecord,
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

function buildRunnerLabel(runner: RunnerRecord): string {
  const host = runner.hostName || runner.host || runner.hostIp;
  if (host && host.trim()) {
    return `${host} (${runner.runnerId})`;
  }
  return runner.runnerId;
}

function safeJsonStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function stringifyMessageForCopy(message: ChatMessage): string {
  return message.content
    .map((part) => {
      if (part.type === 'text') return part.text;
      if (part.type === 'thinking') return part.text;
      if (part.type === 'file') return `[file:${part.mimeType}]`;
      if (part.type === 'image') return '[image]';
      if (part.type === 'tool-call') return `[tool-call:${part.toolName}] ${safeJsonStringify(part.input)}`;
      if (part.type === 'tool-result') return `[tool-result:${part.toolName}] ${safeJsonStringify(part.output)}`;
      if (part.type === 'code-diff') {
        return [
          `[code-diff:${part.filename ?? 'untitled'}.${part.language}]`,
          '--- OLD ---',
          part.oldCode,
          '--- NEW ---',
          part.newCode,
        ].join('\n');
      }
      return safeJsonStringify(part);
    })
    .filter((value) => value.trim().length > 0)
    .join('\n\n')
    .trim();
}

async function copyToClipboard(content: string): Promise<void> {
  if (!content.trim()) return;
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(content);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = content;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!copied) {
    throw new Error('Clipboard is unavailable');
  }
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
    typingMessageId,
  } = useChat();
  const activeSession = useChatStore((state) => state.activeSessionId);
  const setActiveSession = useChatStore((state) => state.setActiveSession);
  const [modelOptions, setModelOptions] = useState<ModelSelectOption[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [reasoningEffort, setReasoningEffort] = useState<ReasoningEffort>('medium');
  const [notice, setNotice] = useState<NoticeState>(null);
  const [runners, setRunners] = useState<RunnerRecord[]>([]);
  const [selectedRunnerId, setSelectedRunnerId] = useState('');
  const [isBindingRunner, setIsBindingRunner] = useState(false);
  const [isCompacting, setIsCompacting] = useState(false);
  const [isMutatingMessage, setIsMutatingMessage] = useState(false);
  const boundRunnerBySessionRef = useRef<Map<string, string>>(new Map());
  const onlineRunners = useMemo(
    () => runners.filter((runner) => runner.status === 'online'),
    [runners],
  );
  const runnerOnlineCount = onlineRunners.length;

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
    let retryTimer: number | null = null;
    let controller: AbortController | null = null;

    const connect = () => {
      if (cancelled) return;
      controller = new AbortController();

      void streamRunners({
        signal: controller.signal,
        onRunners: (next) => {
          if (cancelled) return;
          setRunners(next);
        },
      })
        .catch((error: unknown) => {
          if (cancelled) return;
          if (error instanceof Error && error.name === 'AbortError') {
            return;
          }
        })
        .finally(() => {
          if (cancelled) return;
          retryTimer = window.setTimeout(connect, 1500);
        });
    };

    connect();

    return () => {
      cancelled = true;
      controller?.abort();
      if (retryTimer !== null) {
        window.clearTimeout(retryTimer);
      }
    };
  }, []);

  useEffect(() => {
    setSelectedRunnerId((current) => {
      if (current && onlineRunners.some((runner) => runner.runnerId === current)) {
        return current;
      }
      return onlineRunners[0]?.runnerId ?? '';
    });
  }, [onlineRunners]);

  const bindRunnerToSession = useCallback(async (sessionId: string, runnerId: string) => {
    const boundRunnerId = boundRunnerBySessionRef.current.get(sessionId);
    if (boundRunnerId === runnerId) {
      return;
    }
    setIsBindingRunner(true);
    try {
      await bindSessionRunner(sessionId, runnerId);
      boundRunnerBySessionRef.current.set(sessionId, runnerId);
    } finally {
      setIsBindingRunner(false);
    }
  }, []);

  useEffect(() => {
    if (!activeSession || !selectedRunnerId) return;
    let cancelled = false;

    const bindOnSessionInit = async () => {
      try {
        await bindRunnerToSession(activeSession, selectedRunnerId);
      } catch (error: unknown) {
        if (!cancelled) {
          setNotice({
            kind: 'error',
            message: readErrorMessage(error, 'Failed to bind session runner'),
          });
        }
      }
    };

    void bindOnSessionInit();
    return () => {
      cancelled = true;
    };
  }, [activeSession, bindRunnerToSession, selectedRunnerId]);

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
        if (selectedRunnerId) {
          await bindRunnerToSession(targetSessionId, selectedRunnerId);
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
    [
      activeSession,
      bindRunnerToSession,
      navigate,
      reasoningEffort,
      selectedModelId,
      selectedRunnerId,
      sendMessage,
      setActiveSession,
    ],
  );

  const handleCompact = useCallback(async () => {
    if (!activeSession) {
      setNotice({
        kind: 'error',
        message: 'Select a session before compacting context.',
      });
      return;
    }

    setIsCompacting(true);
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
    } finally {
      setIsCompacting(false);
    }
  }, [activeSession, refreshSessionMessages]);

  const handleRunnerChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedRunnerId(event.target.value);
  }, []);

  const handleRetryMessage = useCallback(
    async (message: ChatMessage) => {
      if (!activeSession) {
        setNotice({ kind: 'error', message: 'Session is not ready for retry.' });
        return;
      }
      if (isStreaming || isConnecting || isMutatingMessage) {
        return;
      }

      setIsMutatingMessage(true);
      try {
        await retrySessionMessage({
          sessionId: activeSession,
          messageId: message.uuid,
          model: selectedModelId ?? undefined,
          reasoningEffort,
        });
        await refreshSessionMessages(activeSession);
      } catch (error: unknown) {
        setNotice({
          kind: 'error',
          message: readErrorMessage(error, 'Failed to retry message'),
        });
      } finally {
        setIsMutatingMessage(false);
      }
    },
    [
      activeSession,
      isConnecting,
      isMutatingMessage,
      isStreaming,
      reasoningEffort,
      refreshSessionMessages,
      selectedModelId,
    ],
  );

  const handleCopyMessage = useCallback(async (message: ChatMessage) => {
    const content = stringifyMessageForCopy(message);
    if (!content) {
      setNotice({ kind: 'error', message: 'Message has no copyable content.' });
      return;
    }
    try {
      await copyToClipboard(content);
      setNotice({ kind: 'success', message: 'Message copied to clipboard.' });
    } catch (error: unknown) {
      setNotice({
        kind: 'error',
        message: readErrorMessage(error, 'Failed to copy message'),
      });
    }
  }, []);

  const handleDeleteMessage = useCallback(
    async (message: ChatMessage) => {
      if (!activeSession) {
        setNotice({ kind: 'error', message: 'Session is not ready for delete.' });
        return;
      }
      if (isStreaming || isConnecting || isMutatingMessage) {
        return;
      }
      const confirmed = window.confirm('Delete this message and following conversation?');
      if (!confirmed) {
        return;
      }

      setIsMutatingMessage(true);
      try {
        await deleteSessionMessage(activeSession, message.uuid);
        await refreshSessionMessages(activeSession);
      } catch (error: unknown) {
        setNotice({
          kind: 'error',
          message: readErrorMessage(error, 'Failed to delete message'),
        });
      } finally {
        setIsMutatingMessage(false);
      }
    },
    [activeSession, isConnecting, isMutatingMessage, isStreaming, refreshSessionMessages],
  );

  const tokenBudget =
    modelOptions.find((model) => Number(model.value) === selectedModelId)?.maxInputTokens ?? null;
  const chatMessages = useMemo(() => messages as ChatMessage[], [messages]);
  const rendererContext = useMemo(
    () => ({
      chatUiTypingMessageId: typingMessageId,
    }),
    [typingMessageId],
  );
  const tokenUsage = buildTokenUsage(chatMessages, tokenBudget);
  const compactDisabled = !activeSession || isConnecting || isStreaming || isCompacting;
  const messageActionsDisabled = isConnecting || isStreaming || isMutatingMessage;
  const runnerSwitchDisabled = onlineRunners.length === 0 || isBindingRunner;

  return (
    < >
      <header className="workspace-header">
        <div className="workspace-header-left">
          <span className="workspace-path">Pages / Chat</span>
          <h1 className="workspace-title">AGENT_COLLAB_LIGHT</h1>
        </div>
        <div className="workspace-header-right">
          <select
            className="workspace-runner-select"
            value={selectedRunnerId}
            onChange={handleRunnerChange}
            disabled={runnerSwitchDisabled}
            aria-label="Runner selection"
          >
            {onlineRunners.length === 0 ? (
              <option value="">RUNNER_OFFLINE</option>
            ) : (
              onlineRunners.map((runner) => (
                <option key={runner.runnerId} value={runner.runnerId}>
                  {buildRunnerLabel(runner)}
                </option>
              ))
            )}
          </select>
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
          rendererContext={rendererContext}
          onSend={handleSend}
          onRetryMessage={handleRetryMessage}
          onCopyMessage={handleCopyMessage}
          onDeleteMessage={handleDeleteMessage}
          messageActionDisabled={messageActionsDisabled}
          selectedModel={selectedModelId === null ? undefined : String(selectedModelId)}
          modelOptions={modelOptions}
          onModelChange={handleModelChange}
          reasoningEffort={reasoningEffort}
          onReasoningEffortChange={setReasoningEffort}
          tokenUsage={tokenUsage}
          isStreaming={isStreaming}
          isConnecting={isConnecting}
          onCompactContext={handleCompact}
          compactContextDisabled={compactDisabled}
          onFileSelect={handleFileSelect}
        />
      </section>
    </>
  );
}
