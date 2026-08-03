import type { ChatOption, ChatSuggestion, FileAttachment, ReasoningEffort, TokenUsageSummary } from '../../types';
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
export declare function Composer({ status, onSend, onStop, selectedModel, modelOptions, onModelChange, reasoningEffort, onReasoningEffortChange, tokenUsage, suggestions, onSuggestionSelect, onFileSelect, onCompactContext, compactContextDisabled, compactContextLabel, placeholder }: ComposerProps): import("react").JSX.Element;
