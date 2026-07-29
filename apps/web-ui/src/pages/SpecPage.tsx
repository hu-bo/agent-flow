import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ActionPrompt, ChatPanel } from '@agent-flow/chat-ui';
import MDEditor from '@uiw/react-md-editor';
import type {
  ActionPromptOption,
  ActionPromptSubmitPayload,
  ChatMessage,
  FileAttachment,
  ReasoningEffort,
} from '@agent-flow/chat-ui';
import { Activity } from 'lucide-react';
import { PendingApprovalPrompt } from '../components/PendingApprovalPrompt';
import {
  confirmSpecPhase,
  createSession,
  fetchSpecState,
  type SpecDocType,
  type SpecWorkflowState,
} from '../api';
import { useMessageActions } from '../hooks/useMessageActions';
import { useWorkspaceChatRuntime } from '../hooks/useWorkspaceChatRuntime';
import { useChatStore } from '../store/chat-store';
import {
  buildRunnerLabel,
  readErrorMessage,
} from './chat-page-utils';
import './pages.less';
import '@uiw/react-md-editor/markdown-editor.css';

interface SpecInitialPrompt {
  text: string;
  attachments?: FileAttachment[];
  modelId?: number | null;
  reasoningEffort?: ReasoningEffort;
  runnerId?: string;
}

interface SpecLocationState {
  initialPrompt?: SpecInitialPrompt;
}

function phaseLabel(phase: SpecWorkflowState['phase']): string {
  if (phase === 'requirements') return 'Requirements';
  if (phase === 'design') return 'Design';
  return 'Tasks';
}

function getSpecDocument(workflow: SpecWorkflowState | null): string {
  if (!workflow) return '';
  return workflow.documents?.[workflow.phase] ?? '';
}

function getMessageText(message: { content: Array<{ type: string; text?: string }> }): string {
  return message.content
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim();
}

function isSpecDocumentMessage(message: ChatMessage): boolean {
  if (message.role !== 'assistant') {
    return false;
  }
  const text = getMessageText(message);
  return (
    text.startsWith('# Requirements') ||
    text.startsWith('# Design') ||
    text.startsWith('# Task Breakdown')
  );
}

function buildSpecActionOptions(phase: SpecWorkflowState['phase']): ActionPromptOption[] {
  if (phase === 'requirements') {
    return [
      {
        id: 'advance',
        title: 'Create Design Document',
        description: 'Continue with the next phase in the workflow',
        recommended: true,
        toggleGroupLabel: 'Select the artifacts you want included:',
        toggles: [
          {
            id: 'high-level-design',
            label: 'High-Level Design',
            description: 'System diagrams, components, and data models',
            defaultSelected: true,
          },
          {
            id: 'low-level-design',
            label: 'Low-Level Design',
            description: 'Code/pseudocode, algorithms, and function signatures',
            defaultSelected: true,
          },
        ],
      },
      {
        id: 'review',
        title: 'Review Requirements',
        description: 'Review or modify the requirements document first',
      },
    ];
  }

  if (phase === 'design') {
    return [
      {
        id: 'advance',
        title: 'Create Task Breakdown',
        description: 'Generate implementation tasks from the approved design',
        recommended: true,
        toggleGroupLabel: 'Select the task artifacts you want included:',
        toggles: [
          {
            id: 'required-tasks',
            label: 'Required Tasks',
            description: 'Core work items needed to complete the implementation',
            defaultSelected: true,
          },
          {
            id: 'optional-tasks',
            label: 'Optional Tasks',
            description: 'Nice-to-have follow-ups and polish work',
            defaultSelected: true,
          },
        ],
      },
      {
        id: 'review',
        title: 'Review Design',
        description: 'Review or modify the design document first',
      },
    ];
  }

  return [
    {
      id: 'advance',
      title: 'Confirm Task Breakdown',
      description: 'Finalize the task list for implementation work',
      recommended: true,
    },
    {
      id: 'review',
      title: 'Review Tasks',
      description: 'Send custom feedback before finalizing the task breakdown',
      customInput: {
        label: 'Custom task feedback',
        placeholder: 'Describe what should change in tasks.md...',
        required: true,
        minRows: 5,
      },
    },
  ];
}

function buildSpecActionQuestion(phase: SpecWorkflowState['phase']): string {
  if (phase === 'requirements') return 'What would you like to do next?';
  if (phase === 'design') return 'The design document is ready. What should happen next?';
  return 'The task breakdown is ready. What would you like to do next?';
}

function createLocalMessageId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `local_${crypto.randomUUID()}`;
  }
  return `local_${Date.now().toString(16)}_${Math.random().toString(16).slice(2, 10)}`;
}

