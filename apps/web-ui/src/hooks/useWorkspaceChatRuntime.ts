import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import type { ChatMessage, FileAttachment } from '@agent-flow/chat-ui';
import { bindSessionRunner, decideRunnerApproval, type SessionRecord } from '../api';
import { useChat } from './useChat';
import { useChatStore } from '../store/chat-store';
import { buildTokenUsage, prepareFileAttachments, readErrorMessage } from '../pages/chat-page-utils';
import { useWorkspaceResources } from '../workspace-provider';

interface UseWorkspaceChatRuntimeOptions {
  routeSessionId?: string;
}

interface UseWorkspaceChatRuntimeResult {
  messages: ChatMessage[];
  sessionRecord: SessionRecord | null;
  pendingApproval: ReturnType<typeof useChat>['pendingApproval'];
  approvePendingApproval: (decision: 'once' | 'always') => Promise<void>;
  cancelPendingApproval: () => void;
  isApprovingPendingApproval: boolean;
  activeSession: string | null;
  setActiveSession: (sessionId: string | null) => void;
  refreshSessionMessages: ReturnType<typeof useChat>['refreshSessionMessages'];
  sendMessage: ReturnType<typeof useChat>['sendMessage'];
  stopGenerating: ReturnType<typeof useChat>['stopGenerating'];
  isConnecting: boolean;
  isStreaming: boolean;
  modelOptions: ReturnType<typeof useWorkspaceResources>['modelOptions'];
  selectedModelId: number | null;
  handleModelChange: (value: string) => Promise<void>;
  reasoningEffort: ReturnType<typeof useWorkspaceResources>['reasoningEffort'];
  setReasoningEffort: ReturnType<typeof useWorkspaceResources>['setReasoningEffort'];
  notice: ReturnType<typeof useWorkspaceResources>['notice'];
  setNotice: ReturnType<typeof useWorkspaceResources>['setNotice'];
  onlineRunners: ReturnType<typeof useWorkspaceResources>['onlineRunners'];
  runnerOnlineCount: number;
  selectedRunnerId: string;
  runnerSwitchDisabled: boolean;
  handleRunnerChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  bindRunnerToSession: (sessionId: string, runnerId: string) => Promise<void>;
  handleFileSelect: (files: File[]) => Promise<FileAttachment[]>;
  tokenUsage: ReturnType<typeof buildTokenUsage>;
}

