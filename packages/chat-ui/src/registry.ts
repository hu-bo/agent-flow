import type { ComponentType } from 'react';
import type { ChatContentPart } from './types';

export type ContentRendererProps<T extends ChatContentPart = ChatContentPart> = {
  part: T;
};

export type ContentRenderer = ComponentType<ContentRendererProps>;

export class ContentRendererRegistry {
  private renderers = new Map<string, ContentRenderer>();

  register(type: string, renderer: ContentRenderer): this {
    this.renderers.set(type, renderer);
    return this;
  }

  get(type: string): ContentRenderer | null {
    return this.renderers.get(type) ?? null;
  }

  has(type: string): boolean {
    return this.renderers.has(type);
  }
}

import { TextRenderer } from './renderers/TextRenderer';
import { ThinkingRenderer } from './renderers/ThinkingRenderer';
import { ImageRenderer } from './renderers/ImageRenderer';
import { CodeDiffRenderer } from './renderers/CodeDiffRenderer';
import { ToolCallRenderer } from './renderers/ToolCallRenderer';
import { ToolResultRenderer } from './renderers/ToolResultRenderer';
import { FileAttachmentRenderer } from './renderers/FileAttachmentRenderer';

export function createDefaultRegistry(): ContentRendererRegistry {
  return new ContentRendererRegistry()
    .register('text', TextRenderer)
    .register('thinking', ThinkingRenderer)
    .register('image', ImageRenderer)
    .register('code-diff', CodeDiffRenderer)
    .register('tool-call', ToolCallRenderer)
    .register('tool-result', ToolResultRenderer)
    .register('file', FileAttachmentRenderer);
}
