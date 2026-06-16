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
    if (result.status === 'blocked') {
      return `I couldn't complete the local task yet.\n\n${detail}`;
    }
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

export type RuntimeStepTraceStatus = 'pending' | 'running' | 'success' | 'error';

export interface RuntimeStepTrace {
  stepId: string;
  title: string;
  kind: string;
  status: RuntimeStepTraceStatus;
  startedAt?: string;
  endedAt?: string;
  durationMs?: number;
  toolName?: string;
  toolInputPreview?: Record<string, unknown>;
  runner?: {
    command?: string;
    args?: string[];
    exitCode?: number;
    durationMs?: number;
    error?: string;
  };
  error?: string;
  errorDetails?: unknown;
  checkpointId?: string;
}

export function extractRuntimeStepTraces(result: AgentRunResult): RuntimeStepTrace[] {
  type Internal = RuntimeStepTrace & { firstIndex: number };
  const steps = new Map<string, Internal>();
  let counter = 0;

  const getOrCreate = (stepId: string): Internal => {
    const existing = steps.get(stepId);
    if (existing) {
      return existing;
    }
    const created: Internal = {
      stepId,
      title: stepId || 'step',
      kind: 'unknown',
      status: 'pending',
      firstIndex: counter,
      toolName: undefined,
      runner: undefined,
      toolInputPreview: undefined,
      error: undefined,
      errorDetails: undefined,
      checkpointId: undefined,
    };
    counter += 1;
    steps.set(stepId, created);
    return created;
  };

  for (const event of result.events) {
    const payload = event.payload ?? {};
    const stepIdRaw = payload.stepId;
    const stepId = typeof stepIdRaw === 'string' && stepIdRaw.trim().length > 0 ? stepIdRaw : undefined;
    if (!stepId) {
      continue;
    }

    const step = getOrCreate(stepId);

    if (event.type === 'step.started') {
      step.title = readNonEmptyString(payload.title) ?? step.title;
      step.kind = readNonEmptyString(payload.kind) ?? step.kind;
      step.status = 'running';
      step.startedAt = event.timestamp;
      continue;
    }

    if (event.type === 'step.completed') {
      step.title = readNonEmptyString(payload.title) ?? step.title;
      step.kind = readNonEmptyString(payload.kind) ?? step.kind;
      step.status = 'success';
      step.endedAt = event.timestamp;
      continue;
    }

    if (event.type === 'step.failed') {
      step.title = readNonEmptyString(payload.title) ?? step.title;
      step.kind = readNonEmptyString(payload.kind) ?? step.kind;
      step.status = 'error';
      step.endedAt = event.timestamp;
      const error = readNonEmptyString(payload.error);
      if (error) {
        step.error = redactLikelySecret(error);
      }
      step.errorDetails = payload.errorDetails ?? step.errorDetails;
      continue;
    }

    if (event.type === 'tool.called') {
      const tool = readNonEmptyString(payload.tool);
      if (tool) {
        step.toolName = tool;
        step.toolInputPreview = buildToolInputPreview(tool, payload.input);
      }
      continue;
    }

    if (event.type === 'runner.event') {
      const runnerEvent = asRecord(payload.runnerEvent);
      const runnerType = readNonEmptyString(runnerEvent?.type);
      if (!runnerType) {
        continue;
      }
      if (!step.runner) {
        step.runner = {};
      }

      if (runnerType === 'started') {
        const task = asRecord(runnerEvent?.task);
        const command = readNonEmptyString(task?.command);
        const args = Array.isArray(task?.args)
          ? task.args.map((value) => redactLikelySecret(String(value)))
          : undefined;
        if (command) step.runner.command = command;
        if (args && args.length > 0) step.runner.args = args;
      } else if (runnerType === 'completed') {
        const exitCode = typeof runnerEvent?.exitCode === 'number' ? runnerEvent.exitCode : undefined;
        const durationMs = typeof runnerEvent?.durationMs === 'number' ? runnerEvent.durationMs : undefined;
        if (typeof exitCode === 'number') step.runner.exitCode = exitCode;
        if (typeof durationMs === 'number') step.runner.durationMs = durationMs;
      } else if (runnerType === 'error') {
        const error = readNonEmptyString(runnerEvent?.error);
        if (error) step.runner.error = redactLikelySecret(error);
      }
      continue;
    }

    if (event.type === 'checkpoint.created') {
      const checkpointId = readNonEmptyString(payload.checkpointId);
      if (checkpointId) {
        step.checkpointId = checkpointId;
      }
    }
  }

  const out = [...steps.values()]
    .map((step) => {
      if (step.startedAt && step.endedAt) {
        const start = Date.parse(step.startedAt);
        const end = Date.parse(step.endedAt);
        if (Number.isFinite(start) && Number.isFinite(end)) {
          step.durationMs = Math.max(0, end - start);
        }
      }
      return step;
    })
    .sort((left, right) => left.firstIndex - right.firstIndex)
    .map(({ firstIndex: _ignored, ...rest }) => rest);

  return out;
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
    result.rounds !== undefined ? `rounds=${result.rounds}` : undefined,
    result.verification
      ? `verification=${formatUnknown({
          status: result.verification.status,
          verifierName: result.verification.verifierName,
          reason: result.verification.reason,
          missingEvidence: result.verification.missingEvidence,
          nextAction: result.verification.nextAction,
        })}`
      : undefined,
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

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function readNonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function buildToolInputPreview(toolName: string, input: unknown): Record<string, unknown> | undefined {
  const rec = asRecord(input);
  if (!rec) {
    return undefined;
  }

  const pick = (keys: string[]): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    for (const key of keys) {
      const value = rec[key];
      if (value === undefined) continue;
      if (typeof value === 'string') {
        const masked = redactLikelySecret(value);
        out[key] = masked.length > 400 ? `${masked.slice(0, 400)}... (truncated)` : masked;
      } else if (Array.isArray(value)) {
        out[key] = value
          .slice(0, 20)
          .map((item) => redactLikelySecret(typeof item === 'string' ? item : String(item)));
      } else {
        out[key] = value;
      }
    }
    return out;
  };

  if (toolName === 'fs.read') {
    return pick(['path']);
  }
  if (toolName === 'fs.list') {
    return pick(['path']);
  }
  if (toolName === 'fs.search') {
    return pick(['path', 'pattern']);
  }
  if (toolName === 'fs.patch' || toolName === 'fs.multiPatch') {
    return pick(['path', 'edits']);
  }
  if (toolName === 'shell.exec') {
    return pick(['command', 'args']);
  }
  if (toolName === 'git.exec') {
    return pick(['args']);
  }

  return undefined;
}

