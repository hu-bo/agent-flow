import { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { ContentRendererProps } from '../registry';
import type { ThinkingPart } from '../types';

export function ThinkingRenderer({ part }: ContentRendererProps) {
  const { text, durationMs } = part as ThinkingPart;
  const [open, setOpen] = useState(false);

  const durationLabel = durationMs != null
    ? `${(durationMs / 1000).toFixed(1)}s`
    : undefined;

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="my-1 rounded-lg border border-gray-200 bg-gray-50"
    >
      <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 select-none">
        <span className="text-base">💭</span>
        <span>Thinking</span>
        {durationLabel && (
          <span className="text-xs text-gray-400">({durationLabel})</span>
        )}
      </summary>
      <div className="prose prose-sm max-w-none px-3 pb-3 text-gray-600">
        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {text}
        </Markdown>
      </div>
    </details>
  );
}
