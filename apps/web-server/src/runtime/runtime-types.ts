import type { AgentRunResult } from '@agent-flow/core';
import type { MessagePart } from '@agent-flow/model-adapters/types';
import type { RuntimeChatInput } from '../contracts/api.js';

export interface RunnerDirective {
  command: string;
  args: string[];
}

export type RuntimeMode = 'chat' | 'autonomous' | 'runner';

export interface ModelToolCall {
  callId: string;
  toolName: string;
  args: unknown;
}

export interface RuntimeModelContext {
  result: AgentRunResult;
  eventCountByType: Map<string, number>;
  runnerDirective: RunnerDirective | undefined;
}

export interface ModelResponseOptions {
  runtime?: RuntimeModelContext;
  maxToolRounds?: number;
}

export type ToolResultPart = Extract<MessagePart, { type: 'tool-result' }>;

export const MAX_MODEL_TOOL_ROUNDS = 4;
export const MAX_AUTONOMOUS_MODEL_TOOL_ROUNDS = 2;

export function resolveMaxOutputTokens(reasoningEffort: RuntimeChatInput['reasoningEffort']): number {
  if (reasoningEffort === 'high') return 4096;
  if (reasoningEffort === 'low') return 1024;
  return 2048;
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }
  return `${text.slice(0, maxChars)}\n... (truncated)`;
}

export function formatUnknown(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
