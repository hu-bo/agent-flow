import './ToolResultRenderer.less';
import { useState } from 'react';
import type { ContentRendererProps } from '../registry';
import type { ToolResultPart } from '../types';

function formatOutput(value: unknown): string {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function ToolResultRenderer({ part }: ContentRendererProps) {
  const { output, isError } = part as ToolResultPart;
  const [open, setOpen] = useState(false);
  const text = formatOutput(output);
  const isLong = text.length > 200;

  return (
    <div className="chat-ui-tool-block">
      <button
        onClick={() => setOpen(!open)}
        className={`chat-ui-tool-toggle ${isError ? 'is-error' : ''}`}
        type="button"
      >
        <span className="chat-ui-tool-arrow">{open ? 'v' : '>'}</span>
        <span>Result{isError ? ' (error)' : ''}</span>
      </button>

      {(open || !isLong) && <pre className={`chat-ui-tool-payload ${isError ? 'is-error' : ''}`}>{text}</pre>}

      {!open && isLong && <span className="chat-ui-tool-hint">({text.length} chars - click to expand)</span>}
    </div>
  );
}
