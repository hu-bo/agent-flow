import type { ChatMessage } from '../../types';
import type { ChatTurn } from '../../turns';
export interface TurnGroupProps {
    turn: ChatTurn;
    onRetry?: (message: ChatMessage) => void | Promise<void>;
    onCopy?: (message: ChatMessage) => void | Promise<void>;
    onDelete?: (message: ChatMessage) => void | Promise<void>;
    disabled?: boolean;
}
export declare function TurnGroup({ turn, onRetry, onCopy, onDelete, disabled }: TurnGroupProps): import("react").JSX.Element;
