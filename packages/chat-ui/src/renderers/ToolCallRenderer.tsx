import './ToolCallRenderer.less';
import { useState } from 'react';
import type { ContentRendererProps } from '../registry';
import type { ToolCallPart } from '../types';

function formatOutput(value: unknown): string {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readCommandArgs(value: unknown): { command: string; args: string[] } | null {
  if (!isRecord(value) || typeof value.command !== 'string') {
    return null;
  }
  const args = Array.isArray(value.args) ? value.args.map((item) => String(item)) : [];
  return { command: value.command, args };
}

function summarizeCommand(input: unknown): string | null {
  const direct = readCommandArgs(input);
  if (direct) {
    return `${direct.command}${direct.args.length > 0 ? ` ${direct.args.join(' ')}` : ''}`;
  }

  if (isRecord(input) && isRecord(input.task)) {
    const nested = readCommandArgs(input.task);
    if (nested) {
      return `${nested.command}${nested.args.length > 0 ? ` ${nested.args.join(' ')}` : ''}`;
    }
  }

  return null;
}

function truncate(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars)}...`;
}

export function ToolCallRenderer({ part }: ContentRendererProps) {
  const { toolName, input } = part as ToolCallPart;
  const [open, setOpen] = useState(false);
  const commandSummary = summarizeCommand(input);
  const title = commandSummary
    ? `${toolName} :: ${truncate(commandSummary, 120)}`
    : toolName;

  return (
    <div className="chat-ui-tool-block">
      <button onClick={() => setOpen(!open)} className="chat-ui-tool-toggle" type="button">
        <span className="chat-ui-tool-arrow">{open ? 'v' : '>'}</span>
        <span>Tool: {title}</span>
      </button>
      {open && <pre className="chat-ui-tool-payload">{formatOutput(input)}</pre>}
    </div>
  );
}
