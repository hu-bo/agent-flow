import type { AgentEvent, AgentRunResult, LlmStepOutputPhase } from '@agent-flow/core';
import type { ThinkingMessage, ThinkingStatus } from '@agent-flow/core/messages';
import type { RuntimeChatInput } from '../contracts/api.js';
import type { RuntimeMode } from './runtime-types.js';
import { isPlainObject, truncateText } from './runtime-types.js';

export interface RuntimeThinkingOptions {
  input: RuntimeChatInput;
  parentUuid: string | null;
  runtimeMode: Exclude<RuntimeMode, 'chat'>;
  events: AgentEvent[];
  result?: AgentRunResult;
  startedAt: number;
}

export function buildRuntimeThinkingSummaryMessage(options: RuntimeThinkingOptions): ThinkingMessage {
  const status = resolveStatus(options.events, options.result);
  const durationMs = Math.max(0, Date.now() - options.startedAt);
  return createThinkingMessage(options, {
    uuid: `runtime_summary_${sanitize(options.input.turnId)}`,
    kind: 'summary',
    title: status === 'running' ? 'Working' : status === 'success' ? 'Worked' : 'Execution stopped',
    text: status === 'running' ? 'Working…' : status === 'success' ? `Worked for ${formatDuration(durationMs)}` : `Stopped after ${formatDuration(durationMs)}`,
    status,
    durationMs,
  });
}

/** Convert a runtime event into one or more atomic, user-visible thinking messages. */
export function buildRuntimeThinkingActivityMessages(
  options: RuntimeThinkingOptions,
  event: AgentEvent,
): ThinkingMessage[] {
  if (event.type === 'checkpoint.created' && event.payload.kind === 'llm') {
    return checkpointMessages(options, event);
  }

  if (event.type === 'step.started' || event.type === 'step.completed' || event.type === 'step.failed') {
    const stepId = readString(event.payload.stepId);
    if (!stepId) return [];
    const status: ThinkingStatus = event.type === 'step.started' ? 'running' : event.type === 'step.failed' ? 'error' : 'success';
    const title = readString(event.payload.title) ?? humanize(stepId);
    const error = readString(event.payload.error);
    return [createThinkingMessage(options, {
      uuid: `runtime_step_${sanitize(options.input.turnId)}_${sanitize(stepId)}`,
      kind: 'step',
      title,
      text: error ?? (status === 'running' ? `Started ${title}` : `Completed ${title}`),
      status,
    })];
  }

  if (event.type === 'recovery.strategy_selected' || event.type === 'recovery.reflected' || event.type === 'recovery.exhausted') {
    const text = recoveryText(event);
    if (!text) return [];
    return [createThinkingMessage(options, {
      uuid: `runtime_recovery_${sanitize(options.input.turnId)}_${sanitize(event.id)}`,
      kind: 'recovery',
      title: event.type === 'recovery.exhausted' ? 'Recovery exhausted' : 'Recovery',
      text,
      status: event.type === 'recovery.exhausted' ? 'error' : 'running',
    })];
  }

  if (event.type === 'session.verification') {
    const statusText = readString(event.payload.status);
    const reason = readString(event.payload.reason);
    const nextAction = readString(event.payload.nextAction);
    const missing = Array.isArray(event.payload.missingEvidence)
      ? event.payload.missingEvidence.filter((value): value is string => typeof value === 'string')
      : [];
    const text = [reason, missing.length ? `Missing evidence: ${missing.join(', ')}` : undefined, nextAction ? `Next: ${nextAction}` : undefined]
      .filter((value): value is string => Boolean(value)).join('\n');
    if (!text && !statusText) return [];
    return [createThinkingMessage(options, {
      uuid: `runtime_verification_${sanitize(options.input.turnId)}_${sanitize(event.id)}`,
      kind: 'verification',
      title: readString(event.payload.verifierName) ?? 'Verification',
      text: text || statusText || 'Verification updated',
      status: statusText === 'passed' ? 'success' : statusText === 'blocked' ? 'error' : 'running',
    })];
  }

  return [];
}

