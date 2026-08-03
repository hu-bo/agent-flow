import type { ToolExecutionMessage } from '@agent-flow/core/messages';
export interface ToolExecutionProps {
    message: ToolExecutionMessage;
}
export declare function ToolExecution({ message }: ToolExecutionProps): import("react").JSX.Element;
