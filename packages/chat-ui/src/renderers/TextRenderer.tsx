import './TextRenderer.less';
import { useEffect, useMemo, useRef, useState, Children, isValidElement } from 'react';
import type { ReactNode } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { Components } from 'react-markdown';
import type { ContentRendererProps } from '../registry';
import type { TextPart } from '../types';

interface CodeBlockProps {
  children: ReactNode;
}

function detectLanguage(children: ReactNode): string {
  for (const node of Children.toArray(children)) {
    if (!isValidElement<{ className?: string }>(node)) continue;
    const className = typeof node.props.className === 'string' ? node.props.className : '';
    const matched = className.match(/language-([a-z0-9_-]+)/i);
    if (matched?.[1]) {
      return matched[1].toLowerCase();
    }
  }
  return 'text';
}

async function copyToClipboard(text: string): Promise<void> {
  if (!text) return;

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

function CodeBlock({ children }: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const resetTimerRef = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);

  const language = useMemo(() => detectLanguage(children), [children]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    const codeElement = preRef.current?.querySelector('code');
    const content = codeElement?.innerText ?? preRef.current?.innerText ?? '';
    if (!content.trim()) return;

    await copyToClipboard(content);
    setCopied(true);

    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = window.setTimeout(() => {
      setCopied(false);
      resetTimerRef.current = null;
    }, 1200);
  };

  return (
    <div className="chat-ui-code-block">
      <div className="chat-ui-code-toolbar">
        <span className="chat-ui-code-language">{language}</span>
        <button type="button" className="chat-ui-copy-btn" onClick={handleCopy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre ref={preRef}>{children}</pre>
    </div>
  );
}

export function TextRenderer({ part, message, index, context }: ContentRendererProps) {
  const { text } = part as TextPart;

  const isAssistant = message.role === 'assistant';
  const isMeta = Boolean(message.metadata?.isMeta);
  const isLatest = Boolean(context?.chatUiIsLatest);
  const typingMessageId =
    typeof context?.chatUiTypingMessageId === 'string' ? context.chatUiTypingMessageId : null;
  const shouldTypewriter =
    isAssistant && !isMeta && isLatest && typingMessageId === message.uuid && text.length > 0;

  const [displayText, setDisplayText] = useState(text);
  const animatedKeyRef = useRef<string>('');
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const animationKey = `${message.uuid}:${index}`;

    if (!shouldTypewriter) {
      setDisplayText(text);
      return;
    }

    if (animatedKeyRef.current === animationKey) {
      setDisplayText(text);
      return;
    }

    animatedKeyRef.current = animationKey;

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setDisplayText('');

    let cursor = 0;
    const tick = () => {
      cursor = Math.min(text.length, cursor + 2);
      setDisplayText(text.slice(0, cursor));

      if (cursor >= text.length && intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    tick();
    intervalRef.current = window.setInterval(tick, 18);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [index, message.uuid, shouldTypewriter, text]);

  const markdownComponents = useMemo<Components>(
    () => ({
      pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
    }),
    [],
  );

  return (
    <div className="chat-ui-markdown break-words">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={markdownComponents}
      >
        {displayText}
      </Markdown>
    </div>
  );
}
