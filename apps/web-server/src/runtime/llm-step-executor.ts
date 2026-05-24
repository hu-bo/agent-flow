import type { LlmStepExecutorLike, LlmStepRequest } from '@agent-flow/core';
import type { RuntimeChatInput } from '../contracts/api.js';
import type { ModelAdapterService } from '../services/model-adapter-service.js';
import { getAdapterText } from './message-mappers.js';
import { renderLlmStepPrompt } from './runtime-renderers.js';
import { resolveMaxOutputTokens } from './runtime-types.js';

export class ModelBackedLlmStepExecutor implements LlmStepExecutorLike {
  constructor(private readonly modelAdapterService: ModelAdapterService) {}

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
    const result = await adapter.generate({
      model,
      messages: [
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
      ],
      systemPrompt: [
        'You are an internal executor inside a goal-driven autonomous agent runtime.',
        'Complete only the current plan step.',
        'Use the provided context, prior step outputs, and step input as evidence.',
        'Return concise, concrete execution output that the next step can consume.',
      ].join('\n'),
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
    });

    const text = getAdapterText(result.message.parts).trim();
    return {
      mode: 'llm-step',
      stepId: stepRequest.step.id,
      title: stepRequest.step.title,
      text: text || 'The model returned no text for this internal step.',
      finishReason: result.finishReason,
      usage: result.usage,
    };
  }
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
