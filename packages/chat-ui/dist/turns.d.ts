import type { ChatMessage } from './types';
export interface ChatTurn {
    id: string;
    user?: ChatMessage;
    summary?: Extract<ChatMessage, {
        type: 'thinking';
    }>;
    activities: ChatMessage[];
    responses: ChatMessage[];
}
export declare function groupMessagesIntoTurns(messages: ChatMessage[]): ChatTurn[];
