import { useState, useRef, type KeyboardEvent } from 'react';
import type { FileAttachment } from '../types';

interface InputAreaProps {
  onSend: (text: string, attachments?: FileAttachment[]) => void;
  isStreaming?: boolean;
  isConnecting?: boolean;
  onFileSelect?: (files: File[]) => Promise<FileAttachment[]>;
}

export function InputArea({ onSend, isStreaming, isConnecting, onFileSelect }: InputAreaProps) {
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

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs"
            >
              {att.previewUrl ? (
                <img src={att.previewUrl} alt="" className="h-6 w-6 rounded object-cover" />
              ) : (
                <span>📎</span>
              )}
              <span className="max-w-[120px] truncate text-gray-600">{att.name}</span>
              <button
                onClick={() => removeAttachment(att.id)}
                className="ml-0.5 text-gray-400 hover:text-red-500"
                aria-label={`Remove ${att.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {onFileSelect && (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="self-end rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50"
              aria-label="Attach file"
            >
              📎
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </>
        )}
        <textarea
          className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-400 leading-snug"
          rows={2}
          placeholder={isConnecting ? 'Connecting...' : 'Type a message...'}
          disabled={isConnecting}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="self-end rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-default"
          disabled={disabled}
          onClick={handleSend}
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
}
