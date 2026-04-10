import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { ContentRendererProps } from '../registry';
import type { TextPart } from '../types';

export function TextRenderer({ part }: ContentRendererProps) {
  const { text } = part as TextPart;
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert break-words">
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {text}
      </Markdown>
    </div>
  );
}
