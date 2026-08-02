import { Check, Copy, File, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import type { FilePart } from '@agent-flow/core/messages';
import type { ChatMessage } from '../../types';
import { Button, Tooltip } from '../ui/primitives';

export interface MessageItemProps {
  message: ChatMessage;
  onRetry?: (message: ChatMessage) => void | Promise<void>;
  onCopy?: (message: ChatMessage) => void | Promise<void>;
  onDelete?: (message: ChatMessage) => void | Promise<void>;
  disabled?: boolean;
}

export function MessageItem({ message, onRetry, onCopy, onDelete, disabled }: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const user = message.role === 'user';
  const copy = async () => {
    if (onCopy) await onCopy(message);
    else await navigator.clipboard?.writeText(copyableText(message));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_500);
  };
  return (
    <article className={`chat-v2-message ${user ? 'is-user' : 'is-assistant'}`}>
      <div className="chat-v2-message-content">
        <MessageContent message={message} />
        <div className="chat-v2-message-actions">
          {!user && onRetry && <Tooltip label="Retry"><Button variant="ghost" size="icon" disabled={disabled} onClick={() => void onRetry(message)} aria-label="Retry"><RotateCcw size={14} /></Button></Tooltip>}
          <Tooltip label="Copy"><Button variant="ghost" size="icon" disabled={disabled} onClick={() => void copy()} aria-label="Copy">{copied ? <Check size={14} /> : <Copy size={14} />}</Button></Tooltip>
          {onDelete && <Tooltip label="Delete"><Button variant="ghost" size="icon" disabled={disabled} onClick={() => void onDelete(message)} aria-label="Delete"><Trash2 size={14} /></Button></Tooltip>}
        </div>
      </div>
    </article>
  );
}

function MessageContent({ message }: { message: ChatMessage }) {
  if (message.type === 'text') {
    return (
      <>
        <div className="chat-v2-markdown"><Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{message.text}</Markdown></div>
        {message.attachments?.length ? <AttachmentList attachments={message.attachments} /> : null}
      </>
    );
  }
  if (message.type === 'image') {
    const source = message.source.type === 'url'
      ? message.source.url
      : `data:${message.source.mediaType};base64,${message.source.data}`;
    return <figure className="chat-v2-image"><img src={source} alt={message.text ?? 'Attached image'} />{message.text && <figcaption>{message.text}</figcaption>}</figure>;
  }
  return null;
}

function AttachmentList({ attachments }: { attachments: FilePart[] }) {
  return (
    <div className="chat-v2-message-files">
      {attachments.map((attachment, index) => {
        const image = attachment.mimeType.startsWith('image/');
        const source = `data:${attachment.mimeType};base64,${attachment.data}`;
        return image
          ? <img key={`${attachment.mimeType}:${index}`} src={source} alt={`Attachment ${index + 1}`} />
          : <a key={`${attachment.mimeType}:${index}`} href={source} download={`attachment-${index + 1}`}><File size={15} /><span>{attachment.mimeType}</span></a>;
      })}
    </div>
  );
}

function copyableText(message: ChatMessage): string {
  if (message.type === 'text') return message.text;
  if (message.type === 'image') return message.text ?? '';
  return '';
}
