import './MessageList.less';
import type { ChatMessage } from '../../types';
import type { ContentRendererContext, ContentRendererRegistry } from '../../registry';
interface MessageListProps {
    messages: ChatMessage[];
    isStreaming?: boolean;
    registry?: ContentRendererRegistry;
    rendererContext?: ContentRendererContext;
    onRetryMessage?: (message: ChatMessage) => void | Promise<void>;
    onCopyMessage?: (message: ChatMessage) => void | Promise<void>;
    onDeleteMessage?: (message: ChatMessage) => void | Promise<void>;
    messageActionDisabled?: boolean;
}
export declare function MessageList({ messages, isStreaming, registry, rendererContext, onRetryMessage, onCopyMessage, onDeleteMessage, messageActionDisabled, }: MessageListProps): import("react").JSX.Element;
export {};
