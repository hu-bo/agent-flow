import type { AgentEvent, AgentRunResult, LlmStepOutputPhase } from '@agent-flow/core';
import type { ThinkingPart, ThoughtChainItemPart, ThinkingStatus, UnifiedMessage } from '@agent-flow/core/messages';
import type { RuntimeChatInput } from '../contracts/api.js';
import type { RunnerDirective, RuntimeMode } from './runtime-types.js';
import { formatUnknown, isPlainObject, truncateText } from './runtime-types.js';

export interface RuntimeThinkingMessageOptions {
  input: RuntimeChatInput;
  parentUuid: string | null;
  runtimeMode: Exclude<RuntimeMode, 'chat'>;
  runnerDirective?: RunnerDirective;
  events: AgentEvent[];
  result?: AgentRunResult;
  startedAt: number;
}

interface PlanStepSnapshot {
  id: string;
  title: string;
  kind: string;
  toolName?: string;
}

interface StepState {
  id: string;
  title: string;
  kind: string;
  status: ThinkingStatus;
  startedAt?: string;
  endedAt?: string;
  error?: string;
}

interface LlmSection {
  phase: LlmStepOutputPhase;
  title: string;
  text: string;
}

interface VerificationSnapshot {
  round?: number;
  status?: string;
  verifierName?: string;
  reason?: string;
  missingEvidence: string[];
  nextAction?: string;
}

export function buildRuntimeThinkingMessage(options: RuntimeThinkingMessageOptions): UnifiedMessage {
  const status = resolveThinkingStatus(options.events, options.result);
  const items = buildThinkingItems(options, status);
  const now = Date.now();
  const durationMs = Math.max(0, now - options.startedAt);
  const part: ThinkingPart = {
    type: 'thinking',
    title: status === 'running' ? 'Thinking' : 'Complete thinking',
    text: items
      .map((item) => {
        const title = typeof item.title === 'string' ? item.title : item.key;
        const content = typeof item.content === 'string' ? item.content : '';
        return content ? `## ${title}\n${content}` : `## ${title}`;
      })
      .join('\n\n'),
    status,
    durationMs,
    defaultOpen: true,
    defaultExpandedKeys: items.map((item) => item.key),
    items,
  };

  return {
    uuid: `runtime_thinking_${sanitizeMessageId(options.input.requestId)}`,
    parentUuid: options.parentUuid,
    role: 'assistant',
    content: [part],
    timestamp: new Date().toISOString(),
    metadata: {
      modelId: String(options.input.modelId),
      provider: 'core-runtime',
      isMeta: true,
      extensions: {
        runtimeThinking: true,
        requestId: options.input.requestId,
        modelId: options.input.modelId,
        model: options.input.model,
        runtimeMode: options.runtimeMode,
        status,
      },
    },
  };
}

function buildThinkingItems(
  options: RuntimeThinkingMessageOptions,
  status: ThinkingStatus,
): ThoughtChainItemPart[] {
  const plan = extractPlan(options.events);
  const stepStates = extractStepStates(options.events);
  const llmSections = extractLlmSections(options.events);
  const toolEvidence = extractToolEvidence(options.events);
  const verification = extractLatestVerification(options.events);
  const items: ThoughtChainItemPart[] = [
    {
      key: 'intent',
      title: 'Intent',
      status: 'success',
      content: [
        `Mode: ${options.runtimeMode}`,
        `Goal: ${truncateText(options.input.message.trim() || options.input.session.title || 'Untitled turn', 600)}`,
        options.runnerDirective
          ? `Runner directive: ${options.runnerDirective.command} ${options.runnerDirective.args.join(' ')}`.trim()
          : undefined,
      ]
        .filter((line): line is string => Boolean(line))
        .join('\n'),
    },
  ];

  if (plan.length > 0) {
    items.push({
      key: 'plan',
      title: 'Plan',
      status: status === 'running' ? 'running' : status,
      content: plan
        .map((step, index) => {
          const state = stepStates.get(step.id);
          const marker = state?.status ?? 'pending';
          const tool = step.toolName ? ` (${step.toolName})` : '';
          return `${index + 1}. ${step.title}${tool} - ${marker}`;
        })
        .join('\n'),
    });
  }

  for (const phase of ['analysis', 'implementation', 'verification'] as const) {
    const content = llmSections
      .filter((section) => section.phase === phase)
      .map((section) => `### ${section.title}\n${section.text}`)
      .join('\n\n');
    if (!content) continue;
    items.push({
      key: phase,
      title: titleCase(phase),
      status: statusForPhase(phase, stepStates, status),
      content,
    });
  }

  if (toolEvidence.length > 0) {
    items.push({
      key: 'tool-evidence',
      title: 'Tool evidence',
      status: toolEvidence.some((line) => line.includes('failed')) ? 'error' : 'success',
      content: toolEvidence.join('\n'),
    });
  }

  if (verification) {
    items.push({
      key: 'verification',
      title: 'Verification',
      status:
        verification.status === 'passed'
          ? 'success'
          : verification.status === 'blocked'
            ? 'error'
            : 'running',
      content: [
        verification.round !== undefined ? `Round: ${verification.round}` : undefined,
        verification.verifierName ? `Verifier: ${verification.verifierName}` : undefined,
        verification.status ? `Status: ${verification.status}` : undefined,
        verification.reason ? `Reason: ${verification.reason}` : undefined,
        verification.missingEvidence.length > 0
          ? `Missing evidence: ${verification.missingEvidence.join(', ')}`
          : undefined,
        verification.nextAction ? `Next action: ${verification.nextAction}` : undefined,
      ]
        .filter((line): line is string => Boolean(line))
        .join('\n'),
    });
  }

  const failure = buildFailureSummary(options.result, options.events);
  if (failure) {
    items.push({
      key: 'failure',
      title: 'Failure',
      status: 'error',
      content: failure,
    });
  }

  if (options.result) {
    items.push({
      key: 'result',
      title: 'Result',
      status: options.result.status === 'succeeded' ? 'success' : 'error',
      content: [
        `Status: ${options.result.status}`,
        `Runtime events: ${options.result.events.length}`,
        `Output steps: ${Object.keys(options.result.outputs).length}`,
      ].join('\n'),
    });
  }

  return items;
}

