import type { UnifiedMessage } from '@agent-flow/core/messages';
import type { ChatStreamEvent, SessionRecord } from '../contracts/api.js';
import { ValidationError } from '../lib/errors.js';
import { createSpecPromptMessage, type SpecWorkflowService } from './spec-workflow-service.js';

interface DecorateUserMessageOptions {
  autoPrompt: boolean;
}

interface EventProcessorContext {
  session: SessionRecord;
  persistMessage(message: UnifiedMessage): Promise<UnifiedMessage>;
  listPersistedMessages(): Promise<UnifiedMessage[]>;
  recordMemory(message: UnifiedMessage): Promise<void>;
}

interface StreamRestart {
  restart: true;
  history: UnifiedMessage[];
  requestMessage: string;
}

interface StreamContinue {
  restart: false;
  events: ChatStreamEvent[];
}

export type ChatModeStreamDecision = StreamRestart | StreamContinue;

export interface ChatModeEventProcessor {
  mapDelta(event: ChatStreamEvent): ChatStreamEvent | null;
  handleMessage(event: Extract<ChatStreamEvent, { type: 'msg' }>): Promise<ChatModeStreamDecision>;
}

export interface ChatModeStrategy {
  decorateUserMessage(
    session: SessionRecord,
    message: UnifiedMessage,
    options: DecorateUserMessageOptions,
  ): Promise<UnifiedMessage>;
  createEventProcessor(context: EventProcessorContext): ChatModeEventProcessor;
}

export class ChatModeStrategyRegistry {
  private readonly vibe = new VibeChatModeStrategy();
  private readonly spec: SpecChatModeStrategy;

  constructor(specWorkflowService: SpecWorkflowService) {
    this.spec = new SpecChatModeStrategy(specWorkflowService);
  }

  forSession(session: SessionRecord): ChatModeStrategy {
    return session.mode === 'spec' ? this.spec : this.vibe;
  }
}

class VibeChatModeStrategy implements ChatModeStrategy {
  async decorateUserMessage(
    _session: SessionRecord,
    message: UnifiedMessage,
    _options: DecorateUserMessageOptions,
  ): Promise<UnifiedMessage> {
    return message;
  }

  createEventProcessor(context: EventProcessorContext): ChatModeEventProcessor {
    return {
      mapDelta: () => null,
      handleMessage: async (event) => {
        const upserted = await context.persistMessage(event.msg);
        if (!isStreamingMessage(upserted)) await context.recordMemory(upserted);
        return { restart: false, events: [event] };
      },
    };
  }
}

class SpecChatModeStrategy implements ChatModeStrategy {
  constructor(private readonly specWorkflowService: SpecWorkflowService) {}

  async decorateUserMessage(
    session: SessionRecord,
    message: UnifiedMessage,
    options: DecorateUserMessageOptions,
  ): Promise<UnifiedMessage> {
    const workflow = (await this.specWorkflowService.ensureSpecState(session.sessionId)).workflow;
    if (options.autoPrompt) {
      return {
        ...message,
        metadata: {
          ...message.metadata,
          isMeta: true,
          extensions: {
            ...(message.metadata.extensions ?? {}),
            specAutoPrompt: true,
            specPhase: workflow.phase,
          },
        },
      };
    }

    const phasePrompt = this.specWorkflowService.buildSpecPrompt({ session, phase: workflow.phase });
    const original = message.type === 'text' ? message.text.trim() : '';
    return {
      ...message,
      ...(message.type === 'text'
        ? { text: [phasePrompt, '', 'User input:', original || '(empty)'].join('\n') }
        : {}),
      metadata: {
        ...message.metadata,
        extensions: {
          ...(message.metadata.extensions ?? {}),
          specPhase: workflow.phase,
        },
      },
    };
  }

  createEventProcessor(context: EventProcessorContext): ChatModeEventProcessor {
    return new SpecChatModeEventProcessor(context, this.specWorkflowService);
  }
}

class SpecChatModeEventProcessor implements ChatModeEventProcessor {
  private readonly documentBuffers = new Map<string, string>();
  private validationRegenerateAttempts = 0;

  constructor(
    private readonly context: EventProcessorContext,
    private readonly specWorkflowService: SpecWorkflowService,
  ) {}

  mapDelta(event: ChatStreamEvent): ChatStreamEvent | null {
    if (event.type !== 'msg_delta') return null;
    const content = `${this.documentBuffers.get(event.msg_id) ?? ''}${event.delta}`;
    this.documentBuffers.set(event.msg_id, content);
    return {
      type: 'spec_doc_update',
      msg_id: event.msg_id,
      doc_type: this.context.session.specWorkflow?.phase ?? 'requirements',
      content,
      delta: event.delta,
      done: false,
    };
  }

  async handleMessage(
    event: Extract<ChatStreamEvent, { type: 'msg' }>,
  ): Promise<ChatModeStreamDecision> {
    if (isFinalAssistantMessage(event.msg)) {
      const validation = await this.validateMessage(event.msg, true);
      if (validation.restart) return validation;

      const captured = await this.specWorkflowService.captureAssistantDocument(
        this.context.session.sessionId,
        event.msg,
      );
      if (captured) {
        const summary = await this.context.persistMessage(captured.summary);
        await this.context.recordMemory(summary);
        return {
          restart: false,
          events: [
            {
              type: 'spec_doc_update',
              msg_id: event.msg.uuid,
              doc_type: captured.docType,
              content: captured.content,
              done: true,
            },
            { type: 'msg', msg: summary },
          ],
        };
      }
    }

    const upserted = await this.context.persistMessage(event.msg);
    if (!isStreamingMessage(upserted)) {
      const validation = await this.validateMessage(upserted, false);
      if (validation.restart) return validation;
      await this.specWorkflowService.onAssistantMessageCreated(this.context.session.sessionId, upserted);
      await this.context.recordMemory(upserted);
    }
    return { restart: false, events: [event] };
  }

  private async validateMessage(message: UnifiedMessage, includeMessage: boolean): Promise<ChatModeStreamDecision> {
    try {
      this.specWorkflowService.ensureTaskContractOrThrow(message);
      return { restart: false, events: [] };
    } catch (error) {
      if (!this.specWorkflowService.shouldAutoRegenerateForTaskValidationFailure(
        error,
        this.validationRegenerateAttempts,
      )) {
        throw error;
      }

      this.validationRegenerateAttempts += 1;
      const prompt = this.specWorkflowService.buildTaskRegeneratePromptFromValidation(
        error as ValidationError,
      );
      const persistedHistory = await this.context.listPersistedMessages();
      const history = includeMessage
        ? [...persistedHistory, message, createSpecPromptMessage(prompt, message.uuid)]
        : [...persistedHistory, createSpecPromptMessage(prompt, message.uuid)];
      this.documentBuffers.delete(message.uuid);
      return { restart: true, history, requestMessage: prompt };
    }
  }
}

function isStreamingMessage(message: UnifiedMessage): boolean {
  return message.metadata?.extensions?.streamState === 'streaming';
}

function isFinalAssistantMessage(message: UnifiedMessage): boolean {
  return message.role === 'assistant' && !isStreamingMessage(message);
}
