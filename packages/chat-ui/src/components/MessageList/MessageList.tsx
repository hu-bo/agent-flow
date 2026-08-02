import { ArrowDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMessage } from '../../types';
import { groupMessagesIntoTurns } from '../../turns';
import { TurnGroup } from '../TurnGroup/TurnGroup';
import { Button } from '../ui/primitives';

export interface MessageListProps {
  messages: ChatMessage[];
  onRetryMessage?: (message: ChatMessage) => void | Promise<void>;
  onCopyMessage?: (message: ChatMessage) => void | Promise<void>;
  onDeleteMessage?: (message: ChatMessage) => void | Promise<void>;
  messageActionDisabled?: boolean;
}

export function MessageList({ messages, onRetryMessage, onCopyMessage, onDeleteMessage, messageActionDisabled }: MessageListProps) {
  const turns = useMemo(() => groupMessagesIntoTurns(messages), [messages]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);
  const [pinned, setPinned] = useState(true);
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const element = viewportRef.current;
    if (element) element.scrollTo({ top: element.scrollHeight, behavior });
  };

  useEffect(() => { if (pinnedRef.current) scrollToBottom(messages.length < 2 ? 'auto' : 'smooth'); }, [messages]);

  return (
    <div className="chat-v2-list-shell">
      <div ref={viewportRef} className="chat-v2-list" onScroll={(event) => { const element = event.currentTarget; const next = element.scrollHeight - element.scrollTop - element.clientHeight < 96; pinnedRef.current = next; setPinned(next); }}>
        <div className="chat-v2-list-inner">
          {turns.length === 0 && <div className="chat-v2-empty"><strong>Start a conversation</strong><span>Ask a question, explore a repository, or run a task.</span></div>}
          {turns.map((turn) => <TurnGroup key={turn.id} turn={turn} onRetry={onRetryMessage} onCopy={onCopyMessage} onDelete={onDeleteMessage} disabled={messageActionDisabled} />)}
        </div>
      </div>
      {!pinned && <Button className="chat-v2-scroll-bottom" variant="outline" size="icon" onClick={() => { pinnedRef.current = true; setPinned(true); scrollToBottom(); }} aria-label="Scroll to bottom"><ArrowDown size={16} /></Button>}
    </div>
  );
}
