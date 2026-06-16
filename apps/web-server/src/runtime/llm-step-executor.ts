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
import { renderLlmStepPrompt } from './runtime-renderers.js';
import { resolveMaxOutputTokens, type ModelToolCall } from './runtime-types.js';

const DEFAULT_LLM_STEP_TOOL_NAMES = ['shell.exec'] as const;
const DEFAULT_LLM_STEP_MAX_TOOL_ROUNDS = 4;

export interface ModelBackedLlmStepExecutorOptions {
  toolRegistry?: ToolRegistryLike;
  toolExecutor?: ToolExecutorLike;
  enabledToolNames?: readonly string[];
  maxToolRounds?: number;
}

export class ModelBackedLlmStepExecutor implements LlmStepExecutorLike {
  private readonly modelToolRunner: ModelToolRunner;
  private readonly enabledToolNames: readonly string[];
  private readonly maxToolRounds: number;

  constructor(
    private readonly modelAdapterService: ModelAdapterService,
    options: ModelBackedLlmStepExecutorOptions = {},
  ) {
    this.modelToolRunner = new ModelToolRunner(options.toolRegistry, options.toolExecutor);
    this.enabledToolNames = options.enabledToolNames ?? DEFAULT_LLM_STEP_TOOL_NAMES;
    this.maxToolRounds = Math.max(0, Math.floor(options.maxToolRounds ?? DEFAULT_LLM_STEP_MAX_TOOL_ROUNDS));
  }

  async execute(stepRequest: LlmStepRequest): Promise<unknown> {
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
      signal: stepRequest.signal,
    };

    let result: GenerationResult | undefined;
    let toolRound = 0;
    while (true) {
      const allowTools = tools.length > 0 && toolRound < this.maxToolRounds;
      result = await adapter.generate({
        ...baseRequest,
        messages,
        tools: allowTools ? tools : undefined,
        toolChoice: allowTools ? 'auto' : 'none',
      });

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
              onEvent: stepRequest.onEvent,
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
      sections: parseStructuredSections(text, phase),
      completionSignal: getMetadataLikeString(parsedStepObject(text), 'completionSignal'),
      nextAction: getMetadataLikeString(parsedStepObject(text), 'nextAction'),
      incompleteReason: getMetadataLikeString(parsedStepObject(text), 'incompleteReason'),
      evidence: getMetadataLikeStringArray(parsedStepObject(text), 'evidence'),
      finishReason: result.finishReason,
      usage: result.usage,
    } satisfies StructuredLlmStepOutput;
  }
}

function buildLlmStepSystemPrompt(toolsEnabled: boolean): string {
  const lines = [
    'You are an internal executor inside a goal-driven autonomous agent runtime.',
    'Complete only the current plan step.',
    'Use the provided context, prior step outputs, and step input as evidence.',
    'Return concise, concrete execution output that the next step can consume.',
    'Do not expose private chain-of-thought. Provide short decision summaries and evidence only.',
    'Prefer JSON with keys analysis, implementation, and verification when it fits the step.',
  ];

  if (toolsEnabled) {
    lines.push(
      'You may call shell_exec to inspect the workspace, read files, apply safe edits, and run verification commands when that evidence is needed.',
      'Prefer read-only shell commands for discovery. Mutating shell operations may require approval and should be used only when necessary to complete the step.',
      'After using tools, summarize the concrete evidence and continue the current step.',
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
    joined.includes('summary') ||
    joined.includes('tool-first')
  ) {
    return 'implementation';
  }
  return 'analysis';
}

function parseStructuredSections(text: string, phase: LlmStepOutputPhase): StructuredLlmStepOutput['sections'] {
  const trimmed = text.trim();
  if (!trimmed) {
    return { [phase]: 'The model returned no text for this internal step.' };
  }

  const parsed = tryParseJsonObject(trimmed);
  if (parsed) {
    const sections: StructuredLlmStepOutput['sections'] = {};
    const analysis = getMetadataLikeString(parsed, 'analysis');
    const implementation = getMetadataLikeString(parsed, 'implementation');
    const verification = getMetadataLikeString(parsed, 'verification');
    if (analysis) sections.analysis = analysis;
    if (implementation) sections.implementation = implementation;
    if (verification) sections.verification = verification;
    if (Object.keys(sections).length > 0) {
      return sections;
    }
  }

  return { [phase]: trimmed };
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
