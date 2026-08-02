import { ArrowUp, File, Paperclip, Square, X } from 'lucide-react';
import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import type { ChatOption, ChatSuggestion, FileAttachment, ReasoningEffort, TokenUsageSummary } from '../../types';
import { Button, Textarea, Tooltip } from '../ui/primitives';

export interface ComposerConfig {
  selectedModel?: string;
  modelOptions?: ChatOption[];
  onModelChange?: (value: string) => void;
  reasoningEffort?: ReasoningEffort;
  onReasoningEffortChange?: (effort: ReasoningEffort) => void;
  tokenUsage?: TokenUsageSummary;
  suggestions?: ChatSuggestion[];
  onSuggestionSelect?: (suggestion: ChatSuggestion) => void;
  onFileSelect?: (files: File[]) => Promise<FileAttachment[]>;
  onCompactContext?: () => void | Promise<void>;
  compactContextDisabled?: boolean;
  compactContextLabel?: string;
  placeholder?: string;
}

export interface ComposerProps extends ComposerConfig {
  status: 'idle' | 'connecting' | 'streaming';
  onSend: (text: string, attachments?: FileAttachment[]) => void;
  onStop?: () => void;
}

function tokens(value?: number | null): string {
  if (value == null) return '--';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export function Composer({ status, onSend, onStop, selectedModel, modelOptions, onModelChange, reasoningEffort = 'medium', onReasoningEffortChange, tokenUsage, suggestions, onSuggestionSelect, onFileSelect, onCompactContext, compactContextDisabled, compactContextLabel = 'Compact', placeholder = 'Ask anything' }: ComposerProps) {
  const [value, setValue] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const busy = status !== 'idle';
  const send = () => {
    const text = value.trim();
    if (!text || busy) return;
    onSend(text, attachments.length ? attachments : undefined);
    setValue(''); setAttachments([]);
  };
  const keyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); } };
  const files = async (event: ChangeEvent<HTMLInputElement>) => { if (!event.target.files?.length || !onFileSelect) return; const next = await onFileSelect(Array.from(event.target.files)); setAttachments((current) => [...current, ...next]); event.target.value = ''; };
  return (
    <div className="chat-v2-composer-shell">
      <div className="chat-v2-composer">
        {suggestions?.length ? <div className="chat-v2-suggestions">{suggestions.map((item, index) => <Button key={item.id ?? index} variant="outline" size="sm" disabled={busy} title={item.description ?? item.prompt} onClick={() => { onSuggestionSelect?.(item); if (item.behavior === 'fill') setValue(item.prompt); else onSend(item.prompt); }}>{item.label}</Button>)}</div> : null}
        {attachments.length ? <div className="chat-v2-attachments">{attachments.map((item) => <div className="chat-v2-attachment" key={item.id}>{item.previewUrl ? <img src={item.previewUrl} alt="" /> : <File size={16} />}<span>{item.name}</span><Button variant="ghost" size="icon" onClick={() => setAttachments((current) => current.filter((file) => file.id !== item.id))} aria-label={`Remove ${item.name}`}><X size={13} /></Button></div>)}</div> : null}
        <Textarea rows={2} value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={keyDown} disabled={status === 'connecting'} placeholder={status === 'connecting' ? 'Connecting…' : placeholder} />
        <div className="chat-v2-composer-toolbar">
          <div className="chat-v2-composer-left">
            {onFileSelect && <><Tooltip label="Attach files"><Button variant="ghost" size="icon" disabled={busy} onClick={() => fileRef.current?.click()} aria-label="Attach files"><Paperclip size={16} /></Button></Tooltip><input ref={fileRef} className="chat-v2-file-input" type="file" multiple onChange={files} /></>}
            {modelOptions?.length ? <select className="chat-v2-native-select" value={selectedModel ?? modelOptions[0]?.value} disabled={busy} onChange={(event) => onModelChange?.(event.target.value)} aria-label="Model">{modelOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select> : null}
            <select className="chat-v2-native-select" value={reasoningEffort} disabled={busy} onChange={(event) => onReasoningEffortChange?.(event.target.value as ReasoningEffort)} aria-label="Reasoning effort"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
          </div>
          <div className="chat-v2-composer-right">
            {onCompactContext && <Button variant="ghost" size="sm" disabled={compactContextDisabled ?? busy} onClick={() => void onCompactContext()}>{compactContextLabel}</Button>}
            {tokenUsage && <span className="chat-v2-token-usage">{tokens(tokenUsage.usedTokens)} / {tokens(tokenUsage.tokenBudget)}</span>}
            {status === 'streaming' ? <Button size="icon" variant="default" disabled={!onStop} onClick={onStop} aria-label="Stop generating"><Square size={13} fill="currentColor" /></Button> : <Button size="icon" variant="default" disabled={!value.trim() || busy} onClick={send} aria-label="Send message"><ArrowUp size={18} /></Button>}
          </div>
        </div>
      </div>
    </div>
  );
}
