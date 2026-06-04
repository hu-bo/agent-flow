import type {
  ContextFragment,
  WorkflowTriageAgent,
  WorkflowTriageDecision,
  WorkflowTriageInput,
} from '@agent-flow/core';
import type { RuntimeChatInput } from '../contracts/api.js';
import type { ModelAdapterService } from '../services/model-adapter-service.js';
import { getAdapterText } from './message-mappers.js';
import { formatUnknown, resolveMaxOutputTokens, truncateText } from './runtime-types.js';

export class ModelBackedWorkflowTriageAgent implements WorkflowTriageAgent {
  readonly name = 'model-workflow-triage';

  constructor(private readonly modelAdapterService: ModelAdapterService) {}

  async triage(input: WorkflowTriageInput): Promise<WorkflowTriageDecision | undefined> {
    const modelId = getMetadataNumber(input.request.metadata, 'modelId');
    const model = getMetadataString(input.request.metadata, 'model');
    if (modelId === undefined || !model) {
      return undefined;
    }

    const adapter = await this.modelAdapterService.createAdapter(modelId);
    const result = await adapter.generate({
      model,
      messages: [
        {
          id: `triage_${Date.now()}`,
          parentId: null,
          role: 'user',
          createdAt: new Date().toISOString(),
          parts: [
            {
              type: 'text',
              text: renderWorkflowTriagePrompt(input),
            },
          ],
        },
      ],
      systemPrompt: [
        'You are an internal workflow triage agent inside an autonomous coding runtime.',
        'Choose the best workflow for the current user request.',
        'Available workflows:',
        '- coding: the user primarily wants code changes, bug fixes, refactors, implementations, tests, builds, or validation work.',
        '- repo-understanding: the user primarily wants to understand the repository, project, codebase, architecture, or a guided walkthrough of what exists.',
        '- generic: neither of the above is the main goal.',
        'Important rules:',
        '- If the user asks to modify, fix, implement, refactor, test, build, lint, or verify code, prefer coding even if project/repo nouns appear.',
        '- Prefer repo-understanding only when the primary intent is understanding the repository itself.',
        'Return strict JSON only: {"workflow":"coding|repo-understanding|generic","reason":"short reason"}.',
      ].join('\n'),
      config: {
        maxOutputTokens: Math.min(512, resolveMaxOutputTokens(getMetadataReasoningEffort(input.request.metadata))),
        temperature: 0,
      },
      metadata: {
        requestId: getMetadataString(input.request.metadata, 'requestId'),
        sessionId: getMetadataString(input.request.metadata, 'sessionId'),
        modelId,
        model,
        triageAgent: this.name,
      },
    });

    return parseWorkflowTriageDecision(getAdapterText(result.message.parts));
  }
}

function renderWorkflowTriagePrompt(input: WorkflowTriageInput): string {
  const contextPreview = input.context.fragments
    .slice(0, 6)
    .map((fragment: ContextFragment) => {
      const content = truncateText(fragment.content, 400);
      return `- ${fragment.source}: ${content}`;
    })
    .join('\n');

  return [
    `User message:\n${input.userMessage}`,
    `Planning signals:\n${formatUnknown(input.signals)}`,
    input.semanticToolCandidate
      ? `Semantic tool candidate:\n${formatUnknown(input.semanticToolCandidate)}`
      : 'Semantic tool candidate: none',
    contextPreview ? `Context preview:\n${contextPreview}` : 'Context preview: none',
  ].join('\n\n');
}

function parseWorkflowTriageDecision(text: string): WorkflowTriageDecision | undefined {
  const parsed = tryParseJsonObject(text.trim());
  if (!parsed) {
    return undefined;
  }

  const workflow = parsed.workflow;
  if (workflow !== 'coding' && workflow !== 'repo-understanding' && workflow !== 'generic') {
    return undefined;
  }

  const reason = typeof parsed.reason === 'string' && parsed.reason.trim().length > 0
    ? parsed.reason.trim()
    : undefined;

  return {
    workflow,
    reason,
  };
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

function getMetadataString(metadata: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = metadata?.[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function getMetadataNumber(metadata: Record<string, unknown> | undefined, key: string): number | undefined {
  const value = metadata?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function getMetadataReasoningEffort(
  metadata: Record<string, unknown> | undefined,
): RuntimeChatInput['reasoningEffort'] {
  const value = metadata?.reasoningEffort;
  return value === 'low' || value === 'medium' || value === 'high' ? value : undefined;
}
