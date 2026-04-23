import './InputArea.less';
import { useRef, useState, type KeyboardEvent } from 'react';
import type {
  ChatModelOption,
  FileAttachment,
  ReasoningEffort,
  TokenUsageSummary,
} from '../../types';

const REASONING_OPTIONS: Array<{ value: ReasoningEffort; label: string }> = [
  { value: 'low', label: 'LOW' },
  { value: 'medium', label: 'MEDIUM' },
  { value: 'high', label: 'HIGH' },
];

function formatTokenCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

interface InputAreaProps {
  onSend: (text: string, attachments?: FileAttachment[]) => void;
  selectedModel?: string;
  modelOptions?: ChatModelOption[];
  onModelChange?: (modelId: string) => void;
  reasoningEffort?: ReasoningEffort;
  onReasoningEffortChange?: (effort: ReasoningEffort) => void;
  tokenUsage?: TokenUsageSummary;
  isStreaming?: boolean;
  isConnecting?: boolean;
  onFileSelect?: (files: File[]) => Promise<FileAttachment[]>;
}

export function InputArea({
  onSend,
  selectedModel,
  modelOptions,
  onModelChange,
  reasoningEffort = 'medium',
  onReasoningEffortChange,
  tokenUsage,
  isStreaming,
  isConnecting,
  onFileSelect,
}: InputAreaProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    onSend(text, attachments.length > 0 ? attachments : undefined);
    setInput('');
    setAttachments([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !onFileSelect) return;
    const selected = await onFileSelect(Array.from(files));
    setAttachments((prev) => [...prev, ...selected]);
    // Reset so the same file can be selected again
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const disabled = isConnecting || isStreaming || !input.trim();
  const controlsDisabled = isConnecting || isStreaming;
  const currentModelId = selectedModel ?? modelOptions?.[0]?.modelId;
  const activeProvider = modelOptions?.find((option) => option.modelId === currentModelId)?.provider;
  const usageUsed = tokenUsage?.usedTokens ?? 0;
  const usageRemaining =
    tokenUsage?.remainingTokens === null || tokenUsage?.remainingTokens === undefined
      ? '--'
      : formatTokenCount(Math.max(0, tokenUsage.remainingTokens));

  return (
    <div className="chat-ui-input-shell">
      <div className="chat-ui-composer">
        <textarea
          className="chat-ui-textarea"
          rows={2}
          placeholder={isConnecting ? 'Connecting...' : 'Type a message...'}
          disabled={isConnecting}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {attachments.length > 0 && (
          <div className="chat-ui-attachments">
            {attachments.map((att) => (
              <div key={att.id} className="chat-ui-attachment-chip">
                {att.previewUrl ? (
                  <img src={att.previewUrl} alt="" className="chat-ui-attachment-thumb" />
                ) : (
                  <span className="chat-ui-attachment-icon">FILE</span>
                )}
                <span className="chat-ui-attachment-name">{att.name}</span>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="chat-ui-attachment-remove"
                  aria-label={`Remove ${att.name}`}
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="chat-ui-control-row">
          <div className="chat-ui-control-left">
            {onFileSelect && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="chat-ui-file-trigger"
                aria-label="Attach file"
                disabled={controlsDisabled}
              >
                +
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="chat-ui-file-input"
              onChange={handleFileChange}
            />

            {activeProvider && <span className="chat-ui-provider-badge">{activeProvider}</span>}

            {modelOptions && modelOptions.length > 0 && (
              <select
                className="chat-ui-control-select"
                value={currentModelId}
                onChange={(e) => onModelChange?.(e.target.value)}
                disabled={controlsDisabled}
                aria-label="Model selection"
              >
                {modelOptions.map((model) => (
                  <option key={model.modelId} value={model.modelId}>
                    {model.label}
                  </option>
                ))}
              </select>
            )}

            <select
              className="chat-ui-control-select"
              value={reasoningEffort}
              onChange={(e) => onReasoningEffortChange?.(e.target.value as ReasoningEffort)}
              disabled={controlsDisabled}
              aria-label="Reasoning effort"
            >
              {REASONING_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  REASONING {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="chat-ui-control-right">
            <span className="chat-ui-token-usage">
              Tokens {formatTokenCount(usageUsed)} / {usageRemaining}
            </span>

            <button
              className="chat-ui-send-btn"
              disabled={disabled}
              onClick={handleSend}
              aria-label="Send message"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
