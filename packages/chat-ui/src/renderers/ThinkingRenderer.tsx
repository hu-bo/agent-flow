import './TextRenderer.less';
import './ThinkingRenderer.less';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { ContentRendererProps } from '../registry';
import type { ThinkingPart, ThoughtChainItem } from '../types';
import { ThoughtChain } from '../components/ThoughtChain/ThoughtChain';

export function ThinkingRenderer({ part }: ContentRendererProps) {
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

  return (
    <ThoughtChain
      items={items}
      defaultExpandedKeys={thinking.defaultOpen ? items.map((item) => item.key) : undefined}
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
  );
}
