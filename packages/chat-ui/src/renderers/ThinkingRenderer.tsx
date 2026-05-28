import './TextRenderer.less';
import './ThinkingRenderer.less';
import { useMemo, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { ContentRendererProps } from '../registry';
import type { ThinkingPart, ThoughtChainItem } from '../types';
import { ThoughtChain } from '../components/ThoughtChain/ThoughtChain';

function countByStatus(items: ThoughtChainItem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = item.status ?? 'success';
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export function ThinkingRenderer({ part, message, index }: ContentRendererProps) {
  const thinking = part as ThinkingPart;
  const items: ThoughtChainItem[] =
    thinking.items && thinking.items.length > 0
      ? thinking.items
      : [
          {
            key: 'thinking',
            title: thinking.title ?? 'Thinking',
            description: thinking.description,
            content: thinking.text,
            footer: thinking.footer,
            icon: thinking.icon,
            status: thinking.status ?? 'success',
            durationMs: thinking.durationMs,
          },
        ];

  const summaryTitle = thinking.title ?? (thinking.items && thinking.items.length > 0 ? 'Trace' : 'Thinking');
  const summaryMeta = useMemo(() => {
    const counts = countByStatus(items);
    const bits: string[] = [];
    if (thinking.durationMs != null) {
      bits.push(thinking.durationMs < 1000 ? `${thinking.durationMs}ms` : `${(thinking.durationMs / 1000).toFixed(1)}s`);
    }
    if (counts.running) bits.push(`running=${counts.running}`);
    if (counts.error) bits.push(`error=${counts.error}`);
    if (items.length > 0) bits.push(`items=${items.length}`);
    return bits.join('  ');
  }, [items, thinking.durationMs]);

  const [open, setOpen] = useState<boolean>(Boolean(thinking.defaultOpen));
  const contentId = `chat-ui-thinking-${message.uuid}-${index}`;

  const defaultExpandedKeys =
    thinking.defaultExpandedKeys ??
    (thinking.defaultOpen ? items.map((item) => item.key) : undefined);

  return (
    <div className="chat-ui-thinking-wrap">
      <button
        type="button"
        className={`chat-ui-thinking-toggle${open ? ' is-open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={contentId}
      >
        <span className="chat-ui-thinking-arrow" aria-hidden="true">
          {open ? 'v' : '>'}
        </span>
        <span className="chat-ui-thinking-label">{summaryTitle}</span>
        {summaryMeta ? <span className="chat-ui-thinking-meta">{summaryMeta}</span> : null}
      </button>
      <div id={contentId} hidden={!open}>
        <ThoughtChain
          items={items}
          defaultExpandedKeys={defaultExpandedKeys}
          className="chat-ui-thinking"
          classNames={{ content: 'chat-ui-thinking-body chat-ui-markdown' }}
          renderContent={(content) =>
            typeof content === 'string' ? (
              <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {content}
              </Markdown>
            ) : (
              content
            )
          }
        />
      </div>
    </div>
  );
}
