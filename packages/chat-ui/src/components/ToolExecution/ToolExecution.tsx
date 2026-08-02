import { Check, ChevronDown, Clipboard, FileCode2, Search, Terminal, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { RunnerFilesChangedPayload, ToolExecutionMessage } from '@agent-flow/core/messages';
import { DiffPreview } from '../DiffPreview/DiffPreview';
import { Badge, Button, Collapsible, CollapsibleContent, CollapsibleTrigger, Tooltip } from '../ui/primitives';

const MAX_PREVIEW_CHARS = 8_192;
const MAX_PREVIEW_LINES = 20;

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function format(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value, null, 2); } catch { return String(value); }
}

function commandDetails(input: unknown): { command?: string; cwd?: string } {
  const root = record(input);
  const task = record(root?.task) ?? root;
  const command = typeof task?.command === 'string' ? task.command : undefined;
  const args = Array.isArray(task?.args) ? task.args.map(String) : [];
  const cwd = [task?.cwd, task?.workdir, root?.cwd, root?.workdir].find((value) => typeof value === 'string') as string | undefined;
  return { command: command ? `${command}${args.length ? ` ${args.join(' ')}` : ''}` : undefined, cwd };
}

function outputDetails(output: unknown): { stdout?: string; stderr?: string; exitCode?: string } {
  const root = record(output);
  const nested = record(root?.result) ?? root;
  const stdout = [nested?.stdout, nested?.output, root?.stdout].find((value) => typeof value === 'string') as string | undefined;
  const stderr = [nested?.stderr, root?.stderr, root?.error].find((value) => typeof value === 'string') as string | undefined;
  const code = nested?.exitCode ?? nested?.exit_code ?? root?.exitCode ?? root?.exit_code;
  return { stdout, stderr, exitCode: code == null ? undefined : String(code) };
}

function preview(text: string): { text: string; truncated: boolean } {
  const lines = text.split('\n');
  const shortened = lines.slice(0, MAX_PREVIEW_LINES).join('\n').slice(0, MAX_PREVIEW_CHARS);
  return { text: shortened, truncated: shortened.length < text.length };
}

function filesPayload(value: unknown): RunnerFilesChangedPayload | null {
  const item = record(value);
  return item?.type === 'runner-files-changed' && item.version === 1 && Array.isArray(item.files)
    ? value as RunnerFilesChangedPayload : null;
}

function toolIcon(name: string) {
  if (name.includes('exec') || name.includes('shell')) return <Terminal size={15} />;
  if (name.includes('search')) return <Search size={15} />;
  if (name.includes('write') || name.includes('patch')) return <FileCode2 size={15} />;
  return <Wrench size={15} />;
}

export interface ToolExecutionProps { message: ToolExecutionMessage }

export function ToolExecution({ message }: ToolExecutionProps) {
  const error = message.status === 'error' || Boolean(message.tool.error);
  const running = message.status === 'running' || message.status === 'pending';
  const [open, setOpen] = useState(error || running);
  const [showAll, setShowAll] = useState(false);
  const [copied, setCopied] = useState(false);
  const command = commandDetails(message.tool.input);
  const result = outputDetails(message.tool.output);
  const changed = filesPayload(message.tool.output);
  const inputText = format(message.tool.input);
  const genericOutput = format(message.tool.output);
  const mainOutput = result.stdout ?? genericOutput;
  const outputPreview = useMemo(() => preview(mainOutput), [mainOutput]);
  const title = command.command ?? message.title ?? message.tool.name.replace(/[._]/g, ' ');
  const copyText = [command.cwd && `cwd: ${command.cwd}`, command.command, mainOutput, result.stderr, message.tool.error].filter(Boolean).join('\n\n');

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={`chat-v2-tool ${error ? 'is-error' : running ? 'is-running' : 'is-success'}`}>
      <CollapsibleTrigger asChild>
        <button type="button" className="chat-v2-tool-trigger">
          <span className="chat-v2-timeline-dot">{toolIcon(message.tool.name)}</span>
          <span className="chat-v2-tool-title">{title}</span>
          {result.exitCode !== undefined && <Badge>exit {result.exitCode}</Badge>}
          <span className="chat-v2-tool-status">{running ? 'Running' : error ? 'Failed' : 'Completed'}</span>
          <ChevronDown size={14} className="chat-v2-chevron" />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="chat-v2-tool-content">
        {command.cwd && <Detail label="Working directory" value={command.cwd} />}
        {command.command && <Detail label="Command" value={command.command} code />}
        {!command.command && inputText && <Detail label="Input" value={inputText} code />}
        {changed ? <FilesChanged payload={changed} /> : mainOutput && <Detail label="Output" value={showAll ? mainOutput : outputPreview.text} code />}
        {result.stderr && <Detail label="Error output" value={result.stderr} code tone="error" />}
        {message.tool.error && message.tool.error !== result.stderr && <Detail label="Error" value={message.tool.error} tone="error" />}
        <div className="chat-v2-tool-footer">
          {outputPreview.truncated && <Button variant="ghost" size="sm" onClick={() => setShowAll((value) => !value)}>{showAll ? 'Show less' : 'Show full output'}</Button>}
          {copyText && <Tooltip label="Copy tool details"><Button variant="ghost" size="sm" onClick={() => { void navigator.clipboard?.writeText(copyText); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }}>{copied ? <Check size={13} /> : <Clipboard size={13} />} {copied ? 'Copied' : 'Copy'}</Button></Tooltip>}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function Detail({ label, value, code, tone }: { label: string; value: string; code?: boolean; tone?: 'error' }) {
  return <section className={`chat-v2-detail ${tone === 'error' ? 'is-error' : ''}`}><span className="chat-v2-detail-label">{label}</span>{code ? <pre>{value}</pre> : <p>{value}</p>}</section>;
}

function FilesChanged({ payload }: { payload: RunnerFilesChangedPayload }) {
  return <div className="chat-v2-files"><div className="chat-v2-files-summary"><span>{payload.summary.filesChanged} files changed</span><b className="is-add">+{payload.summary.additions}</b><b className="is-del">-{payload.summary.deletions}</b></div>{payload.files.map((file) => <details key={file.path} className="chat-v2-file"><summary>{file.path}<span>+{file.additions} -{file.deletions}</span></summary>{file.diffPreview?.hunks.length ? <DiffPreview filename={file.path} hunks={file.diffPreview.hunks} /> : <p>{file.unavailableReason ?? 'No textual diff available.'}</p>}</details>)}</div>;
}
