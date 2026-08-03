import type { ChatMessage } from '../../types';
export interface ExecutionTimelineProps {
    summary?: Extract<ChatMessage, {
        type: 'thinking';
    }>;
    activities: ChatMessage[];
}
export declare function ExecutionTimeline({ summary, activities }: ExecutionTimelineProps): import("react").JSX.Element | null;
