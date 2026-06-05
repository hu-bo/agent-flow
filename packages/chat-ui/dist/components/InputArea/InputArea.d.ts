import './InputArea.less';
import type { ChatOption, ChatSuggestion, FileAttachment, ReasoningEffort, TokenUsageSummary } from '../../types';
interface InputAreaProps {
    onSend: (text: string, attachments?: FileAttachment[]) => void;
    selectedModel?: string;
    modelOptions?: ChatOption[];
    onModelChange?: (value: string) => void;
    reasoningEffort?: ReasoningEffort;
    onReasoningEffortChange?: (effort: ReasoningEffort) => void;
    tokenUsage?: TokenUsageSummary;
    isStreaming?: boolean;
    isConnecting?: boolean;
    onCompactContext?: () => void | Promise<void>;
    compactContextDisabled?: boolean;
    compactContextLabel?: string;
    onFileSelect?: (files: File[]) => Promise<FileAttachment[]>;
    suggestions?: ChatSuggestion[];
    onSuggestionSelect?: (suggestion: ChatSuggestion) => void;
}
export declare function InputArea({ onSend, selectedModel, modelOptions, onModelChange, reasoningEffort, onReasoningEffortChange, tokenUsage, isStreaming, isConnecting, onCompactContext, compactContextDisabled, compactContextLabel, onFileSelect, suggestions, onSuggestionSelect, }: InputAreaProps): import("react").JSX.Element;
export {};
