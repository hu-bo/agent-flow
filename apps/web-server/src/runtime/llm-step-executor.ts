import type {
  LlmStepExecutorLike,
  LlmStepOutputPhase,
  LlmStepRequest,
  StructuredLlmStepOutput,
  ToolExecutorLike,
  ToolRegistryLike,
} from '@agent-flow/core';
import type { AdapterMessage, GenerationResult } from '@agent-flow/model-adapters/types';
import type { RuntimeChatInput } from '../contracts/api.js';
import type { ModelAdapterService } from '../services/model-adapter-service.js';
import {
  createAdapterToolMessage,
  getAdapterText,
} from './message-mappers.js';
import { ModelToolRunner } from './model-tool-runner.js';
import { renderLlmStepPrompt, renderStructuredMarkdown } from './runtime-renderers.js';
import { resolveMaxOutputTokens, type ModelToolCall } from './runtime-types.js';

const DEFAULT_LLM_STEP_TOOL_NAMES = ['shell.exec'] as const;
const DEFAULT_LLM_STEP_MAX_TOOL_ROUNDS = 4;
const DEFAULT_LLM_STEP_TIMEOUT_MS = 120_000;

export interface ModelBackedLlmStepExecutorOptions {
  toolRegistry?: ToolRegistryLike;
  toolExecutor?: ToolExecutorLike;
  enabledToolNames?: readonly string[];
  maxToolRounds?: number;
  timeoutMs?: number;
}

export class ModelBackedLlmStepExecutor implements LlmStepExecutorLike {
  private readonly modelToolRunner: ModelToolRunner;
  private readonly enabledToolNames: readonly string[];
  private readonly maxToolRounds: number;
  private readonly timeoutMs: number;

  constructor(
    private readonly modelAdapterService: ModelAdapterService,
    options: ModelBackedLlmStepExecutorOptions = {},
  ) {
    this.modelToolRunner = new ModelToolRunner(options.toolRegistry, options.toolExecutor);
    this.enabledToolNames = options.enabledToolNames ?? DEFAULT_LLM_STEP_TOOL_NAMES;
    this.maxToolRounds = Math.max(0, Math.floor(options.maxToolRounds ?? DEFAULT_LLM_STEP_MAX_TOOL_ROUNDS));
    this.timeoutMs = Math.max(1_000, Math.floor(options.timeoutMs ?? DEFAULT_LLM_STEP_TIMEOUT_MS));
  }

