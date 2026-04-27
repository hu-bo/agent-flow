import './InputArea.less';
import { useRef, useState, type KeyboardEvent } from 'react';
import type {
  ChatModelOption,
  FileAttachment,
  ReasoningEffort,
  TokenUsageSummary,
} from '../../types';
import { SelectField, type SelectFieldOption } from '../SelectField/SelectField';

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
  const currentModelId = selectedModel ?? modelOptions?.[0]?.modelId ?? '';
  const activeProvider = modelOptions?.find((option) => option.modelId === currentModelId)?.provider;
  const modelSelectOptions: SelectFieldOption[] =
    modelOptions?.map((model) => ({ value: model.modelId, label: model.label })) ?? [];
  const reasoningSelectOptions: SelectFieldOption[] = REASONING_OPTIONS;
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
            {modelOptions && modelOptions.length > 0 && (
              <>
                <SelectField
                  value={currentModelId}
                  options={modelSelectOptions}
                  onChange={(value) => onModelChange?.(value)}
                  disabled={controlsDisabled}
                  ariaLabel="Model selection"
                  wrapperClassName="min-w-40 max-w-[min(15rem,56vw)]"
                />
                {activeProvider && (
                  <span className="hidden h-8 items-center rounded-xl bg-[color:var(--chat-panel-soft)] px-2.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--chat-text-subtle)] shadow-[inset_0_1px_0_rgba(255,255,255,0.68)] sm:inline-flex">
                    {activeProvider}
                  </span>
                )}
              </>
            )}

            <SelectField
              value={reasoningEffort}
              options={reasoningSelectOptions}
              onChange={(value) => onReasoningEffortChange?.(value as ReasoningEffort)}
              disabled={controlsDisabled}
              ariaLabel="Reasoning effort"
              wrapperClassName="min-w-24 max-w-[min(9rem,36vw)]"
            />
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
