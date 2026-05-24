import type { AgentRunResult, LlmStepRequest } from '@agent-flow/core';
import type { RecalledMemory } from '@agent-flow/memory';
import type { RuntimeChatInput } from '../contracts/api.js';
import { CODING_EFFICIENCY_SYSTEM_PROMPT } from '../prompts/coding-efficiency.js';
import type { RunnerDirective, RuntimeMode, RuntimeModelContext } from './runtime-types.js';
import { formatUnknown, isPlainObject, truncateText } from './runtime-types.js';

export function renderAssistantText(args: {
  input: RuntimeChatInput;
  result: AgentRunResult;
  recalled: RecalledMemory[];
  eventCountByType: Map<string, number>;
  runnerDirective: RunnerDirective | undefined;
}): string | undefined {
  const { result } = args;
  const latestOutput = extractLatestOutput(result);

  if (result.status !== 'succeeded') {
    const detail = result.error || (latestOutput !== undefined ? formatUnknown(latestOutput) : 'unknown error');
    return `I couldn't complete the local task.\n\n${detail}`;
  }

  if (isPlaceholderOutput(latestOutput)) {
    return undefined;
  }

  const rendered = renderRuntimeOutput(latestOutput);
  if (rendered) {
    return rendered;
  }

  if (latestOutput !== undefined) {
    return formatUnknown(latestOutput);
  }

  return 'The local task finished successfully.';
}

export function extractRuntimeSteps(result: AgentRunResult): string[] {
  const seen = new Set<string>();
  const steps: string[] = [];
  for (const event of result.events) {
    if (event.type !== 'step.started') {
      continue;
    }
    const stepId = String(event.payload.stepId ?? '');
    const title = String(event.payload.title ?? (stepId || 'step'));
    if (!stepId || seen.has(stepId)) {
      continue;
    }
    seen.add(stepId);
    steps.push(title);
  }
  return steps;
}

