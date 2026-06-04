import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { ChatMessage, FileAttachment, ReasoningEffort } from '@agent-flow/chat-ui';
import {
  bindSessionRunner,
  fetchModels,
  issueRunnerApprovalTicket,
  streamRunners,
  switchModel,
  type RunnerRecord,
  type SessionRecord,
} from '../api';
import { useChat } from './useChat';
import { useChatStore } from '../store/chat-store';
import {
  buildTokenUsage,
  prepareFileAttachments,
  readErrorMessage,
  type ModelSelectOption,
  type NoticeState,
} from '../pages/chat-page-utils';

interface UseWorkspaceChatRuntimeOptions {
  routeSessionId?: string;
}

interface UseWorkspaceChatRuntimeResult {
  messages: ChatMessage[];
  sessionRecord: SessionRecord | null;
  pendingApproval: ReturnType<typeof useChat>['pendingApproval'];
  approvePendingApproval: () => Promise<void>;
  cancelPendingApproval: () => void;
  isApprovingPendingApproval: boolean;
  activeSession: string | null;
  setActiveSession: (sessionId: string | null) => void;
  runtimeTraceEnabled: boolean;
  setRuntimeTraceEnabled: (enabled: boolean) => void;
  toggleRuntimeTraceEnabled: () => void;
  refreshSessionMessages: ReturnType<typeof useChat>['refreshSessionMessages'];
  sendMessage: ReturnType<typeof useChat>['sendMessage'];
  isConnecting: boolean;
  isStreaming: boolean;
  modelOptions: ModelSelectOption[];
  selectedModelId: number | null;
  handleModelChange: (value: string) => Promise<void>;
  reasoningEffort: ReasoningEffort;
  setReasoningEffort: (value: ReasoningEffort) => void;
  notice: NoticeState;
  setNotice: Dispatch<SetStateAction<NoticeState>>;
  onlineRunners: RunnerRecord[];
  runnerOnlineCount: number;
  selectedRunnerId: string;
  runnerSwitchDisabled: boolean;
  handleRunnerChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  bindRunnerToSession: (sessionId: string, runnerId: string) => Promise<void>;
  handleFileSelect: (files: File[]) => Promise<FileAttachment[]>;
  tokenUsage: ReturnType<typeof buildTokenUsage>;
  rendererContext: {
    chatUiTypingMessageId: string | null;
  };
}

