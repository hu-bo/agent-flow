import './ToolExecutionRenderer.less';
import { useState } from 'react';
import type { ContentRendererProps } from '../registry';
import type { ToolExecutionPart } from '../types';
import type { RunnerFilesChangedPayload } from '@agent-flow/core/messages';
import { CodeDiffPreview } from './CodeDiffRenderer';

function formatPayload(value: unknown): string {
  if (value === undefined || value === null) return '';
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

function readCommand(input: unknown): string | null {
  const task = isRecord(input) && isRecord(input.task) ? input.task : input;
  if (!isRecord(task) || typeof task.command !== 'string') return null;
  const args = Array.isArray(task.args) ? task.args.map((item) => String(item)) : [];
  return `${task.command}${args.length ? ` ${args.join(' ')}` : ''}`;
}

function truncate(value: string, maxChars: number): string {
  return value.length <= maxChars ? value : `${value.slice(0, maxChars)}...`;
}

export function ToolExecutionRenderer({ part }: ContentRendererProps) {
  const message = part as ToolExecutionPart;
  const { tool } = message;
  const [open, setOpen] = useState(message.status === 'error');
  const [openFiles, setOpenFiles] = useState<Record<string, boolean>>({});
  const output = tool.output;
  const filesChangedPayload = message.status !== 'error' ? asRunnerFilesChangedPayload(output) : null;

  if (filesChangedPayload) {
    const { summary, files } = filesChangedPayload;
    const toggleFile = (path: string, index: number) => {
      const key = `${path}#${index}`;
      setOpenFiles((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
      <div className="chat-ui-tool-diff-card">
        <button onClick={() => setOpen(!open)} className="chat-ui-tool-diff-header" type="button">
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
              <div className="chat-ui-tool-diff-banner">Diff preview was truncated due to output limits.</div>
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
                        <div className="chat-ui-tool-diff-banner is-warning">This file preview was truncated.</div>
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

  const command = readCommand(tool.input);
  const title = command ? `${tool.name} :: ${truncate(command, 120)}` : (message.title ?? tool.name);
  const inputText = formatPayload(tool.input);
  const outputText = formatPayload(output);
  const isLong = inputText.length + outputText.length > 240;
  const isError = message.status === 'error';

  return (
    <div className="chat-ui-tool-block">
      <button
        onClick={() => setOpen(!open)}
        className={`chat-ui-tool-toggle ${isError ? 'is-error' : ''}`}
        type="button"
      >
        <span className="chat-ui-tool-arrow">{open ? 'v' : '>'}</span>
        <span>{tool.name} · {message.status}</span>
        {title !== tool.name ? <span className="chat-ui-tool-hint">{truncate(title, 140)}</span> : null}
      </button>

      {(open || !isLong) && (
        <pre className={`chat-ui-tool-payload ${isError ? 'is-error' : ''}`}>
          {[
            inputText ? `input\n${inputText}` : '',
            outputText ? `output\n${outputText}` : '',
            tool.error ? `error\n${tool.error}` : '',
          ].filter(Boolean).join('\n\n')}
        </pre>
      )}

      {!open && isLong && <span className="chat-ui-tool-hint">({inputText.length + outputText.length} chars)</span>}
    </div>
  );
}