function checkpointMessages(options: RuntimeThinkingOptions, event: AgentEvent): ThinkingMessage[] {
  const output = isPlainObject(event.payload.output) ? event.payload.output : null;
  if (!output) return [];
  const title = readString(output.title) ?? readString(event.payload.title) ?? 'Reasoning';
  const sections = isPlainObject(output.sections) ? output.sections : null;
  const result: ThinkingMessage[] = [];

  if (sections) {
    for (const phase of ['analysis', 'implementation', 'verification'] as const) {
      const text = readString(sections[phase]);
      if (!text) continue;
      result.push(createCheckpointMessage(options, event, phase, title, text));
    }
    return result;
  }

  const text = readString(output.text);
  if (!text) return [];
  const phase = readPhase(output.phase) ?? inferPhase(title);
  return [createCheckpointMessage(options, event, phase, title, text)];
}

function createCheckpointMessage(
  options: RuntimeThinkingOptions,
  event: AgentEvent,
  phase: LlmStepOutputPhase,
  title: string,
  text: string,
): ThinkingMessage {
  return createThinkingMessage(options, {
    uuid: `runtime_reasoning_${sanitize(options.input.turnId)}_${sanitize(event.id)}_${phase}`,
    kind: phase === 'verification' ? 'verification' : 'reasoning',
    title,
    text: truncateText(text, 4_800),
    status: 'success',
  });
}

function createThinkingMessage(
  options: RuntimeThinkingOptions,
  value: Pick<ThinkingMessage, 'uuid' | 'kind' | 'title' | 'text' | 'status'> & Partial<Pick<ThinkingMessage, 'durationMs'>>,
): ThinkingMessage {
  return {
    uuid: value.uuid,
    parentUuid: options.parentUuid,
    role: 'assistant',
    type: 'thinking',
    kind: value.kind,
    title: value.title,
    text: value.text,
    status: value.status,
    ...(value.durationMs !== undefined ? { durationMs: value.durationMs } : {}),
    timestamp: new Date().toISOString(),
    metadata: {
      turnId: options.input.turnId,
      modelId: String(options.input.modelId),
      provider: 'core-runtime',
      isMeta: true,
    },
  };
}

function recoveryText(event: AgentEvent): string | null {
  if (event.type === 'recovery.exhausted') {
    return readString(event.payload.reason) ?? 'Recovery attempt budget exhausted.';
  }
  if (event.type === 'recovery.strategy_selected') {
    const strategy = isPlainObject(event.payload.strategy) ? event.payload.strategy : null;
    return readString(strategy?.summary) ?? readString(event.payload.strategyFingerprint) ?? null;
  }
  const reflection = isPlainObject(event.payload.reflection) ? event.payload.reflection : null;
  return readString(reflection?.summary) ?? readString(reflection?.cause) ?? null;
}

function resolveStatus(events: AgentEvent[], result?: AgentRunResult): ThinkingStatus {
  if (result) return result.status === 'succeeded' ? 'success' : 'error';
  if (events.some((event) => event.type === 'session.failed')) return 'error';
  return 'running';
}

function inferPhase(title: string): LlmStepOutputPhase {
  const value = title.toLowerCase();
  if (value.includes('verification') || value.includes('validation')) return 'verification';
  if (value.includes('implementation') || value.includes('execution')) return 'implementation';
  return 'analysis';
}

function readPhase(value: unknown): LlmStepOutputPhase | undefined {
  return value === 'analysis' || value === 'implementation' || value === 'verification' ? value : undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function sanitize(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 80) || 'event';
}

function humanize(value: string): string {
  return value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDuration(durationMs: number): string {
  if (durationMs < 1_000) return `${durationMs}ms`;
  if (durationMs < 60_000) return `${Math.max(1, Math.round(durationMs / 1_000))}s`;
  const minutes = Math.floor(durationMs / 60_000);
  const seconds = Math.round((durationMs % 60_000) / 1_000);
  return `${minutes}m ${seconds}s`;
}
