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
    return sum + (usage?.totalTokens ?? 0);
  }, 0);
  const remainingTokens = tokenBudget === null ? null : Math.max(0, tokenBudget - usedTokens);
  return { usedTokens, remainingTokens, tokenBudget };
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
