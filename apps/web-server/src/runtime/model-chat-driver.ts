import type { UnifiedMessage } from '@agent-flow/core/messages';
import type { StructuredLogger } from '@agent-flow/events';
import type { RecalledMemory } from '@agent-flow/memory';
import type { AdapterTokenUsage, FinishReason, MessagePart } from '@agent-flow/model-adapters/types';
import type { ChatStreamEvent, RuntimeChatInput } from '../contracts/api.js';
import { createTextMessage } from '../lib/messages.js';
import type { ModelAdapterService } from '../services/model-adapter-service.js';
import { ApprovalRequiredError } from './approval-error.js';
import {
  createAdapterAssistantMessage,
  createAdapterToolMessage,
  getAdapterText,
  toAdapterMessages,
  toMessageDeltaEvent,
  toMessageEvent,
  toUnifiedTokenUsage,
} from './message-mappers.js';
import { buildSystemPrompt } from './runtime-renderers.js';
import {
  MAX_MODEL_TOOL_ROUNDS,
  type ModelResponseOptions,
  type ModelToolCall,
  resolveMaxOutputTokens,
} from './runtime-types.js';
import type { ModelToolRunner } from './model-tool-runner.js';

export class ModelChatDriver {
  constructor(
    private readonly modelAdapterService: ModelAdapterService | undefined,
    private readonly modelToolRunner: ModelToolRunner,
    private readonly logger?: StructuredLogger,
  ) {}

  async generateModelResponse(
    input: RuntimeChatInput,
    recalled: RecalledMemory[],
    parentUuid: string | null,
    options: ModelResponseOptions = {},
  ): Promise<UnifiedMessage> {
    if (!this.modelAdapterService) {
      throw new Error('Model adapter service is not configured for chat generation.');
    }

    const adapter = await this.modelAdapterService.createAdapter(input.modelId);
    const messages = toAdapterMessages(input.history);
    const result = await adapter.generate({
      model: input.model,
      messages,
      systemPrompt: buildSystemPrompt(input, recalled, options.runtime),
      config: {
        maxOutputTokens: resolveMaxOutputTokens(input.reasoningEffort),
        temperature: 0.7,
      },
      metadata: {
        requestId: input.requestId,
        sessionId: input.session.sessionId,
        userId: input.userId,
        modelId: input.modelId,
        model: input.model,
      },
    });

    const responseText = getAdapterText(result.message.parts).trim();
    const fallbackText =
      responseText.length > 0
        ? responseText
        : 'The model returned no text for this turn.';

    this.logger?.info('chat.turn.completed', 'model chat turn completed', {
      attributes: {
        sessionId: input.session.sessionId,
        modelId: input.modelId,
        model: input.model,
        provider: adapter.provider,
        finishReason: result.finishReason,
      },
    });

    return createTextMessage('assistant', fallbackText, {
      parentUuid,
      metadata: {
        modelId: String(input.modelId),
        provider: adapter.provider,
        tokenUsage: toUnifiedTokenUsage(result.usage),
        extensions: {
          modelId: input.modelId,
          model: input.model,
          requestId: input.requestId,
          finishReason: result.finishReason,
        },
      },
    });
  }