export function renderRuntimeSummary(context: RuntimeModelContext): string {
  const { result, eventCountByType, runnerDirective } = context;
  const steps = extractRuntimeSteps(result);
  const outputEntries = Object.entries(result.outputs);
  const latestOutput = extractLatestOutput(result);
  const outputPreview =
    latestOutput === undefined
      ? '(no runtime output)'
      : truncateText(formatUnknown(latestOutput), 12_000);
  const eventSummary = [...eventCountByType.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([type, count]) => `- ${type}: ${count}`)
    .join('\n');

  return [
    'Autonomous runtime result:',
    `status=${result.status}`,
    `taskId=${result.taskId}`,
    `coreSessionId=${result.sessionId}`,
    runnerDirective ? `runnerDirective=${runnerDirective.command} ${runnerDirective.args.join(' ')}`.trim() : undefined,
    steps.length > 0 ? `plannedSteps:\n${steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}` : 'plannedSteps=(none)',
    eventSummary ? `eventCounts:\n${eventSummary}` : undefined,
    `outputStepCount=${outputEntries.length}`,
    `latestOutput:\n${outputPreview}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join('\n\n');
}

export function renderRuntimeOutput(output: unknown): string | undefined {
  if (output === null || output === undefined) {
    return undefined;
  }
  if (!isPlainObject(output)) {
    return formatUnknown(output);
  }

  const llmStepText = renderLlmStepOutput(output);
  if (llmStepText) {
    return llmStepText;
  }

  if (Array.isArray(output.entries)) {
    return renderFsListOutput(output);
  }
  if (typeof output.content === 'string' && typeof output.path === 'string') {
    return renderFsReadOutput(output);
  }
  if (Array.isArray(output.matches)) {
    return renderFsSearchOutput(output);
  }
  if (Array.isArray(output.stdout) || Array.isArray(output.stderr)) {
    return renderShellExecOutput(output);
  }

  return formatUnknown(output);
}

export function buildSystemPrompt(
  input: RuntimeChatInput,
  recalled: RecalledMemory[],
  runtime?: RuntimeModelContext,
): string {
  const lines = [
    input.session.systemPrompt?.trim() || CODING_EFFICIENCY_SYSTEM_PROMPT,
  ];

  if (runtime) {
    lines.push(
      [
        'You are completing a goal-driven autonomous runtime turn.',
        'Use the runtime plan, events, and outputs as execution evidence.',
        'Do not say you only planned if execution evidence is available.',
        'If a runtime step produced placeholder reasoning, synthesize the final answer from the user goal, history, memory, and any concrete tool outputs.',
        'Be concise, name what was done, and include any remaining blocker or required approval.',
        '',
        renderRuntimeSummary(runtime),
      ].join('\n'),
    );
  }

  if (recalled.length > 0) {
    lines.push(
      [
        'Relevant memory for this conversation:',
        ...recalled.map((memory) => `- ${memory.text}`),
      ].join('\n'),
    );
  }

  return lines.join('\n\n');
}

export function renderEnvironmentContext(input: RuntimeChatInput, runtimeMode: RuntimeMode): string {
  return [
    `sessionId=${input.session.sessionId}`,
    `mode=${input.session.mode}`,
    `runtimeMode=${runtimeMode}`,
    `projectId=${input.session.projectId ?? 'none'}`,
    `cwd=${input.session.cwd || process.cwd()}`,
    `preferredRunnerId=${input.preferredRunnerId ?? 'none'}`,
    `model=${input.model}`,
    `reasoningEffort=${input.reasoningEffort ?? 'medium'}`,
    `attachments=${input.attachments.length}`,
    input.session.specWorkflow
      ? `specWorkflow=phase:${input.session.specWorkflow.phase},awaitingConfirm:${input.session.specWorkflow.awaitingConfirm}`
      : 'specWorkflow=none',
  ].join('\n');
}

export function renderLlmStepPrompt(stepRequest: LlmStepRequest): string {
  const contextPreview = stepRequest.context.fragments
    .slice(0, 12)
    .map((fragment) => {
      const content = truncateText(fragment.content, 1200);
      return `[${fragment.source}]\n${content}`;
    })
    .join('\n\n');
  const priorOutputs = Object.entries(stepRequest.outputs)
    .map(([stepId, output]) => `${stepId}:\n${truncateText(formatUnknown(output), 4000)}`)
    .join('\n\n');

  return [
    `Overall goal:\n${stepRequest.request.goal}`,
    `Current step:\n${stepRequest.step.title} (${stepRequest.step.kind})`,
    `Step input:\n${formatUnknown(stepRequest.input)}`,
    priorOutputs ? `Prior step outputs:\n${priorOutputs}` : 'Prior step outputs: none',
    contextPreview ? `Context:\n${contextPreview}` : 'Context: none',
    'Produce the output for this step now.',
  ].join('\n\n');
}

function extractLatestOutput(result: AgentRunResult): unknown {
  const outputEntries = Object.entries(result.outputs);
  if (outputEntries.length === 0) {
    return undefined;
  }
  return outputEntries[outputEntries.length - 1]?.[1];
}

function isPlaceholderOutput(value: unknown): boolean {
  if (!isPlainObject(value)) {
    return false;
  }
  return value.mode === 'placeholder';
}

function getObjectString(value: Record<string, unknown>, key: string): string | undefined {
  const target = value[key];
  return typeof target === 'string' ? target : undefined;
}

function getObjectNumber(value: Record<string, unknown>, key: string): number | undefined {
  const target = value[key];
  return typeof target === 'number' && Number.isFinite(target) ? target : undefined;
}

function renderFsListOutput(output: Record<string, unknown>): string {
  const path = getObjectString(output, 'path') ?? '.';
  const total = getObjectNumber(output, 'total') ?? 0;
  const entries = Array.isArray(output.entries) ? output.entries : [];
  const previewLines = entries
    .slice(0, 40)
    .map((entry) => {
      if (!isPlainObject(entry)) {
        return `- ${formatUnknown(entry)}`;
      }
      const type = getObjectString(entry, 'type') ?? 'entry';
      const name = getObjectString(entry, 'name') ?? getObjectString(entry, 'path') ?? '(unknown)';
      const size = getObjectNumber(entry, 'size');
      const sizeLabel = typeof size === 'number' ? ` (${size} bytes)` : '';
      return `- [${type}] ${name}${sizeLabel}`;
    })
    .join('\n');

  const extra = total > 40 ? `\n... and ${total - 40} more.` : '';
  return [`Listed ${total} entries under: ${path}`, previewLines ? `\n${previewLines}${extra}` : ''].join('');
}

function renderLlmStepOutput(output: Record<string, unknown>): string | undefined {
  if (output.mode !== 'llm-step') {
    return undefined;
  }
  const text = getObjectString(output, 'text');
  if (typeof text !== 'string') {
    return undefined;
  }
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function renderFsReadOutput(output: Record<string, unknown>): string {
  const path = getObjectString(output, 'path') ?? '(unknown path)';
  const size = getObjectNumber(output, 'size');
  const sizeLabel = typeof size === 'number' ? `${size} bytes` : 'unknown size';
  const content = getObjectString(output, 'content') ?? '';
  const maxPreviewChars = 8000;
  const truncated = content.length > maxPreviewChars;
  const preview = truncated ? `${content.slice(0, maxPreviewChars)}\n\n... (truncated)` : content;

  return [`Read file: ${path} (${sizeLabel})`, '', preview || '(empty file)'].join('\n');
}

function renderFsSearchOutput(output: Record<string, unknown>): string {
  const path = getObjectString(output, 'path') ?? '.';
  const pattern = getObjectString(output, 'pattern') ?? '(pattern)';
  const total = getObjectNumber(output, 'total') ?? 0;
  const matches = Array.isArray(output.matches) ? output.matches : [];
  const previewLines = matches
    .slice(0, 40)
    .map((match) => {
      if (!isPlainObject(match)) {
        return `- ${formatUnknown(match)}`;
      }
      const file = getObjectString(match, 'path') ?? '(unknown file)';
      const line = getObjectNumber(match, 'line');
      const content = getObjectString(match, 'content') ?? '';
      const lineLabel = typeof line === 'number' ? `:${line}` : '';
      return `- ${file}${lineLabel} ${content}`;
    })
    .join('\n');
  const extra = total > 40 ? `\n... and ${total - 40} more.` : '';

  return [
    `Found ${total} matches for "${pattern}" under: ${path}`,
    previewLines ? `\n${previewLines}${extra}` : '',
  ].join('');
}

function renderShellExecOutput(output: Record<string, unknown>): string {
  const command = getObjectString(output, 'command') ?? 'command';
  const stdout = Array.isArray(output.stdout)
    ? output.stdout.filter((item): item is string => typeof item === 'string')
    : [];
  const stderr = Array.isArray(output.stderr)
    ? output.stderr.filter((item): item is string => typeof item === 'string')
    : [];

  const sections: string[] = [`Executed: ${command}`];
  if (stdout.length > 0) {
    sections.push(`STDOUT:\n${stdout.join('\n')}`);
  }
  if (stderr.length > 0) {
    sections.push(`STDERR:\n${stderr.join('\n')}`);
  }
  if (stdout.length === 0 && stderr.length === 0) {
    sections.push('(No output)');
  }
  return sections.join('\n\n');
}
