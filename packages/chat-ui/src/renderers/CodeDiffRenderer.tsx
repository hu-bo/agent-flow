import './CodeDiffRenderer.less';
import { useMemo } from 'react';
import { diffLines } from 'diff';
import type { ContentRendererProps } from '../registry';
import type { CodeDiffPart } from '../types';

export interface CodeDiffPreviewLine {
  type: 'context' | 'add' | 'del';
  text: string;
  oldLine: number | null;
  newLine: number | null;
}

export interface CodeDiffPreviewHunk {
  header: string;
  lines: CodeDiffPreviewLine[];
}

interface CodeDiffPreviewProps {
  filename?: string;
  language?: string;
  hunks: CodeDiffPreviewHunk[];
}

function formatLineNumber(value: number | null): string {
  return value === null ? '' : String(value);
}

export function CodeDiffPreview({ filename, language, hunks }: CodeDiffPreviewProps) {
  return (
    <div className="chat-ui-diff">
      {filename && (
        <div className="chat-ui-diff-header">
          {filename}
          {language && <span className="chat-ui-diff-language">{language}</span>}
        </div>
      )}
      <div className="chat-ui-diff-hunks">
        {hunks.map((hunk, hunkIndex) => (
          <div key={hunkIndex} className="chat-ui-diff-hunk">
            <div className="chat-ui-diff-hunk-header">{hunk.header}</div>
            <div className="chat-ui-diff-hunk-lines">
              {hunk.lines.map((line, lineIndex) => (
                <div key={lineIndex} className={`chat-ui-diff-hunk-line is-${line.type}`}>
                  <span className="chat-ui-diff-line-no">{formatLineNumber(line.oldLine)}</span>
                  <span className="chat-ui-diff-line-no">{formatLineNumber(line.newLine)}</span>
                  <span className="chat-ui-diff-line-prefix">
                    {line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' '}
                  </span>
                  <span className="chat-ui-diff-line-text">{line.text || ' '}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
