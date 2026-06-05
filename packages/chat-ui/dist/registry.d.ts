import type { ComponentType } from 'react';
import type { ChatContentPart, ChatMessage } from './types';
export type ContentRendererContext = Record<string, unknown>;
export type ContentRendererProps<T extends ChatContentPart = ChatContentPart> = {
    part: T;
    message: ChatMessage;
    index: number;
    context?: ContentRendererContext;
};
export type ContentRenderer = ComponentType<ContentRendererProps>;
export declare class ContentRendererRegistry {
    private renderers;
    register(type: string, renderer: ContentRenderer): this;
    get(type: string): ContentRenderer | null;
    has(type: string): boolean;
}
export declare function createDefaultRegistry(): ContentRendererRegistry;
