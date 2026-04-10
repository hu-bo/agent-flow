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
    <div className="my-1">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 text-xs font-mono ${
          isError ? 'text-red-500 hover:text-red-700' : 'text-gray-500 hover:text-gray-800'
        }`}
      >
        <span>{open ? '▾' : '▸'}</span>
        <span>Result{isError ? ' (error)' : ''}</span>
      </button>
      {(open || !isLong) && (
        <pre className={`mt-1 rounded p-2 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all ${
          isError ? 'bg-red-50 text-red-700' : 'bg-gray-100'
        }`}>
          {text}
        </pre>
      )}
      {!open && isLong && (
        <span className="text-xs text-gray-400 ml-1">
          ({text.length} chars — click to expand)
        </span>
      )}
    </div>
  );
}
