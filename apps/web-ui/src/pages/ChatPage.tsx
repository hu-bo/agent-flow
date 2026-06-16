import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChatPanel } from '@agent-flow/chat-ui';
import type { FileAttachment } from '@agent-flow/chat-ui';
import { Activity, MessageCircle, NotebookPen } from 'lucide-react';

import { PendingApprovalPrompt } from '../components/PendingApprovalPrompt';
import { createSession, triggerCompact } from '../api';
import { useMessageActions } from '../hooks/useMessageActions';
import { useWorkspaceChatRuntime } from '../hooks/useWorkspaceChatRuntime';
import { useChatStore } from '../store/chat-store';
import { buildRunnerLabel, readErrorMessage } from './chat-page-utils';
import './pages.less';

export function ChatPage() {
  const { sessionId: routeSessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const runtime = useWorkspaceChatRuntime({ routeSessionId });
  const {
    messages,
    sessionRecord,
    pendingApproval,
    approvePendingApproval,
    cancelPendingApproval,
    isApprovingPendingApproval,
    activeSession,
    setActiveSession,
    sendMessage,
    refreshSessionMessages,
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
    runnerSwitchDisabled,
    handleRunnerChange,
    bindRunnerToSession,
    handleFileSelect,
    tokenUsage,
    rendererContext,
    runtimeTraceEnabled,
    toggleRuntimeTraceEnabled,
  } = runtime;
  const [pendingMode, setPendingMode] = useState<'vibe' | 'spec'>('vibe');
  const [isCompacting, setIsCompacting] = useState(false);
  const refreshSessionList = useChatStore((state) => state.refreshSessionList);
  const activeProjectId = useChatStore((state) => state.activeProjectId);
  const pendingNewChatProjectId = useChatStore((state) => state.pendingNewChatProjectId);
  const pendingNewChatPlacement = useChatStore((state) => state.pendingNewChatPlacement);
  const setPendingNewChatProject = useChatStore((state) => state.setPendingNewChatProject);
  const setPendingNewChatPlacement = useChatStore((state) => state.setPendingNewChatPlacement);

  useEffect(() => {
    if (!activeSession || !sessionRecord) return;
    if (sessionRecord.mode === 'spec') {
      navigate(`/spec/${activeSession}`, { replace: true });
    }
  }, [activeSession, navigate, sessionRecord]);

  const {
    handleRetryMessage,
    handleCopyMessage,
    handleDeleteMessage,
    messageActionsDisabled,
  } = useMessageActions({
    activeSession,
    selectedModelId,
    reasoningEffort,
    isConnecting,
    isStreaming,
    refreshSessionMessages,
    setNotice,
  });

  const handleSend = useCallback(
    async (text: string, attachments?: FileAttachment[]) => {
      let targetSessionId = activeSession;
      let shouldBindSelectedRunner = Boolean(activeSession && selectedRunnerId);
      const targetProjectId = !targetSessionId
        ? pendingNewChatPlacement === 'project'
          ? pendingNewChatProjectId ?? activeProjectId ?? undefined
          : undefined
        : sessionRecord?.projectId ?? activeProjectId ?? undefined;
      let createdNewSession = false;
      try {
        if (!targetSessionId) {
          const created = await createSession({
            model: selectedModelId ?? undefined,
            mode: pendingMode,
            title: text,
            projectId: targetProjectId,
          });
          targetSessionId = created.session.sessionId;
          createdNewSession = true;
          if (created.session.mode === 'spec') {
            setActiveSession(targetSessionId);
            setPendingNewChatProject(null);
            setPendingNewChatPlacement(null);
            refreshSessionList();
            navigate(`/spec/${targetSessionId}`, {
              replace: true,
              state: {
                initialPrompt: {
                  text,
                  attachments,
                  modelId: selectedModelId,
                  reasoningEffort,
                  runnerId: created.session.boundRunnerId ? undefined : selectedRunnerId || undefined,
                },
              },
            });
            return;
          }
        } else if (sessionRecord?.mode === 'spec') {
          shouldBindSelectedRunner = Boolean(selectedRunnerId);
          navigate(`/spec/${targetSessionId}`, {
            replace: true,
            state: {
              initialPrompt: {
                text,
                attachments,
                modelId: selectedModelId,
                reasoningEffort,
                runnerId: selectedRunnerId || undefined,
              },
            },
          });
          return;
        }
        if (selectedRunnerId && shouldBindSelectedRunner) {
          await bindRunnerToSession(targetSessionId, selectedRunnerId);
        }

        await sendMessage({
          text,
          sessionId: targetSessionId,
          projectId: targetProjectId,
          mode: 'vibe',
          model: selectedModelId ?? undefined,
          reasoningEffort,
          attachments,
        });
        if (createdNewSession) {
          setActiveSession(targetSessionId);
          setPendingNewChatProject(null);
          setPendingNewChatPlacement(null);
          navigate(`/chat/${targetSessionId}`, { replace: true });
        }
        refreshSessionList();
      } catch (error: unknown) {
        setNotice({
          kind: 'error',
          message: readErrorMessage(error, 'Failed to send message'),
        });
      }
    },
    [
      activeSession,
      activeProjectId,
      bindRunnerToSession,
      navigate,
      pendingMode,
      pendingNewChatPlacement,
      pendingNewChatProjectId,
      reasoningEffort,
      selectedModelId,
      selectedRunnerId,
      sendMessage,
      sessionRecord,
      setActiveSession,
      setPendingNewChatPlacement,
      setPendingNewChatProject,
      setNotice,
      refreshSessionList,
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
  }, [activeSession, refreshSessionMessages, setNotice]);

  const compactDisabled = !activeSession || isConnecting || isStreaming || isCompacting;
  const showModeGate = !activeSession && !isStreaming;
  const approvalPrompt = pendingApproval ? (
    <PendingApprovalPrompt
      pendingApproval={pendingApproval}
      disabled={isApprovingPendingApproval || isConnecting}
      onApprove={approvePendingApproval}
      onCancel={cancelPendingApproval}
    />
  ) : null;

  return (
    <>
      <header className="workspace-header">
        <div className="workspace-header-left">
          <span className="workspace-path">Pages / Chat</span>
          <h1 className="workspace-title">AGENT_COLLAB_LIGHT</h1>
        </div>
        <div className="workspace-header-right">
          <button
            type="button"
            className={`workspace-action-btn workspace-toggle-btn${runtimeTraceEnabled ? ' is-active' : ''}`}
            onClick={toggleRuntimeTraceEnabled}
            aria-pressed={runtimeTraceEnabled}
            title="Trace / 执行轨迹"
          >
            <Activity size={14} />
            <span>Trace</span>
          </button>
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

        <div className="chat-entry-shell">
          {showModeGate && (
            <div className="mode-gate-overlay">
              <div className="mode-gate-hero">
                <div className="mode-gate-icon-wrap">
                  <NotebookPen size={20} />
                </div>
                <h2>Let&apos;s build</h2>
                <p>Plan, search, or build anything</p>
              </div>
              <div className="mode-gate-grid">
                <button
                  type="button"
                  className={`mode-gate-card ${pendingMode === 'vibe' ? 'is-selected' : ''}`}
                  onClick={() => setPendingMode('vibe')}
                >
                  <div className="mode-gate-title">
                    <MessageCircle size={16} />
                    <span>Vibe</span>
                  </div>
                  <p>Chat first, then build. Explore ideas and iterate as you discover needs.</p>
                </button>
                <button
                  type="button"
                  className={`mode-gate-card ${pendingMode === 'spec' ? 'is-selected' : ''}`}
                  onClick={() => setPendingMode('spec')}
                >
                  <div className="mode-gate-title">
                    <NotebookPen size={16} />
                    <span>Spec</span>
                  </div>
                  <p>Plan first, then build. Create requirements and design before coding starts.</p>
                </button>
              </div>
            </div>
          )}
          <ChatPanel
            className="playground-chat-panel"
            messages={messages}
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
            actionPrompt={approvalPrompt}
          />
        </div>
      </section>
    </>
  );
}
