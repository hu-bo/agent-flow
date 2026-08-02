import {
  Brain,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  LoaderCircle,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import type { ChatMessage } from '../../types';
import { ToolExecution } from '../ToolExecution/ToolExecution';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/primitives';

export interface ExecutionTimelineProps {
  summary?: Extract<ChatMessage, { type: 'thinking' }>;
  activities: ChatMessage[];
}

export function ExecutionTimeline({ summary, activities }: ExecutionTimelineProps) {
  const status = resolveStatus(summary, activities);
  const automaticOpen = status === 'running' || status === 'error';
  const [open, setOpen] = useState(automaticOpen);
  const manuallyChanged = useRef(false);

  useEffect(() => {
    if (!manuallyChanged.current) setOpen(automaticOpen);
  }, [automaticOpen]);

  if (!summary && activities.length === 0) return null;
  const elapsed = formatDuration(summary?.durationMs);
  const label = status === 'running'
    ? 'Working...'
    : status === 'error'
      ? `Stopped after ${elapsed || 'a moment'}`
      : `Worked for ${elapsed || 'a moment'}`;

  return (
    <Collapsible
      open={open}
      onOpenChange={(value) => {
        manuallyChanged.current = true;
        setOpen(value);
      }}
      className={`chat-v2-execution is-${status}`}
    >
      <CollapsibleTrigger asChild>
        <button type="button" className="chat-v2-execution-trigger">
          {status === 'running'
            ? <LoaderCircle size={15} className="is-spinning" />
            : status === 'error'
              ? <CircleAlert size={15} />
              : <CheckCircle2 size={15} />}
          <span>{label}</span>
          <ChevronDown size={14} className="chat-v2-chevron" />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="chat-v2-execution-content">
        <div className="chat-v2-timeline">
          {activities.map((activity) => activity.type === 'tool_execution'
            ? <ToolExecution key={activity.uuid} message={activity} />
            : activity.type === 'thinking'
              ? <ThinkingActivity key={activity.uuid} message={activity} />
              : null)}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ThinkingActivity({ message }: { message: Extract<ChatMessage, { type: 'thinking' }> }) {
  const icon = message.kind === 'recovery'
    ? <RefreshCcw size={14} />
    : message.kind === 'verification'
      ? <ShieldCheck size={14} />
      : message.status === 'error'
        ? <CircleAlert size={14} />
        : <Brain size={14} />;
  return (
    <article className={`chat-v2-thinking is-${message.status ?? 'success'}`}>
      <span className="chat-v2-timeline-dot">{icon}</span>
      <div className="chat-v2-thinking-main">
        <div className="chat-v2-thinking-title">
          <span>{message.title ?? (message.kind === 'step' ? 'Step' : 'Thinking')}</span>
          {message.status === 'running' && <LoaderCircle size={13} className="is-spinning" />}
        </div>
        {message.text && <div className="chat-v2-thinking-body"><Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{message.text}</Markdown></div>}
        {message.items?.map((item) => (
          <details className="chat-v2-legacy-thinking" key={item.key}>
            <summary>{item.title ?? item.key}</summary>
            {item.content && <Markdown remarkPlugins={[remarkGfm]}>{item.content}</Markdown>}
          </details>
        ))}
      </div>
    </article>
  );
}

function resolveStatus(
  summary: Extract<ChatMessage, { type: 'thinking' }> | undefined,
  activities: ChatMessage[],
): 'running' | 'error' | 'success' {
  if (summary?.status === 'running' || summary?.status === 'pending') return 'running';
  if (summary?.status === 'error') return 'error';
  if (activities.some((item) => item.type === 'tool_execution' && (item.status === 'running' || item.status === 'pending'))) return 'running';
  if (activities.some((item) => item.type === 'tool_execution' && item.status === 'error')) return 'error';
  return 'success';
}

function formatDuration(ms?: number): string {
  if (ms == null) return '';
  if (ms < 1_000) return `${ms}ms`;
  if (ms < 60_000) return `${Math.max(1, Math.round(ms / 1_000))}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1_000)}s`;
}