function extractPlan(events: AgentEvent[]): PlanStepSnapshot[] {
  const sessionStarted = events.find((event) => event.type === 'session.started');
  const rawSteps = sessionStarted?.payload.steps;
  if (!Array.isArray(rawSteps)) {
    return [];
  }

  return rawSteps
    .map((raw): PlanStepSnapshot | null => {
      if (!isPlainObject(raw)) return null;
      const id = readString(raw.id);
      const title = readString(raw.title);
      const kind = readString(raw.kind);
      if (!id || !title || !kind) return null;
      return {
        id,
        title,
        kind,
        toolName: readString(raw.toolName),
      };
    })
    .filter((step): step is PlanStepSnapshot => Boolean(step));
}

function extractStepStates(events: AgentEvent[]): Map<string, StepState> {
  const states = new Map<string, StepState>();
  const ensure = (id: string): StepState => {
    const existing = states.get(id);
    if (existing) return existing;
    const created: StepState = {
      id,
      title: id,
      kind: 'unknown',
      status: 'pending',
    };
    states.set(id, created);
    return created;
  };

  for (const event of events) {
    const stepId = readString(event.payload.stepId);
    if (!stepId) continue;
    const state = ensure(stepId);
    const title = readString(event.payload.title);
    const kind = readString(event.payload.kind);
    if (title) state.title = title;
    if (kind) state.kind = kind;

    if (event.type === 'step.started') {
      state.status = 'running';
      state.startedAt = event.timestamp;
    } else if (event.type === 'step.completed') {
      state.status = 'success';
      state.endedAt = event.timestamp;
    } else if (event.type === 'step.failed') {
      state.status = 'error';
      state.endedAt = event.timestamp;
      state.error = readString(event.payload.error);
    }
  }

  return states;
}

function extractLlmSections(events: AgentEvent[]): LlmSection[] {
  const sections: LlmSection[] = [];
  for (const event of events) {
    if (event.type !== 'checkpoint.created' || event.payload.kind !== 'llm') {
      continue;
    }
    const output = isPlainObject(event.payload.output) ? event.payload.output : null;
    if (!output) continue;
    const title = readString(output.title) ?? readString(event.payload.title) ?? readString(event.payload.stepId) ?? 'LLM step';
    const phase = readPhase(output.phase) ?? inferPhaseFromTitle(title);
    const structured = isPlainObject(output.sections) ? output.sections : null;

    if (structured) {
      for (const key of ['analysis', 'implementation', 'verification'] as const) {
        const text = readString(structured[key]);
        if (!text) continue;
        sections.push({
          phase: key,
          title,
          text: truncateText(text, 2400),
        });
      }
      continue;
    }

    const text = readString(output.text);
    if (text) {
      sections.push({
        phase,
        title,
        text: truncateText(text, 2400),
      });
    }
  }
  return sections;
}

