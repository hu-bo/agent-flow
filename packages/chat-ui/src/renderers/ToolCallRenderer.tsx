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
    <div className="my-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs font-mono text-gray-500 hover:text-gray-800"
      >
        <span>{open ? '▾' : '▸'}</span>
        <span>Tool: {toolName}</span>
      </button>
      {open && (
        <pre className="mt-1 rounded bg-gray-100 p-2 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
          {formatOutput(input)}
        </pre>
      )}
    </div>
  );
}
