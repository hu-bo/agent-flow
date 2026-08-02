import type { ChatMessage } from '../../types';
import type { ChatTurn } from '../../turns';
import { ExecutionTimeline } from '../ExecutionTimeline/ExecutionTimeline';
import { MessageItem } from '../MessageItem/MessageItem';

export interface TurnGroupProps {
  turn: ChatTurn;
  onRetry?: (message: ChatMessage) => void | Promise<void>;
  onCopy?: (message: ChatMessage) => void | Promise<void>;
  onDelete?: (message: ChatMessage) => void | Promise<void>;
  disabled?: boolean;
}

export function TurnGroup({ turn, onRetry, onCopy, onDelete, disabled }: TurnGroupProps) {
  return (
    <section className="chat-v2-turn" data-turn-id={turn.id}>
      {turn.user && <MessageItem message={turn.user} onCopy={onCopy} onDelete={onDelete} disabled={disabled} />}
      <div className="chat-v2-assistant-turn">
        <ExecutionTimeline summary={turn.summary} activities={turn.activities} />
        {turn.responses.map((message) => <MessageItem key={message.uuid} message={message} onRetry={onRetry} onCopy={onCopy} onDelete={onDelete} disabled={disabled} />)}
      </div>
    </section>
  );
}
