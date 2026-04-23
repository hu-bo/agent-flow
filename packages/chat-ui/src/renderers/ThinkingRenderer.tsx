import './TextRenderer.less';
import './ThinkingRenderer.less';
import { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { ContentRendererProps } from '../registry';
import type { ThinkingPart } from '../types';

export function ThinkingRenderer({ part }: ContentRendererProps) {
  const { text, durationMs } = part as ThinkingPart;
  const [open, setOpen] = useState(false);

  const durationLabel = durationMs != null ? `${(durationMs / 1000).toFixed(1)}s` : undefined;

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="chat-ui-thinking"
    >
      <summary className="chat-ui-thinking-summary">
        <span className="chat-ui-thinking-icon">THINK</span>
        <span>Thinking</span>
        {durationLabel && <span className="chat-ui-thinking-duration">({durationLabel})</span>}
      </summary>
      <div className="chat-ui-thinking-body chat-ui-markdown">
        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {text}
        </Markdown>
      </div>
    </details>
  );
}
