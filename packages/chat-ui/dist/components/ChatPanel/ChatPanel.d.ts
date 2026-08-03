import type { ReactNode } from 'react';
import type { ChatMessage, FileAttachment } from '../../types';
import { type ComposerConfig } from '../Composer/Composer';
export interface ChatPanelActions {
    onSend: (text: string, attachments?: FileAttachment[]) => void;
    onStop?: () => void;
    onRetryMessage?: (message: ChatMessage) => void | Promise<void>;
    onCopyMessage?: (message: ChatMessage) => void | Promise<void>;
    onDeleteMessage?: (message: ChatMessage) => void | Promise<void>;
    messageActionDisabled?: boolean;
}
export interface ChatPanelProps {
    messages: ChatMessage[];
    status?: 'idle' | 'connecting' | 'streaming';
    composer?: ComposerConfig;
    actions: ChatPanelActions;
    actionPrompt?: ReactNode;
    theme?: 'light' | 'dark';
    className?: string;
}
export declare function ChatPanel({ messages, status, composer, actions, actionPrompt, theme, className }: ChatPanelProps): import("react").JSX.Element;
