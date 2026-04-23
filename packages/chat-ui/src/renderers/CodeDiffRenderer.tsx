import './CodeDiffRenderer.less';
import { useMemo } from 'react';
import { diffLines } from 'diff';
import type { ContentRendererProps } from '../registry';
import type { CodeDiffPart } from '../types';

export function CodeDiffRenderer({ part }: ContentRendererProps) {
  const { oldCode, newCode, filename, language } = part as CodeDiffPart;

  const changes = useMemo(() => diffLines(oldCode, newCode), [oldCode, newCode]);

  return (
    <div className="chat-ui-diff">
      {filename && (
        <div className="chat-ui-diff-header">
          {filename}
          {language && <span className="chat-ui-diff-language">{language}</span>}
        </div>
      )}
      <pre className="chat-ui-diff-body">
        <code>
          {changes.map((change, i) => {
            const lineClass = change.added
              ? 'is-added'
              : change.removed
                ? 'is-removed'
                : 'is-common';
            const prefix = change.added ? '+' : change.removed ? '-' : ' ';

            return (
              <span key={i} className={`chat-ui-diff-block ${lineClass}`}>
                {change.value
                  .replace(/\n$/, '')
                  .split('\n')
                  .map((line, j) => (
                    <span key={j} className="chat-ui-diff-line">
                      <span className="chat-ui-diff-prefix">
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