export function useWorkspaceChatRuntime({
  routeSessionId,
}: UseWorkspaceChatRuntimeOptions): UseWorkspaceChatRuntimeResult {
  const {
    messages,
    sessionRecord,
    sendMessage,
    approvePendingRequest,
    dismissPendingApproval,
    pendingApproval,
    refreshSessionMessages,
    isConnecting,
    isStreaming,
    typingMessageId,
    loadSessionMessages,
    usageByMessageId,
  } = useChat();
  const activeSession = useChatStore((state) => state.activeSessionId);
  const setActiveSession = useChatStore((state) => state.setActiveSession);
  const setActiveProject = useChatStore((state) => state.setActiveProject);
  const runtimeTraceEnabled = useChatStore((state) => state.runtimeTraceEnabled);
  const setRuntimeTraceEnabled = useChatStore((state) => state.setRuntimeTraceEnabled);
  const toggleRuntimeTraceEnabled = useChatStore((state) => state.toggleRuntimeTraceEnabled);
  const [modelOptions, setModelOptions] = useState<ModelSelectOption[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [reasoningEffort, setReasoningEffort] = useState<ReasoningEffort>('medium');
  const [notice, setNotice] = useState<NoticeState>(null);
  const [runners, setRunners] = useState<RunnerRecord[]>([]);
  const [selectedRunnerId, setSelectedRunnerId] = useState('');
  const [isBindingRunner, setIsBindingRunner] = useState(false);
  const [isApprovingPendingApproval, setIsApprovingPendingApproval] = useState(false);
  const boundRunnerBySessionRef = useRef<Map<string, string>>(new Map());

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

    void syncSessionMessages();
  }, [activeSession, loadSessionMessages]);

  useEffect(() => {
    if (sessionRecord?.projectId) {
      setActiveProject(sessionRecord.projectId);
    }
  }, [sessionRecord?.projectId, setActiveProject]);

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
        setSelectedModelId((current) => {
          if (current !== null && options.some((option) => Number(option.value) === current)) {
            return current;
          }
          return payload.currentModel;
        });
      } catch (error: unknown) {
        setNotice({
          kind: 'error',
          message: readErrorMessage(error, 'Failed to load models'),
        });
      }
    }

    void syncModels();
  }, []);

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

  const onlineRunners = useMemo(
    () => runners.filter((runner) => runner.status === 'online'),
    [runners],
  );
  const runnerOnlineCount = onlineRunners.length;

  useEffect(() => {
    setSelectedRunnerId((current) => {
      if (sessionRecord?.boundRunnerId && onlineRunners.some((runner) => runner.runnerId === sessionRecord.boundRunnerId)) {
        return sessionRecord.boundRunnerId;
      }
      if (current && onlineRunners.some((runner) => runner.runnerId === current)) {
        return current;
      }
      return onlineRunners[0]?.runnerId ?? '';
    });
  }, [onlineRunners, sessionRecord?.boundRunnerId]);

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
    if (!activeSession || !selectedRunnerId || sessionRecord?.sessionId !== activeSession) return;
    if (sessionRecord.boundRunnerId === selectedRunnerId) return;
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
  }, [activeSession, bindRunnerToSession, selectedRunnerId, sessionRecord?.boundRunnerId, sessionRecord?.sessionId]);

  const approvePendingApproval = useCallback(async () => {
    if (!pendingApproval) {
      throw new Error('No pending approval request');
    }

    setIsApprovingPendingApproval(true);
    try {
      const ticket = await issueRunnerApprovalTicket({
        session_id: pendingApproval.approval.session_id,
        cmd: pendingApproval.approval.cmd,
        workdir: pendingApproval.approval.workdir,
      });
      await approvePendingRequest(ticket.approval_ticket);
    } catch (error: unknown) {
      dismissPendingApproval();
      setNotice({
        kind: 'error',
        message: readErrorMessage(error, 'Failed to run approved risky operation'),
      });
      throw error;
    } finally {
      setIsApprovingPendingApproval(false);
    }
  }, [approvePendingRequest, dismissPendingApproval, pendingApproval]);

  const cancelPendingApproval = useCallback(() => {
    dismissPendingApproval();
    setNotice({
      kind: 'success',
      message: 'Risky operation was canceled.',
    });
  }, [dismissPendingApproval]);

  const handleFileSelect = useCallback(prepareFileAttachments, []);

  const handleModelChange = useCallback(async (value: string) => {
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
  }, []);

  const handleRunnerChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedRunnerId(event.target.value);
  }, []);

  const tokenBudget = useMemo(
    () => modelOptions.find((model) => Number(model.value) === selectedModelId)?.maxInputTokens ?? null,
    [modelOptions, selectedModelId],
  );
  const chatMessages = useMemo(() => {
    if (runtimeTraceEnabled) {
      return messages as unknown as ChatMessage[];
    }
    return messages.filter((message) => message.role !== 'tool') as unknown as ChatMessage[];
  }, [messages, runtimeTraceEnabled]);
  const tokenUsage = useMemo(
    () => buildTokenUsage(chatMessages, usageByMessageId, tokenBudget),
    [chatMessages, usageByMessageId, tokenBudget],
  );
  const rendererContext = useMemo(
    () => ({
      chatUiTypingMessageId: typingMessageId,
    }),
    [typingMessageId],
  );

  return {
    messages: chatMessages,
    sessionRecord,
    pendingApproval,
    approvePendingApproval,
    cancelPendingApproval,
    isApprovingPendingApproval,
    activeSession,
    setActiveSession,
    runtimeTraceEnabled,
    setRuntimeTraceEnabled,
    toggleRuntimeTraceEnabled,
    refreshSessionMessages,
    sendMessage,
    isConnecting,
    isStreaming,
    modelOptions,
    selectedModelId,
    handleModelChange,
    reasoningEffort,
    setReasoningEffort,
    notice,
    setNotice,
    onlineRunners,
    runnerOnlineCount,
    selectedRunnerId,
    runnerSwitchDisabled: onlineRunners.length === 0 || isBindingRunner,
    handleRunnerChange,
    bindRunnerToSession,
    handleFileSelect,
    tokenUsage,
    rendererContext,
  };
}