function extractToolEvidence(events: AgentEvent[]): string[] {
  const lines: string[] = [];
  for (const event of events) {
    if (event.type !== 'tool.result') {
      continue;
    }
    const stepId = readString(event.payload.stepId) ?? event.id;
    const tool = readString(event.payload.tool) ?? 'tool';
    const ok = event.payload.ok === true;
    const error = readString(event.payload.error);
    const summary = ok
      ? summarizeToolOutput(tool, event.payload.output)
      : error
        ? truncateText(error, 240)
        : summarizeToolOutput(tool, event.payload.output);
    lines.push(`- ${tool} (${stepId}) ${ok ? 'completed' : 'failed'}${summary ? `: ${summary}` : ''}`);
  }
  return lines.slice(-12);
}

function extractLatestVerification(events: AgentEvent[]): VerificationSnapshot | null {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    if (event?.type !== 'session.verification') {
      continue;
    }
    return {
      round: typeof event.payload.round === 'number' ? event.payload.round : undefined,
      status: readString(event.payload.status),
      verifierName: readString(event.payload.verifierName),
      reason: readString(event.payload.reason),
      missingEvidence: Array.isArray(event.payload.missingEvidence)
        ? event.payload.missingEvidence.filter((item): item is string => typeof item === 'string')
        : [],
      nextAction: readString(event.payload.nextAction),
    };
  }
  return null;
}

function summarizeToolOutput(toolName: string, output: unknown): string {
  if (!isPlainObject(output)) {
    if (typeof output === 'string') {
      return `text output, ${output.length} chars`;
    }
    return truncateText(formatUnknown(output), 120);
  }

  if (toolName === 'fs.read') {
    const path = readString(output.path) ?? 'file';
    const size = typeof output.size === 'number' ? output.size : undefined;
    const missing = output.missing === true ? ' missing' : '';
    return `${path}${size !== undefined ? `, ${size} bytes` : ''}${missing}`;
  }
  if (toolName === 'fs.list') {
    const path = readString(output.path) ?? '.';
    const total = typeof output.total === 'number' ? output.total : undefined;
    return `${path}${total !== undefined ? `, ${total} entries` : ''}`;
  }
  if (toolName === 'fs.search') {
    const pattern = readString(output.pattern) ?? 'pattern';
    const total = typeof output.total === 'number' ? output.total : undefined;
    return `${pattern}${total !== undefined ? `, ${total} matches` : ''}`;
  }

  const keys = Object.keys(output).slice(0, 8);
  return keys.length > 0 ? `object output with keys: ${keys.join(', ')}` : 'object output';
}

function resolveThinkingStatus(events: AgentEvent[], result?: AgentRunResult): ThinkingStatus {
  if (result) {
    return result.status === 'succeeded' ? 'success' : 'error';
  }
  if (events.some((event) => event.type === 'session.failed' || event.type === 'step.failed')) {
    return 'error';
  }
  return 'running';
}

function statusForPhase(
  phase: LlmStepOutputPhase,
  stepStates: Map<string, StepState>,
  fallback: ThinkingStatus,
): ThinkingStatus {
  const matching = [...stepStates.values()].filter((step) => inferPhaseFromTitle(step.title) === phase);
  if (matching.length === 0) return fallback === 'running' ? 'success' : fallback;
  if (matching.some((step) => step.status === 'error')) return 'error';
  if (matching.some((step) => step.status === 'running')) return 'running';
  if (matching.every((step) => step.status === 'success')) return 'success';
  return fallback;
}

function buildFailureSummary(result: AgentRunResult | undefined, events: AgentEvent[]): string | null {
  if (result?.error) {
    return truncateText(result.error, 1600);
  }

  const failed = [...events].reverse().find((event) => event.type === 'step.failed' || event.type === 'session.failed');
  const error = readString(failed?.payload.error);
  return error ? truncateText(error, 1600) : null;
}

function inferPhaseFromTitle(title: string): LlmStepOutputPhase {
  const lowered = title.toLowerCase();
  if (
    lowered.includes('validation') ||
    lowered.includes('verification') ||
    lowered.includes('regression') ||
    lowered.includes('acceptance') ||
    lowered.includes('preservation')
  ) {
    return 'verification';
  }
  if (
    lowered.includes('implementation') ||
    lowered.includes('execution') ||
    lowered.includes('summary')
  ) {
    return 'implementation';
  }
  return 'analysis';
}

function readPhase(value: unknown): LlmStepOutputPhase | undefined {
  return value === 'analysis' || value === 'implementation' || value === 'verification'
    ? value
    : undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function sanitizeMessageId(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, '_') || `${Date.now()}`;
}

function titleCase(value: string): string {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}