function createOptimisticActionMessage(text: string): ChatMessage {
  return {
    uuid: createLocalMessageId(),
    parentUuid: null,
    role: 'user',
    content: [{ type: 'text', text }],
    timestamp: new Date().toISOString(),
    metadata: {},
  };
}

function getSpecActionKey(workflow: SpecWorkflowState | null): string {
  if (!workflow?.awaitingConfirm) return '';
  const messageId =
    workflow.phase === 'requirements'
      ? workflow.requirementsMsgId
      : workflow.phase === 'design'
        ? workflow.designMsgId
        : workflow.taskListMsgId;
  return `${workflow.phase}:${messageId ?? 'pending'}`;
}

function getSelectedToggleLabels(option: ActionPromptOption | undefined, selectedToggleIds: string[]): string[] {
  const toggles = option?.toggles ?? [];
  return selectedToggleIds.map((id) => toggles.find((toggle) => toggle.id === id)?.label ?? id);
}

function renderActionAnswer(
  option: ActionPromptOption | undefined,
  payload: ActionPromptSubmitPayload,
): string {
  if (payload.customInput?.trim()) {
    return payload.customInput.trim();
  }

  const title = option?.title ?? payload.optionId;
  const selectedLabels = getSelectedToggleLabels(option, payload.selectedToggleIds);
  if (selectedLabels.length === 0) {
    return title;
  }

  return [title, `Included artifacts: ${selectedLabels.join(', ')}`].join('\n');
}