  async streamModelResponse(
    input: RuntimeChatInput,
    recalled: RecalledMemory[],
    parentUuid: string | null,
    onEvent: (event: ChatStreamEvent) => void,
    options: ModelResponseOptions = {},
  ): Promise<UnifiedMessage | null> {
    if (!this.modelAdapterService) {
      throw new Error('Model adapter service is not configured for chat generation.');
    }

    const adapter = await this.modelAdapterService.createAdapter(input.modelId);
    const messages = toAdapterMessages(input.history);
    const tools = this.modelToolRunner.getModelToolSpecs();
    const message = createTextMessage('assistant', '', {
      parentUuid,
      metadata: {
        modelId: String(input.modelId),
        provider: adapter.provider,
        extensions: {
          modelId: input.modelId,
          model: input.model,
          requestId: input.requestId,
          streamState: 'streaming',
        },
      },
    });

    let responseText = '';
    let finishReason: FinishReason = 'stop';
    let usage: AdapterTokenUsage | undefined;
    let hasStreamed = false;
    let streamCompleted = false;
    let finalMessage = message;

    try {
      const maxToolRounds = options.maxToolRounds ?? MAX_MODEL_TOOL_ROUNDS;
      for (let round = 0; round < maxToolRounds; round += 1) {
        responseText = '';
        const toolCalls: ModelToolCall[] = [];
        const assistantParts: MessagePart[] = [];
        const currentMessage = round === 0 ? message : createTextMessage('assistant', '', {
          parentUuid,
          metadata: {
            modelId: String(input.modelId),
            provider: adapter.provider,
            extensions: {
              modelId: input.modelId,
              model: input.model,
              requestId: input.requestId,
              streamState: 'streaming',
              toolRound: round,
            },
          },
        });
        finalMessage = currentMessage;

        for await (const event of adapter.stream({
          model: input.model,
          messages,
          systemPrompt: buildSystemPrompt(input, recalled, options.runtime),
          tools,
          toolChoice: tools.length > 0 ? 'auto' : 'none',
          config: {
            maxOutputTokens: resolveMaxOutputTokens(input.reasoningEffort),
            temperature: 0.7,
          },
          metadata: {
            requestId: input.requestId,
            sessionId: input.session.sessionId,
            userId: input.userId,
            modelId: input.modelId,
            model: input.model,
          },
        })) {
          if (event.type === 'text-delta') {
            if (event.delta.length === 0) {
              continue;
            }
            responseText += event.delta;
            hasStreamed = true;
            currentMessage.timestamp = new Date().toISOString();
            currentMessage.metadata = {
              ...currentMessage.metadata,
              extensions: {
                ...(currentMessage.metadata.extensions ?? {}),
                streamState: 'streaming',
                finishReason,
              },
            };
            onEvent(toMessageDeltaEvent(currentMessage, event.delta));
          } else if (event.type === 'tool-call-end') {
            toolCalls.push({
              callId: event.callId,
              toolName: event.toolName,
              args: event.args,
            });
          } else if (event.type === 'finish') {
            finishReason = event.finishReason;
            usage = event.usage;
          } else if (event.type === 'error') {
            throw new Error(event.message);
          }
        }

        if (responseText.trim().length > 0) {
          assistantParts.push({ type: 'text', text: responseText });
        }

        for (const toolCall of toolCalls) {
          assistantParts.push({
            type: 'tool-call',
            callId: toolCall.callId,
            toolName: toolCall.toolName,
            args: toolCall.args,
          });
        }

        if (assistantParts.length > 0) {
          messages.push(createAdapterAssistantMessage(assistantParts, messages.at(-1)?.id ?? null));
        }

        if (toolCalls.length === 0) {
          streamCompleted = true;
          break;
        }

        const toolResultParts = await Promise.all(
          toolCalls.map((toolCall, index) => this.modelToolRunner.executeModelToolCall(input, toolCall, index)),
        );
        messages.push(createAdapterToolMessage(toolResultParts, messages.at(-1)?.id ?? null));
        hasStreamed = true;
      }
    } catch (error) {
      if (error instanceof ApprovalRequiredError) {
        throw error;
      }
      if (!hasStreamed) {
        return null;
      }
      throw error;
    }

    if (!streamCompleted) {
      return null;
    }

    if (responseText.trim().length === 0) {
      responseText = 'The model returned no text for this turn.';
    }
    finalMessage.content = [{ type: 'text', text: responseText }];
    finalMessage.timestamp = new Date().toISOString();
    finalMessage.metadata = {
      ...finalMessage.metadata,
      ...(usage ? { tokenUsage: toUnifiedTokenUsage(usage) } : {}),
      extensions: {
        ...(finalMessage.metadata.extensions ?? {}),
        streamState: 'done',
        finishReason,
      },
    };
    onEvent(toMessageEvent({ ...finalMessage, content: [...finalMessage.content], metadata: { ...finalMessage.metadata } }));

    this.logger?.info('chat.turn.completed', 'model chat stream completed', {
      attributes: {
        sessionId: input.session.sessionId,
        modelId: input.modelId,
        model: input.model,
        provider: adapter.provider,
        finishReason,
      },
    });

    return finalMessage;
  }
}