  async execute(stepRequest: LlmStepRequest): Promise<unknown> {
    if (isRepositorySummaryStep(stepRequest)) {
      return createRepositorySummaryFallback(
        stepRequest,
        'The repository summary reused the completed analysis without an additional model call.',
        [],
      );
    }

    const modelId = getMetadataNumber(stepRequest.request.metadata, 'modelId');
    const model = getMetadataString(stepRequest.request.metadata, 'model');
    if (modelId === undefined || !model) {
      return {
        mode: 'placeholder',
        reason: 'model metadata missing',
        goal: stepRequest.request.goal,
        contextTokens: stepRequest.context.tokenUsed,
        stepInput: stepRequest.input,
      };
    }

    const adapter = await this.modelAdapterService.createAdapter(modelId);
    const toolAttempts: StructuredLlmStepOutput['toolAttempts'] = [];
    const tools = this.modelToolRunner.getModelToolSpecs({
      internalToolNames: this.enabledToolNames,
    });
    const messages: AdapterMessage[] = [
      {
        id: `${stepRequest.step.id}_input`,
        parentId: null,
        role: 'user',
        createdAt: new Date().toISOString(),
        parts: [
          {
            type: 'text',
            text: renderLlmStepPrompt(stepRequest),
          },
        ],
      },
    ];

    const baseRequest = {
      model,
      systemPrompt: buildLlmStepSystemPrompt(tools.length > 0),
      config: {
        maxOutputTokens: resolveMaxOutputTokens(
          getMetadataReasoningEffort(stepRequest.request.metadata),
        ),
        temperature: 0.2,
      },
      metadata: {
        requestId: getMetadataString(stepRequest.request.metadata, 'requestId'),
        sessionId: stepRequest.session.id,
        modelId,
        model,
        stepId: stepRequest.step.id,
        taskId: stepRequest.session.taskId,
      },
    };

    let result: GenerationResult | undefined;
    let toolRound = 0;
    while (true) {
      const allowTools = tools.length > 0 && toolRound < this.maxToolRounds;
      try {
        result = await generateWithDeadline(
          (signal) => adapter.generate({
            ...baseRequest,
            messages,
            tools: allowTools ? tools : undefined,
            toolChoice: allowTools ? 'auto' : 'none',
            signal,
          }),
          this.timeoutMs,
          stepRequest.signal,
          stepRequest.step.id,
        );
      } catch (error) {
        throw error;
      }

      const toolCalls = allowTools ? extractToolCalls(result) : [];
      if (toolCalls.length === 0) {
        break;
      }

      messages.push(result.message);
      const toolResultParts = await Promise.all(
        toolCalls.map((toolCall, index) =>
          this.modelToolRunner.executeModelToolCallWithContext({
            toolCall,
            stepId: `${stepRequest.step.id}_tool_${toolRound + 1}_${index + 1}`,
            context: {
              taskId: stepRequest.session.taskId,
              sessionId: stepRequest.session.id,
              stepId: stepRequest.step.id,
              signal: stepRequest.signal,
              metadata: stepRequest.request.metadata,
              onEvent: async (type, payload) => {
                if (type === 'tool.result') {
                  toolAttempts.push({
                    toolName: typeof payload.tool === 'string' ? payload.tool : toolCall.toolName,
                    ok: payload.ok === true,
                    error: typeof payload.error === 'string' ? payload.error : undefined,
                  });
                }
                await stepRequest.onEvent?.(type, payload);
              },
            },
          }),
        ),
      );
      messages.push(createAdapterToolMessage(toolResultParts, result.message.id));
      toolRound += 1;
    }

    if (!result) {
      throw new Error('Internal LLM step ended without a model result.');
    }
    const text = getAdapterText(result.message.parts).trim();
    const phase = inferLlmStepPhase(stepRequest);
    return {
      mode: 'llm-step',
      stepId: stepRequest.step.id,
      title: stepRequest.step.title,
      phase,
      text: text || 'The model returned no text for this internal step.',
      sections: parseStructuredSections(text, phase, stepRequest.step.title),
      completionSignal: getMetadataLikeString(parsedStepObject(text), 'completionSignal'),
      nextAction: getMetadataLikeString(parsedStepObject(text), 'nextAction'),
      incompleteReason: getMetadataLikeString(parsedStepObject(text), 'incompleteReason'),
      evidence: getMetadataLikeStringArray(parsedStepObject(text), 'evidence'),
      toolAttempts,
      finishReason: result.finishReason,
      usage: result.usage,
    } satisfies StructuredLlmStepOutput;
  }
}

class LlmStepTimeoutError extends Error {
  constructor(stepId: string, timeoutMs: number) {
    super(`Internal LLM step "${stepId}" timed out after ${timeoutMs}ms.`);
    this.name = 'LlmStepTimeoutError';
  }
}

async function generateWithDeadline<T>(
  generate: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  parentSignal: AbortSignal | undefined,
  stepId: string,
): Promise<T> {
  if (parentSignal?.aborted) {
    throw parentSignal.reason ?? new Error('LLM step was aborted.');
  }

  const controller = new AbortController();
  let rejectFromParent: ((reason?: unknown) => void) | undefined;
  const parentAbort = new Promise<never>((_, reject) => {
    rejectFromParent = reject;
  });
  const abortFromParent = () => {
    const reason = parentSignal?.reason ?? new Error('LLM step was aborted.');
    controller.abort(reason);
    rejectFromParent?.(reason);
  };
  parentSignal?.addEventListener('abort', abortFromParent, { once: true });
  let timeoutHandle: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      const error = new LlmStepTimeoutError(stepId, timeoutMs);
      controller.abort(error);
      reject(error);
    }, timeoutMs);
    timeoutHandle.unref?.();
  });

  try {
    return await Promise.race([generate(controller.signal), timeout, parentAbort]);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
    parentSignal?.removeEventListener('abort', abortFromParent);
  }
}

