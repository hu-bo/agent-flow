import { useMemo } from 'react';
import { diffLines } from 'diff';
import type { ContentRendererProps } from '../registry';
import type { CodeDiffPart } from '../types';

export function CodeDiffRenderer({ part }: ContentRendererProps) {
  const { oldCode, newCode, filename, language } = part as CodeDiffPart;

  const changes = useMemo(() => diffLines(oldCode, newCode), [oldCode, newCode]);

  return (
    <div className="my-1 overflow-hidden rounded-lg border border-gray-200">
      {filename && (
        <div className="border-b border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600">
          {filename}
          {language && <span className="ml-2 text-gray-400">{language}</span>}
        </div>
      )}
      <pre className="overflow-x-auto p-0 text-xs leading-5">
        <code>
          {changes.map((change, i) => {
            const bg = change.added
              ? 'bg-green-50 text-green-800'
              : change.removed
                ? 'bg-red-50 text-red-800'
                : 'text-gray-700';
            const prefix = change.added ? '+' : change.removed ? '-' : ' ';

            return (
              <span key={i} className={`block ${bg}`}>
                {change.value
                  .replace(/\n$/, '')
                  .split('\n')
                  .map((line, j) => (
                    <span key={j} className="block px-3">
                      <span className="mr-2 inline-block w-3 select-none text-gray-400">
                        {prefix}
                      </span>
                      {line}
                    </span>
                  ))}
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