function redactLikelySecret(value: string): string {
  const mask = (token: string): string => {
    const normalized = token.trim();
    if (normalized.length <= 12) return '[REDACTED]';
    return `${normalized.slice(0, 6)}...${normalized.slice(-4)}`;
  };

  return value
    .replace(/(Bearer\s+)[A-Za-z0-9._-]{16,}/gi, (_full, prefix: string) => `${prefix}[REDACTED]`)
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '[REDACTED_JWT]')
    .replace(/\bsk-[A-Za-z0-9_-]{20,}\b/g, (match) => mask(match))
    .replace(/\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b/gi, (match) => mask(match))
    .replace(/\bgh[pous]_[A-Za-z0-9]{20,}\b/gi, (match) => mask(match))
    .replace(/\bgithub_pat_[A-Za-z0-9]{20,}\b/gi, (match) => mask(match))
    .replace(/\bAKIA[0-9A-Z]{16}\b/g, (match) => mask(match));
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
    renderRunnerPlatformContext(input),
    input.session.specWorkflow
      ? `specWorkflow=phase:${input.session.specWorkflow.phase},awaitingConfirm:${input.session.specWorkflow.awaitingConfirm}`
      : 'specWorkflow=none',
  ].join('\n');
}

function renderRunnerPlatformContext(input: RuntimeChatInput): string {
  const platform = input.runnerPlatform;
  if (!platform) {
    return [
      'Runner Platform Context:',
      '- boundRunner=none-or-unknown',
      '- platform=unknown',
      '- Prefer semantic tools such as fs.read, fs.list, fs.search, fs.patch, and git.exec.',
      '- Before shell.exec, bind or query a runner so shell commands can match the actual OS.',
    ].join('\n');
  }

  const os = platform.os ?? 'unknown';
  const shell = platform.defaultShell ?? 'unknown';
  const commandStyle = renderCommandStyle(os, shell);
  return [
    'Runner Platform Context:',
    `- boundRunner=${input.preferredRunnerId}`,
    `- os=${os}`,
    `- arch=${platform.arch ?? 'unknown'}`,
    `- defaultShell=${shell}`,
    `- pathSeparator=${platform.pathSeparator ?? 'unknown'}`,
    `- lineEnding=${formatLineEnding(platform.lineEnding)}`,
    `- workspaceRoots=${platform.workspaceRoots.length > 0 ? platform.workspaceRoots.join(', ') : 'unknown'}`,
    `- availableCommands=${platform.availableCommands.length > 0 ? platform.availableCommands.join(', ') : 'unknown'}`,
    `- shellCommandGuidance=${commandStyle}`,
    '- Use read-only semantic tools without approval for inspection.',
    '- Use shell.exec only for real environment execution, and ensure command syntax matches this runner platform.',
  ].join('\n');
}

