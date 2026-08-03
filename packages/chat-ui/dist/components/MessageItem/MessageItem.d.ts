import type { ChatMessage } from '../../types';
export interface MessageItemProps {
    message: ChatMessage;
    onRetry?: (message: ChatMessage) => void | Promise<void>;
    onCopy?: (message: ChatMessage) => void | Promise<void>;
    onDelete?: (message: ChatMessage) => void | Promise<void>;
    disabled?: boolean;
}
export declare function MessageItem({ message, onRetry, onCopy, onDelete, disabled }: MessageItemProps): import("react").JSX.Element;
