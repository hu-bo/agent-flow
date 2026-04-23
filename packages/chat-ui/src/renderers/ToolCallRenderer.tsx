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

export function ToolCallRenderer({ part }: ContentRendererProps) {
  const { toolName, input } = part as ToolCallPart;
  const [open, setOpen] = useState(false);

  return (
    <div className="chat-ui-tool-block">
      <button onClick={() => setOpen(!open)} className="chat-ui-tool-toggle" type="button">
        <span className="chat-ui-tool-arrow">{open ? 'v' : '>'}</span>
        <span>Tool: {toolName}</span>
      </button>
      {open && <pre className="chat-ui-tool-payload">{formatOutput(input)}</pre>}
    </div>
  );
}
