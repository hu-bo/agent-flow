import type { ChatMessage } from '../../types';
export interface MessageListProps {
    messages: ChatMessage[];
    onRetryMessage?: (message: ChatMessage) => void | Promise<void>;
    onCopyMessage?: (message: ChatMessage) => void | Promise<void>;
    onDeleteMessage?: (message: ChatMessage) => void | Promise<void>;
    messageActionDisabled?: boolean;
}
export declare function MessageList({ messages, onRetryMessage, onCopyMessage, onDeleteMessage, messageActionDisabled }: MessageListProps): import("react").JSX.Element;