export function SpecPage() {
  const { sessionId: routeSessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const runtime = useWorkspaceChatRuntime({ routeSessionId });
  const {
    messages,
    pendingApproval,
    approvePendingApproval,
    cancelPendingApproval,
    isApprovingPendingApproval,
    activeSession,
    setActiveSession,
    sendMessage,
    stopGenerating,
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
    handleFileSelect,
    tokenUsage,
    rendererContext,
    bindRunnerToSession,
    runtimeTraceEnabled,
    toggleRuntimeTraceEnabled,
  } = runtime;
  const [isConfirmingSpec, setIsConfirmingSpec] = useState(false);
  const [specState, setSpecState] = useState<SpecWorkflowState | null>(null);
  const [draftMarkdown, setDraftMarkdown] = useState('');
  const [mobileView, setMobileView] = useState<'chat' | 'document'>('chat');
  const [submittedActionKey, setSubmittedActionKey] = useState('');
  const [optimisticActionMessage, setOptimisticActionMessage] = useState<ChatMessage | null>(null);
  const initialPromptSentRef = useRef(false);
  const refreshSessionList = useChatStore((state) => state.refreshSessionList);
  const activeProjectId = useChatStore((state) => state.activeProjectId);
  const initialPrompt = (location.state as SpecLocationState | null | undefined)?.initialPrompt;
  const activeActionKey = useMemo(() => getSpecActionKey(specState), [specState]);

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

  useEffect(() => {
    async function ensureSpecSession() {
      if (routeSessionId || activeSession) return;
      try {
        const created = await createSession({
          model: selectedModelId ?? undefined,
          mode: 'spec',
          projectId: activeProjectId ?? undefined,
        });
        setActiveSession(created.session.sessionId);
        refreshSessionList();
        navigate(`/spec/${created.session.sessionId}`, { replace: true });
      } catch (error: unknown) {
        setNotice({
          kind: 'error',
          message: readErrorMessage(error, 'Failed to create spec session'),
        });
      }
    }
    void ensureSpecSession();
  }, [activeProjectId, activeSession, navigate, refreshSessionList, routeSessionId, selectedModelId, setActiveSession, setNotice]);

  useEffect(() => {
    if (!activeSession) {
      setSpecState(null);
      return;
    }
    let cancelled = false;
    const syncSpecState = async () => {
      try {
        const payload = await fetchSpecState(activeSession);
        if (!cancelled) {
          setSpecState(payload.specWorkflow);
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setNotice({
            kind: 'error',
            message: readErrorMessage(error, 'Failed to load spec workflow state'),
          });
        }
      }
    };
    void syncSpecState();
    return () => {
      cancelled = true;
    };
  }, [activeSession, setNotice]);

  useEffect(() => {
    setDraftMarkdown(getSpecDocument(specState));
  }, [specState?.documents, specState?.phase]);

  const handleSpecDocUpdate = useCallback(
    (event: { doc_type: SpecDocType; content: string }) => {
      setSpecState((current) => {
        if (!current) return current;
        return {
          ...current,
          documents: {
            ...(current.documents ?? {}),
            [event.doc_type]: event.content,
          },
        };
      });

      if (!specState || specState.phase === event.doc_type) {
        setDraftMarkdown(event.content);
      }
    },
    [specState],
  );

  const chatMessages = useMemo(() => {
    const visibleMessages = messages.filter((message) => !isSpecDocumentMessage(message));
    return optimisticActionMessage ? [...visibleMessages, optimisticActionMessage] : visibleMessages;
  }, [messages, optimisticActionMessage]);

  useEffect(() => {
    if (!activeSession || !initialPrompt || initialPromptSentRef.current) {
      return;
    }
    initialPromptSentRef.current = true;

    const sendInitialPrompt = async () => {
      try {
        if (initialPrompt.runnerId) {
          await bindRunnerToSession(activeSession, initialPrompt.runnerId);
        }
        await sendMessage({
          text: initialPrompt.text,
          sessionId: activeSession,
          projectId: activeProjectId ?? undefined,
          mode: 'spec',
          model: initialPrompt.modelId ?? selectedModelId ?? undefined,
          reasoningEffort: initialPrompt.reasoningEffort ?? reasoningEffort,
          attachments: initialPrompt.attachments,
          onSpecDocUpdate: handleSpecDocUpdate,
        });
        await fetchSpecState(activeSession).then((payload) => {
          setSpecState(payload.specWorkflow);
        });
        refreshSessionList();
      } catch (error: unknown) {
        setNotice({
          kind: 'error',
          message: readErrorMessage(error, 'Failed to start spec session'),
        });
      } finally {
        navigate(location.pathname, { replace: true, state: null });
      }
    };

    void sendInitialPrompt();
  }, [
      activeSession,
      activeProjectId,
      bindRunnerToSession,
    handleSpecDocUpdate,
    initialPrompt,
    location.pathname,
    navigate,
    reasoningEffort,
    refreshSessionList,
    selectedModelId,
    sendMessage,
    setNotice,
  ]);

  const handleSend = useCallback(
    async (text: string, attachments?: FileAttachment[]) => {
      if (!activeSession) return;
      try {
        await sendMessage({
          text,
          sessionId: activeSession,
          projectId: activeProjectId ?? undefined,
          mode: 'spec',
          model: selectedModelId ?? undefined,
          reasoningEffort,
          attachments,
          onSpecDocUpdate: handleSpecDocUpdate,
        });
        const latestState = await fetchSpecState(activeSession);
        setSpecState(latestState.specWorkflow);
        refreshSessionList();
      } catch (error: unknown) {
        setNotice({
          kind: 'error',
          message: readErrorMessage(error, 'Failed to send message'),
        });
      }
    },
    [activeProjectId, activeSession, handleSpecDocUpdate, reasoningEffort, refreshSessionList, selectedModelId, sendMessage, setNotice],
  );

  const handleConfirm = useCallback(async (selectedArtifacts?: string[], actionAnswer?: string) => {
    if (!activeSession || !specState?.awaitingConfirm || isConfirmingSpec) {
      return;
    }
    setIsConfirmingSpec(true);
    try {
      await confirmSpecPhase(activeSession, { selectedArtifacts, actionAnswer });
      await refreshSessionMessages(activeSession);
      refreshSessionList();
      setOptimisticActionMessage(null);
      const latestState = await fetchSpecState(activeSession);
      setSpecState(latestState.specWorkflow);
      setNotice({
        kind: 'success',
        message:
          latestState.specWorkflow.phase === 'tasks' && latestState.specWorkflow.awaitingConfirm
            ? 'Task breakdown ready.'
            : `Moved to ${phaseLabel(latestState.specWorkflow.phase)} phase.`,
      });
    } catch (error: unknown) {
      setSubmittedActionKey('');
      setOptimisticActionMessage(null);
      setNotice({
        kind: 'error',
        message: readErrorMessage(error, 'Failed to confirm spec phase'),
      });
    } finally {
      setIsConfirmingSpec(false);
    }
  }, [activeSession, isConfirmingSpec, refreshSessionList, refreshSessionMessages, setNotice, specState?.awaitingConfirm]);

  const handleSpecActionSubmit = useCallback(
    async (payload: ActionPromptSubmitPayload) => {
      if (!specState || !activeActionKey) {
        return;
      }
      const option = buildSpecActionOptions(specState.phase).find((candidate) => candidate.id === payload.optionId);
      const answerText = renderActionAnswer(option, payload);
      setSubmittedActionKey(activeActionKey);

      if (payload.optionId === 'review') {
        if (payload.customInput?.trim()) {
          await handleSend(payload.customInput.trim());
          return;
        }
        setOptimisticActionMessage(createOptimisticActionMessage(answerText));
        setNotice({
          kind: 'success',
          message: `Review the ${specState ? phaseLabel(specState.phase).toLowerCase() : 'spec'} document before continuing.`,
        });
        return;
      }
      const selectedArtifacts = getSelectedToggleLabels(option, payload.selectedToggleIds);
      setOptimisticActionMessage(createOptimisticActionMessage(answerText));
      await handleConfirm(selectedArtifacts, answerText);
    },
    [activeActionKey, handleConfirm, handleSend, setNotice, specState],
  );

  const specActionPrompt = useMemo(() => {
    if (!specState?.awaitingConfirm || submittedActionKey === activeActionKey) {
      return null;
    }

    return (
      <ActionPrompt
        key={specState.phase}
        title="Input required"
        question={buildSpecActionQuestion(specState.phase)}
        options={buildSpecActionOptions(specState.phase)}
        disabled={isConfirmingSpec || isStreaming || isConnecting}
        onSubmit={handleSpecActionSubmit}
        onCancel={() => {
          setNotice({
            kind: 'success',
            message: 'No workflow action was taken.',
          });
        }}
      />
    );
  }, [
    activeActionKey,
    handleSpecActionSubmit,
    isConfirmingSpec,
    isConnecting,
    isStreaming,
    setNotice,
    specState,
    submittedActionKey,
  ]);

  const approvalPrompt = useMemo(() => {
    if (!pendingApproval) {
      return null;
    }

    return (
      <PendingApprovalPrompt
        pendingApproval={pendingApproval}
        disabled={isApprovingPendingApproval || isConnecting}
        onApprove={approvePendingApproval}
        onCancel={cancelPendingApproval}
      />
    );
  }, [
    approvePendingApproval,
    cancelPendingApproval,
    isApprovingPendingApproval,
    isConnecting,
    pendingApproval,
  ]);

  const actionPrompt = approvalPrompt ?? specActionPrompt;

  return (
    <>
      <header className="workspace-header">
        <div className="workspace-header-left">
          <span className="workspace-path">Pages / Spec</span>
          <h1 className="workspace-title">SPEC_WORKBENCH</h1>
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

        {specState && (
          <div className="spec-workflow-panel">
            <div className="spec-workflow-track" aria-label="Spec workflow phases">
              {(['requirements', 'design', 'tasks'] as const).map((phase) => {
                const active = specState.phase === phase;
                const done =
                  (specState.phase === 'design' && phase === 'requirements') ||
                  (specState.phase === 'tasks' && (phase === 'requirements' || phase === 'design'));
                return (
                  <div
                    key={phase}
                    className={`spec-workflow-step${active ? ' is-active' : ''}${done ? ' is-done' : ''}`}
                  >
                    <span>{phaseLabel(phase)}</span>
                  </div>
                );
              })}
            </div>
            {specState.awaitingConfirm && <span className="workspace-status">Awaiting Confirmation</span>}
          </div>
        )}

        <div className="spec-mobile-view-toggle" role="tablist" aria-label="Spec mobile view">
          <button
            type="button"
            role="tab"
            aria-selected={mobileView === 'chat'}
            className={mobileView === 'chat' ? 'is-active' : ''}
            onClick={() => setMobileView('chat')}
          >
            Agent chat
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileView === 'document'}
            className={mobileView === 'document' ? 'is-active' : ''}
            onClick={() => setMobileView('document')}
          >
            Spec document
          </button>
        </div>

        <div className={`spec-layout spec-layout-mobile-${mobileView}`}>
          <section className="spec-doc-pane" aria-hidden={mobileView !== 'document'}>
            <header className="spec-doc-header">
              <h3>Spec Markdown</h3>
              <span>{specState ? phaseLabel(specState.phase) : 'Requirements'}</span>
            </header>
            <div className="spec-doc-editor" data-color-mode="light">
              <MDEditor
                value={draftMarkdown}
                onChange={(next) => setDraftMarkdown(next ?? '')}
                preview="edit"
                hideToolbar={true}
                visibleDragbar={false}
                textareaProps={{
                  placeholder: 'Generated requirements/design/tasks markdown will appear here...',
                }}
              />
            </div>
          </section>

          <section className="spec-chat-pane" aria-hidden={mobileView !== 'chat'}>
            <ChatPanel
              className="playground-chat-panel"
              messages={chatMessages}
              rendererContext={rendererContext}
              onSend={handleSend}
              onStop={stopGenerating}
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
              onFileSelect={handleFileSelect}
              actionPrompt={actionPrompt}
            />
          </section>
        </div>
      </section>
    </>
  );
}