function isRepositorySummaryStep(stepRequest: LlmStepRequest): boolean {
  return stepRequest.step.title === 'repo.summary' || getMetadataLikeString(stepRequest.input, 'mode') === 'repo-summary';
}

function createRepositorySummaryFallback(
  stepRequest: LlmStepRequest,
  timeoutReason: string,
  toolAttempts: StructuredLlmStepOutput['toolAttempts'],
): StructuredLlmStepOutput {
  const analysis = stepRequest.input.analysis;
  const text = extractPriorStepText(analysis)
    ?? 'Repository inspection completed successfully, but the final model summary timed out.';
  return {
    mode: 'llm-step',
    stepId: stepRequest.step.id,
    title: stepRequest.step.title,
    phase: 'analysis',
    text,
    sections: { analysis: text },
    completionSignal: 'COMPLETE',
    evidence: ['workspace-inspection', 'repo.analysis'],
    toolAttempts,
    finishReason: 'analysis-reuse',
    usage: undefined,
    incompleteReason: undefined,
    nextAction: undefined,
    timeoutReason,
  } as StructuredLlmStepOutput & { timeoutReason: string };
}

function extractPriorStepText(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return renderRepositorySummaryText(value);
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;

  const renderedSections = renderRepositorySummarySections(record.sections);
  if (renderedSections) {
    return renderedSections;
  }

  for (const candidate of [record.text, record.analysis]) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return renderRepositorySummaryText(candidate);
    }
  }
  return undefined;
}

function renderRepositorySummaryText(text: string): string {
  const trimmed = text.trim();
  const parsed = tryParseJsonObject(trimmed);
  return parsed ? renderRepositorySummaryObject(parsed) ?? trimmed : trimmed;
}

function renderRepositorySummarySections(value: unknown): string | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }
  return renderRepositorySummaryObject(value as Record<string, unknown>);
}

function renderRepositorySummaryObject(value: Record<string, unknown>): string | undefined {
  const summary = renderStructuredMarkdown(value.analysis ?? value.summary);
  const details = renderStructuredMarkdown(value.implementation ?? value.details);
  const verification = renderStructuredMarkdown(value.verification);
  const evidence = verification ? undefined : renderStructuredMarkdown(value.evidence);
  const sections = [
    summary,
    details ? `## Project Details\n${details}` : undefined,
    verification ? `## Verification\n${verification}` : undefined,
    evidence ? `## Evidence\n${evidence}` : undefined,
  ].filter((section): section is string => Boolean(section?.trim()));

  return sections.length > 0 ? sections.join('\n\n') : undefined;
}

function buildLlmStepSystemPrompt(toolsEnabled: boolean): string {
  const lines = [
    'You are an internal executor inside a goal-driven autonomous agent runtime.',
    'Complete only the current plan step.',
    'Use the provided context, prior step outputs, and step input as evidence.',
    'Return concise, concrete execution output that the next step can consume.',
    'Do not expose private chain-of-thought. Provide short decision summaries and evidence only.',
    'Prefer JSON with keys analysis, implementation, and verification when it fits the step.',
    'The analysis, implementation, and verification values must be concise Markdown strings, not nested objects.',
  ];

  if (toolsEnabled) {
    lines.push(
      'You may call shell_exec to inspect the workspace, read files, apply safe edits, and run verification commands when that evidence is needed.',
      'Prefer read-only shell commands for discovery. Mutating shell operations may require approval and should be used only when necessary to complete the step.',
      'After using tools, summarize the concrete evidence and continue the current step.',
      'Do not include incidental transport metadata such as byte counts, object sizes, exit codes, or durations in user-facing step output unless the user asks for those details.',
    );
  }

  return lines.join('\n');
}

