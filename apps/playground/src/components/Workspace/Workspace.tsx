import { ChatPanel } from '@agent-flow/chat-ui';
import type {
  ChatMessage,
  ChatModelOption,
  FileAttachment,
  ReasoningEffort,
  TokenUsageSummary,
} from '@agent-flow/chat-ui';
import './Workspace.less';

export type WorkspaceMode = 'chat' | 'agent' | 'flow';
type NoticeKind = 'success' | 'error';

interface WorkspaceProps {
  mode: WorkspaceMode;
  statusLabel: string;
  activeSessionId: string | null;
  selectedModel?: string;
  modelOptions?: ChatModelOption[];
  reasoningEffort?: ReasoningEffort;
  messages: ChatMessage[];
  isStreaming: boolean;
  isConnecting: boolean;
  onModelChange?: (modelId: string) => void;
  onReasoningEffortChange?: (effort: ReasoningEffort) => void;
  onSend: (text: string, attachments?: FileAttachment[]) => void;
  onFileSelect?: (files: File[]) => Promise<FileAttachment[]>;
  onCompact?: () => void;
  compactDisabled?: boolean;
  tokenUsage?: TokenUsageSummary;
  notice?: { kind: NoticeKind; message: string } | null;
}

const WORKSPACE_META: Record<WorkspaceMode, { path: string; title: string }> = {
  chat: { path: 'Workspace / Chat', title: 'AGENT_COLLAB_LIGHT' },
  agent: { path: 'Workspace / Agent', title: 'AGENT_RUNTIME' },
  flow: { path: 'Workspace / Flow', title: 'FLOW_STUDIO' },
};

export function Workspace({
  mode,
  statusLabel,
  activeSessionId,
  selectedModel,
  modelOptions,
  reasoningEffort,
  messages,
  isStreaming,
  isConnecting,
  onModelChange,
  onReasoningEffortChange,
  onSend,
  onFileSelect,
  onCompact,
  compactDisabled,
  tokenUsage,
  notice,
}: WorkspaceProps) {
  const meta = WORKSPACE_META[mode];
  const showCompact = mode === 'chat';

  return (
    <main className="workspace-main">
      <header className="workspace-header">
        <div className="workspace-header-left">
          <span className="workspace-path">{meta.path}</span>
          <h1 className="workspace-title">{meta.title}</h1>
        </div>
        <div className="workspace-header-right">
          {showCompact && (
            <button className="workspace-action-btn" onClick={onCompact} disabled={compactDisabled}>
              Compact Context
            </button>
          )}
          <span className="workspace-status">{statusLabel}</span>
        </div>
      </header>

      <section className="workspace-canvas">
        {notice && <div className={`workspace-notice workspace-notice-${notice.kind}`}>{notice.message}</div>}

        {mode === 'chat' ? (
          <ChatPanel
            className="playground-chat-panel"
            messages={messages}
            onSend={onSend}
            selectedModel={selectedModel}
            modelOptions={modelOptions}
            onModelChange={onModelChange}
            reasoningEffort={reasoningEffort}
            onReasoningEffortChange={onReasoningEffortChange}
            tokenUsage={tokenUsage}
            isStreaming={isStreaming}
            isConnecting={isConnecting}
            onFileSelect={onFileSelect}
          />
        ) : (
          <div className="workspace-placeholder">
            <strong>{meta.title}</strong>
            <span>Workspace is ready, features will be added here.</span>
          </div>
        )}
      </section>

      <footer className="workspace-footer">
        <span>Session: {activeSessionId ? activeSessionId.slice(0, 8) : 'NONE'}</span>
        <span>Model: {selectedModel || 'DEFAULT'}</span>
        <span>Messages: {messages.length}</span>
      </footer>
    </main>
  );
}
