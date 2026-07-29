import type { ChatMessage, FileAttachment, TokenUsageSummary } from '@agent-flow/chat-ui';
import type { TokenUsage } from '@agent-flow/core/messages';
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
  return message.content.reduce((total, part) => total + estimateContentPartTokens(part), 0);
}

function estimateContentPartTokens(part: ChatMessage['content'][number]): number {
  switch (part.type) {
    case 'text':
    case 'thinking':
      return estimateTextTokens(part.text);
    case 'file':
      // File data is base64 encoded. Four base64 characters represent three
      // source bytes, so this deliberately stays a conservative estimate.
      return Math.ceil(part.data.length / 4);
    case 'image':
      return part.source.type === 'base64' ? Math.ceil(part.source.data.length / 4) : 0;
    case 'tool-call':
      return estimateTextTokens(`${part.toolName} ${safeJsonStringify(part.input)}`);
    case 'tool-result':
      return estimateTextTokens(`${part.toolName} ${safeJsonStringify(part.output)}`);
    default:
      return 0;
  }
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
  return target.content
    .filter((part): part is Extract<ChatMessage['content'][number], { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim();
}

function safeJsonStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function stringifyMessageForCopy(message: ChatMessage): string {
  return message.content
    .map((part) => {
      if (part.type === 'text') return part.text;
      if (part.type === 'thinking') return part.text;
      if (part.type === 'file') return `[file:${part.mimeType}]`;
      if (part.type === 'image') return '[image]';
      if (part.type === 'tool-call') return `[tool-call:${part.toolName}] ${safeJsonStringify(part.input)}`;
      if (part.type === 'tool-result') return `[tool-result:${part.toolName}] ${safeJsonStringify(part.output)}`;
      if (part.type === 'code-diff') {
        return [
          `[code-diff:${part.filename ?? 'untitled'}.${part.language}]`,
          '--- OLD ---',
          part.oldCode,
          '--- NEW ---',
          part.newCode,
        ].join('\n');
      }
      return safeJsonStringify(part);
    })
    .filter((value) => value.trim().length > 0)
    .join('\n\n')
    .trim();
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