export function useWorkspaceChatRuntime({
  routeSessionId,
}: UseWorkspaceChatRuntimeOptions): UseWorkspaceChatRuntimeResult {
  const chat = useChat();
  const resources = useWorkspaceResources();
  const activeSession = useChatStore((state) => state.activeSessionId);
  const setActiveSession = useChatStore((state) => state.setActiveSession);
  const setActiveProject = useChatStore((state) => state.setActiveProject);
  const [isBindingRunner, setIsBindingRunner] = useState(false);
  const [isApprovingPendingApproval, setIsApprovingPendingApproval] = useState(false);
  const boundRunnerBySessionRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const nextSessionId = routeSessionId ?? null;
    if (activeSession !== nextSessionId) setActiveSession(nextSessionId);
  }, [activeSession, routeSessionId, setActiveSession]);

  useEffect(() => {
    void chat.loadSessionMessages(activeSession).catch((error: unknown) => resources.setNotice({
      kind: 'error',
      message: readErrorMessage(error, 'Failed to load session'),
    }));
  }, [activeSession, chat.loadSessionMessages, resources.setNotice]);

  useEffect(() => {
    if (chat.sessionRecord?.projectId) setActiveProject(chat.sessionRecord.projectId);
  }, [chat.sessionRecord?.projectId, setActiveProject]);

  useEffect(() => {
    const bound = chat.sessionRecord?.boundRunnerId;
    if (bound && resources.onlineRunners.some((runner) => runner.runnerId === bound)) {
      resources.setSelectedRunnerId(bound);
    }
  }, [chat.sessionRecord?.boundRunnerId, resources.onlineRunners, resources.setSelectedRunnerId]);

  const bindRunnerToSession = useCallback(async (sessionId: string, runnerId: string) => {
    if (boundRunnerBySessionRef.current.get(sessionId) === runnerId) return;
    setIsBindingRunner(true);
    try {
      await bindSessionRunner(sessionId, runnerId);
      boundRunnerBySessionRef.current.set(sessionId, runnerId);
    } finally {
      setIsBindingRunner(false);
    }
  }, []);

  useEffect(() => {
    if (!activeSession || !resources.selectedRunnerId || chat.sessionRecord?.sessionId !== activeSession) return;
    if (chat.sessionRecord.boundRunnerId === resources.selectedRunnerId) return;
    void bindRunnerToSession(activeSession, resources.selectedRunnerId).catch((error: unknown) => resources.setNotice({
      kind: 'error',
      message: readErrorMessage(error, 'Failed to bind session runner'),
    }));
  }, [
    activeSession,
    bindRunnerToSession,
    chat.sessionRecord?.boundRunnerId,
    chat.sessionRecord?.sessionId,
    resources.selectedRunnerId,
    resources.setNotice,
  ]);

  const approvePendingApproval = useCallback(async (decision: 'once' | 'always') => {
    if (!chat.pendingApproval) throw new Error('No pending approval request');
    setIsApprovingPendingApproval(true);
    try {
      await decideRunnerApproval(chat.pendingApproval.requestId, decision);
    } catch (error: unknown) {
      resources.setNotice({
        kind: 'error',
        message: readErrorMessage(error, 'Failed to approve risky operation'),
      });
      throw error;
    } finally {
      setIsApprovingPendingApproval(false);
    }
  }, [chat.pendingApproval, resources.setNotice]);

  const cancelPendingApproval = useCallback(() => {
    if (!chat.pendingApproval) return;
    void decideRunnerApproval(chat.pendingApproval.requestId, 'deny')
      .then(() => resources.setNotice({ kind: 'success', message: 'Risky operation was canceled.' }))
      .catch((error: unknown) => resources.setNotice({
        kind: 'error',
        message: readErrorMessage(error, 'Failed to deny risky operation'),
      }));
  }, [chat.pendingApproval, resources.setNotice]);

  const handleModelChange = useCallback(async (value: string) => {
    const modelId = Number(value);
    if (Number.isInteger(modelId) && modelId > 0) resources.selectModel(modelId);
  }, [resources.selectModel]);

  const handleRunnerChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    resources.setSelectedRunnerId(event.target.value);
  }, [resources.setSelectedRunnerId]);

  const tokenBudget = useMemo(
    () => resources.modelOptions.find((model) => Number(model.value) === resources.selectedModelId)?.maxInputTokens ?? null,
    [resources.modelOptions, resources.selectedModelId],
  );
  const messages = chat.messages as ChatMessage[];
  const tokenUsage = useMemo(
    () => buildTokenUsage(messages, chat.usageByMessageId, tokenBudget),
    [chat.usageByMessageId, messages, tokenBudget],
  );

  return {
    messages,
    sessionRecord: chat.sessionRecord,
    pendingApproval: chat.pendingApproval,
    approvePendingApproval,
    cancelPendingApproval,
    isApprovingPendingApproval,
    activeSession,
    setActiveSession,
    refreshSessionMessages: chat.refreshSessionMessages,
    sendMessage: chat.sendMessage,
    stopGenerating: chat.stopGenerating,
    isConnecting: chat.isConnecting,
    isStreaming: chat.isStreaming,
    modelOptions: resources.modelOptions,
    selectedModelId: resources.selectedModelId,
    handleModelChange,
    reasoningEffort: resources.reasoningEffort,
    setReasoningEffort: resources.setReasoningEffort,
    notice: resources.notice,
    setNotice: resources.setNotice,
    onlineRunners: resources.onlineRunners,
    runnerOnlineCount: resources.onlineRunners.length,
    selectedRunnerId: resources.selectedRunnerId,
    runnerSwitchDisabled: resources.onlineRunners.length === 0 || isBindingRunner,
    handleRunnerChange,
    bindRunnerToSession,
    handleFileSelect: prepareFileAttachments,
    tokenUsage,
  };
}