function renderCommandStyle(os: string, shell: string): string {
  const normalizedOs = os.toLowerCase();
  const normalizedShell = shell.toLowerCase();
  if (normalizedOs === 'windows') {
    if (normalizedShell.includes('powershell') || normalizedShell.includes('pwsh')) {
      return 'Windows runner: prefer PowerShell syntax and Windows paths; avoid Linux-only commands like grep/find/sed unless available.';
    }
    return 'Windows runner: prefer cmd.exe syntax and Windows paths; avoid Linux-only commands like grep/find/sed unless available.';
  }
  if (normalizedOs === 'linux' || normalizedOs === 'darwin') {
    return 'POSIX runner: prefer sh/bash-compatible commands and POSIX paths.';
  }
  return 'Unknown runner OS: prefer semantic tools and avoid shell-specific syntax unless necessary.';
}

function formatLineEnding(value: string | undefined): string {
  if (value === '\r\n') {
    return 'CRLF';
  }
  if (value === '\n') {
    return 'LF';
  }
  return value ?? 'unknown';
}

export function renderLlmStepPrompt(stepRequest: LlmStepRequest): string {
  const contextPreview = stepRequest.context.fragments
    .slice(0, 12)
    .map((fragment) => {
      const content = truncateText(fragment.content, 1200);
      return `[${fragment.source}]\n${content}`;
    })
    .join('\n\n');
  const consumesPreview =
    stepRequest.step.consumes && Object.keys(stepRequest.step.consumes).length > 0
      ? Object.entries(stepRequest.step.consumes)
          .map(([key, ref]) => `- ${key}: ${ref}`)
          .join('\n')
      : '(none)';

  return [
    `Overall goal:\n${stepRequest.request.goal}`,
    `Current step:\n${stepRequest.step.title} (${stepRequest.step.kind})`,
    stepRequest.request.plan?.completionContract
      ? `Completion contract:\n${formatUnknown(stepRequest.request.plan.completionContract)}`
      : 'Completion contract: none',
    `Consumes:\n${consumesPreview}`,
    `Step input:\n${formatUnknown(stepRequest.input)}`,
    contextPreview ? `Context:\n${contextPreview}` : 'Context: none',
    [
      'Produce the output for this step now.',
      'Use concise summaries only; do not include hidden chain-of-thought.',
      'When useful, return JSON like {"analysis":"...","implementation":"...","verification":"...","completionSignal":"COMPLETE","nextAction":"...","incompleteReason":"...","evidence":["..."]}.',
      'Only emit completionSignal=COMPLETE if the current objective has actually met the completion contract.',
      'If the objective is not done, do not claim completion. Instead provide incompleteReason, nextAction, and concrete evidence gaps.',
    ].join('\n'),
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
  const sections = asRecord(output.sections);
  if (sections) {
    const sectionText = ['analysis', 'implementation', 'verification']
      .map((key) => {
        const value = getObjectString(sections, key);
        return value ? `## ${titleCase(key)}\n${value}` : undefined;
      })
      .filter((value): value is string => Boolean(value))
      .join('\n\n');
    if (sectionText.trim().length > 0) {
      return sectionText;
    }
  }

  const text = getObjectString(output, 'text');
  if (typeof text !== 'string') {
    return undefined;
  }
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function titleCase(value: string): string {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
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
