import type { RunnerFilesChangedHunk } from '@agent-flow/core/messages';

export interface DiffPreviewProps {
  filename: string;
  hunks: RunnerFilesChangedHunk[];
}

export function DiffPreview({ filename, hunks }: DiffPreviewProps) {
  return (
    <div className="chat-v2-diff" aria-label={`Diff for ${filename}`}>
      {hunks.map((hunk) => (
        <section key={`${filename}:${hunk.header}`} className="chat-v2-diff-hunk">
          <div className="chat-v2-diff-header">{hunk.header}</div>
          {hunk.lines.map((line, index) => (
            <div key={`${hunk.header}:${index}`} className={`chat-v2-diff-line is-${line.type}`}>
              <span>{line.oldLine ?? ''}</span>
              <span>{line.newLine ?? ''}</span>
              <code>{line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' '}{line.text}</code>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
