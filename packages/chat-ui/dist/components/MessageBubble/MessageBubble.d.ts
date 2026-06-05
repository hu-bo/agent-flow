import './MessageBubble.less';
import type { ChatMessage } from '../../types';
import { ContentRendererRegistry, type ContentRendererContext } from '../../registry';
interface MessageBubbleProps {
    message: ChatMessage;
    isStreaming?: boolean;
    isLatest?: boolean;
    registry?: ContentRendererRegistry;
    rendererContext?: ContentRendererContext;
    onRetry?: (message: ChatMessage) => void | Promise<void>;
    onCopy?: (message: ChatMessage) => void | Promise<void>;
    onDelete?: (message: ChatMessage) => void | Promise<void>;
    actionDisabled?: boolean;
}
export declare function MessageBubble({ message, isStreaming, isLatest, registry, rendererContext, onRetry, onCopy, onDelete: _onDelete, actionDisabled, }: MessageBubbleProps): import("react").JSX.Element;
export {};
