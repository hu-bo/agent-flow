export interface ActionPromptToggle {
    id: string;
    label: string;
    description?: string;
    defaultSelected?: boolean;
    disabled?: boolean;
}
export interface ActionPromptCustomInput {
    label?: string;
    placeholder?: string;
    defaultValue?: string;
    required?: boolean;
    minRows?: number;
}
export interface ActionPromptOption {
    id: string;
    title: string;
    description?: string;
    recommended?: boolean;
    toggleGroupLabel?: string;
    toggles?: ActionPromptToggle[];
    customInput?: ActionPromptCustomInput;
    disabled?: boolean;
}
export interface ActionPromptSubmitPayload {
    optionId: string;
    selectedToggleIds: string[];
    customInput?: string;
}
export interface ActionPromptProps {
    title?: string;
    question: string;
    options: ActionPromptOption[];
    defaultOptionId?: string;
    submitLabel?: string;
    cancelLabel?: string;
    disabled?: boolean;
    className?: string;
    onSubmit: (payload: ActionPromptSubmitPayload) => void | Promise<void>;
    onCancel?: () => void | Promise<void>;
}
export declare function ActionPrompt({ title, question, options, defaultOptionId, submitLabel, cancelLabel, disabled, className, onSubmit, onCancel, }: ActionPromptProps): import("react").JSX.Element;
