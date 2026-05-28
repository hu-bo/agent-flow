import './ToolResultRenderer.less';
import { useState } from 'react';
import type { ContentRendererProps } from '../registry';
import type { ToolResultPart, RunnerFilesChangedPayload } from '@agent-flow/core/messages';
import { CodeDiffPreview } from './CodeDiffRenderer';

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

function asRunnerFilesChangedPayload(value: unknown): RunnerFilesChangedPayload | null {
  if (!isRecord(value)) return null;
  if (value.type !== 'runner-files-changed') return null;
  if (value.version !== 1 || value.source !== 'runner-host') return null;
  if (!isRecord(value.summary)) return null;
  if (!Array.isArray(value.files)) return null;
  return value as unknown as RunnerFilesChangedPayload;
}

export function ToolResultRenderer({ part }: ContentRendererProps) {
  const { toolName, output, isError } = part as ToolResultPart;
  const [open, setOpen] = useState(false);
  const [openFiles, setOpenFiles] = useState<Record<string, boolean>>({});
  const filesChangedPayload = !isError ? asRunnerFilesChangedPayload(output) : null;

  if (filesChangedPayload) {
    const { summary, files } = filesChangedPayload;
    const toggleFile = (path: string, index: number) => {
      const key = `${path}#${index}`;
      setOpenFiles((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    };

    return (
      <div className="chat-ui-tool-diff-card">
        <button
          onClick={() => setOpen(!open)}
          className="chat-ui-tool-diff-header"
          type="button"
        >
          <span className="chat-ui-tool-arrow">{open ? 'v' : '>'}</span>
          <span className="chat-ui-tool-diff-title">Files changed</span>
          <span className="chat-ui-tool-diff-stats">
            <span className="chat-ui-tool-diff-pill">{summary.filesChanged} files changed</span>
            <span className="chat-ui-tool-diff-pill is-add">+{summary.additions}</span>
            <span className="chat-ui-tool-diff-pill is-del">-{summary.deletions}</span>
          </span>
        </button>

        {open && (
          <div className="chat-ui-tool-diff-body">
            {summary.truncated && (
              <div className="chat-ui-tool-diff-banner">
                Diff preview was truncated due to output limits.
              </div>
            )}
            {files.map((file, index) => {
              const fileKey = `${file.path}#${index}`;
              const fileOpen = openFiles[fileKey] ?? index === 0;
              return (
                <div key={fileKey} className="chat-ui-tool-file">
                  <button
                    type="button"
                    className="chat-ui-tool-file-header"
                    onClick={() => toggleFile(file.path, index)}
                  >
                    <span className="chat-ui-tool-arrow">{fileOpen ? 'v' : '>'}</span>
                    <span className="chat-ui-tool-file-path">{file.path}</span>
                    <span className="chat-ui-tool-file-stats">
                      <span className="chat-ui-tool-file-add">+{file.additions}</span>
                      <span className="chat-ui-tool-file-del">-{file.deletions}</span>
                    </span>
                  </button>

                  {fileOpen && (
                    <div className="chat-ui-tool-file-content">
                      {file.unavailableReason ? (
                        <div className="chat-ui-tool-diff-banner is-warning">
                          Diff unavailable: {file.unavailableReason}
                        </div>
                      ) : file.diffPreview && file.diffPreview.hunks.length > 0 ? (
                        <CodeDiffPreview
                          filename={file.path}
                          language="diff"
                          hunks={file.diffPreview.hunks.map((hunk) => ({
                            header: hunk.header,
                            lines: hunk.lines,
                          }))}
                        />
                      ) : (
                        <div className="chat-ui-tool-diff-banner">No textual changes detected.</div>
                      )}

                      {file.truncated && !file.unavailableReason && (
                        <div className="chat-ui-tool-diff-banner is-warning">
                          This file preview was truncated.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

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
        <span>Result: {toolName}{isError ? ' (error)' : ''}</span>
      </button>

      {(open || !isLong) && <pre className={`chat-ui-tool-payload ${isError ? 'is-error' : ''}`}>{text}</pre>}

      {!open && isLong && <span className="chat-ui-tool-hint">({text.length} chars - click to expand)</span>}
    </div>
  );
}
