import type { ChatMessage, FileAttachment, TokenUsageSummary } from '@agent-flow/chat-ui';
import type { FilePart, TokenUsage } from '@agent-flow/core/messages';
import type { RunnerRecord } from '../api';

export type NoticeState = { kind: 'success' | 'error'; message: string } | null;

export type ModelSelectOption = {
  value: string;
  label: string;
  maxInputTokens?: number;
};

export function readErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export function buildTokenUsage(
  messages: ChatMessage[],
  usageByMessageId: Record<string, TokenUsage>,
  tokenBudget: number | null,
): TokenUsageSummary {
  const usedTokens = messages.reduce((sum, message) => {
    const usage = usageByMessageId[message.uuid];
    // Providers only report exact usage when a response has finished.  Fall
    // back to a lightweight estimate so the context indicator remains useful
    // for restored history and while an assistant response is streaming.
    return sum + (usage?.totalTokens ?? estimateMessageTokens(message));
  }, 0);
  const remainingTokens = tokenBudget === null ? null : Math.max(0, tokenBudget - usedTokens);
  return { usedTokens, remainingTokens, tokenBudget };
}

function estimateMessageTokens(message: ChatMessage): number {
  switch (message.type) {
    case 'text':
      return estimateTextTokens(message.text) + estimateFileTokens(message.attachments ?? []);
    case 'thinking':
      return estimateTextTokens(message.text);
    case 'image':
      return message.source.type === 'base64' ? Math.ceil(message.source.data.length / 4) : 0;
    case 'tool_execution':
      return estimateTextTokens([
        message.tool.name,
        safeJsonStringify(message.tool.input),
        safeJsonStringify(message.tool.output),
        message.tool.error ?? '',
      ].join(' '));
  }
}

function estimateFileTokens(files: FilePart[]): number {
  return files.reduce((total, file) => total + Math.ceil(file.data.length / 4), 0);
}

function estimateTextTokens(text: string): number {
  return text.length === 0 ? 0 : Math.ceil(text.length / 4);
}

export function buildRunnerLabel(runner: RunnerRecord): string {
  const host = runner.hostName || runner.host || runner.hostIp;
  if (host && host.trim()) {
    return `${host} (${runner.runnerId})`;
  }
  return runner.runnerId;
}

export function extractAssistantMarkdown(messages: ChatMessage[]): string {
  const target = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant');
  if (!target) {
    return '';
  }
  return target.type === 'text' ? target.text.trim() : '';
}

function safeJsonStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function stringifyMessageForCopy(message: ChatMessage): string {
  if (message.type === 'text') {
    return [
      message.text,
      ...(message.attachments ?? []).map((file) => `[file:${file.mimeType}]`),
    ].filter(Boolean).join('\n\n').trim();
  }
  if (message.type === 'thinking') return message.text.trim();
  if (message.type === 'image') return (message.text ?? '[image]').trim();
  return [
    `[tool:${message.tool.name} ${message.status}]`,
    message.tool.input === undefined ? '' : `input: ${safeJsonStringify(message.tool.input)}`,
    message.tool.output === undefined ? '' : `output: ${safeJsonStringify(message.tool.output)}`,
    message.tool.error ? `error: ${message.tool.error}` : '',
  ].filter((value) => value.trim().length > 0).join('\n');
}

export async function copyToClipboard(content: string): Promise<void> {
  if (!content.trim()) return;
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(content);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = content;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!copied) {
    throw new Error('Clipboard is unavailable');
  }
}

export async function prepareFileAttachments(files: File[]): Promise<FileAttachment[]> {
  return Promise.all(
    files.map(async (file) => {
      const dataUrl = await fileToDataUrl(file);
      return {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        url: dataUrl,
        previewUrl: file.type.startsWith('image/') ? dataUrl : undefined,
      } satisfies FileAttachment;
    }),
  );
}