function extractToolCalls(result: GenerationResult): ModelToolCall[] {
  return result.message.parts
    .filter((part): part is Extract<(typeof result.message.parts)[number], { type: 'tool-call' }> => part.type === 'tool-call')
    .map((part) => ({
      callId: part.callId,
      toolName: part.toolName,
      args: part.args,
    }));
}

function inferLlmStepPhase(stepRequest: LlmStepRequest): LlmStepOutputPhase {
  const title = stepRequest.step.title.toLowerCase();
  const mode = getMetadataLikeString(stepRequest.input, 'mode')?.toLowerCase() ?? '';
  const joined = `${title} ${mode}`;

  if (
    joined.includes('validation') ||
    joined.includes('verification') ||
    joined.includes('regression') ||
    joined.includes('acceptance') ||
    joined.includes('preservation')
  ) {
    return 'verification';
  }
  if (
    joined.includes('implementation') ||
    joined.includes('execution') ||
    joined.includes('tool-first')
  ) {
    return 'implementation';
  }
  return 'analysis';
}

function parseStructuredSections(
  text: string,
  phase: LlmStepOutputPhase,
  stepTitle: string,
): StructuredLlmStepOutput['sections'] {
  const trimmed = text.trim();
  if (!trimmed) {
    return { [phase]: 'The model returned no text for this internal step.' };
  }

  const parsed = tryParseJsonObject(trimmed);
  if (parsed) {
    const sections: StructuredLlmStepOutput['sections'] = {};
    const analysis = getStructuredSection(parsed, 'analysis');
    const implementation = getStructuredSection(parsed, 'implementation');
    const verification = getStructuredSection(parsed, 'verification');
    if (isRepositoryInspectionStep(stepTitle) && phase === 'analysis') {
      const summary = [
        analysis,
        implementation ? `## Project Details\n${implementation}` : undefined,
      ].filter((section): section is string => Boolean(section)).join('\n\n');
      return {
        ...(summary ? { analysis: summary } : {}),
        ...(verification ? { verification } : {}),
      };
    }
    if (analysis) sections.analysis = analysis;
    if (implementation) sections.implementation = implementation;
    if (verification) sections.verification = verification;
    if (Object.keys(sections).length > 0) {
      return sections;
    }
  }

  return { [phase]: trimmed };
}

function getStructuredSection(record: Record<string, unknown>, key: string): string | undefined {
  return renderStructuredMarkdown(record[key]);
}

function isRepositoryInspectionStep(stepTitle: string): boolean {
  return stepTitle === 'repo.analysis' || stepTitle === 'repo.summary';
}

function parsedStepObject(text: string): Record<string, unknown> | undefined {
  return tryParseJsonObject(text) ?? undefined;
}

function tryParseJsonObject(text: string): Record<string, unknown> | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  const candidate = fenced ?? text;
  if (!candidate.startsWith('{') || !candidate.endsWith('}')) {
    return null;
  }

  try {
    const parsed = JSON.parse(candidate) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function getMetadataLikeString(record: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = record?.[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function getMetadataLikeStringArray(record: Record<string, unknown> | undefined, key: string): string[] | undefined {
  const value = record?.[key];
  if (!Array.isArray(value)) {
    return undefined;
  }
  const items = value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
  return items.length > 0 ? items : undefined;
}

function getMetadataString(metadata: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = metadata?.[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function getMetadataNumber(metadata: Record<string, unknown> | undefined, key: string): number | undefined {
  const value = metadata?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function getMetadataReasoningEffort(metadata: Record<string, unknown> | undefined): RuntimeChatInput['reasoningEffort'] {
  const value = metadata?.reasoningEffort;
  return value === 'low' || value === 'medium' || value === 'high' ? value : undefined;
}
