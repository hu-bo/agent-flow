import type { FilePart, UnifiedMessage } from '@agent-flow/core/messages';
import type { MemoryService } from '@agent-flow/memory';
import type { ReasoningEffort, RuntimeGateway, SessionRecord } from '../contracts/api.js';
import { NotFoundError, ValidationError } from '../lib/errors.js';
import { createUnifiedMessage, createUserContent } from '../lib/messages.js';
import { ModelService } from './model-service.js';
import { SessionService } from './session-service.js';

export interface ChatTurnInput {
  userId: string;
  sessionId?: string;
  message: string;
  profileId?: string;
  modelId?: number;
  reasoningEffort?: ReasoningEffort;
  attachments?: FilePart[];
  approveRiskyOps?: boolean;
  approvalTicket?: string;
  requestId: string;
}

export interface ChatTurnResult {
  session: SessionRecord;
  messages: UnifiedMessage[];
}

export interface RetryChatMessageInput {
  userId: string;
  sessionId: string;
  messageId: string;
  modelId?: number;
  reasoningEffort?: ReasoningEffort;
  requestId: string;
}

interface PreparedTurn {
  session: SessionRecord;
  history: UnifiedMessage[];
  userMessage: UnifiedMessage;
  modelId: number;
  model: string;
  attachments: FilePart[];
}

export class ChatService {
  constructor(
    private readonly sessionService: SessionService,
    private readonly modelService: ModelService,
    private readonly runtimeGateway: RuntimeGateway,
    private readonly memoryService?: MemoryService,
  ) {}

  async *streamTurn(input: ChatTurnInput): AsyncGenerator<UnifiedMessage, SessionRecord, undefined> {
    const prepared = this.prepareTurn(input);

    this.sessionService.appendMessage(prepared.session.sessionId, prepared.userMessage);
    await this.recordMemory(prepared.session.sessionId, prepared.userMessage);
    yield prepared.userMessage;

    for await (const message of this.runtimeGateway.streamChat({
      session: prepared.session,
      history: [...prepared.history, prepared.userMessage],
      userId: input.userId,
      message: input.message,
      modelId: prepared.modelId,
      model: prepared.model,
      requestId: input.requestId,
      reasoningEffort: input.reasoningEffort,
      attachments: prepared.attachments,
      preferredRunnerId: this.sessionService.getBoundRunner(prepared.session.sessionId),
      approveRiskyOps: input.approveRiskyOps,
      approvalTicket: input.approvalTicket,
    })) {
      this.sessionService.appendMessage(prepared.session.sessionId, message);
      await this.recordMemory(prepared.session.sessionId, message);
      yield message;
    }

    return this.sessionService.getSession(prepared.session.sessionId);
  }

  async runTurn(input: ChatTurnInput): Promise<ChatTurnResult> {
    const messages: UnifiedMessage[] = [];
    let session: SessionRecord | undefined;

    const stream = this.streamTurn(input);
    while (true) {
      const step = await stream.next();
      if (step.done) {
        session = step.value;
        break;
      }
      messages.push(step.value);
    }

    return {
      session: session ?? this.sessionService.getLatestSession()!,
      messages,
    };
  }

  async retryFromMessage(input: RetryChatMessageInput): Promise<ChatTurnResult> {
    const messages = this.sessionService.listMessages(input.sessionId);
    const targetIndex = messages.findIndex((message) => message.uuid === input.messageId);
    if (targetIndex < 0) {
      throw new NotFoundError(`Message not found: ${input.messageId}`);
    }

    const retryUserIndex = this.resolveRetryUserIndex(messages, targetIndex);
    if (retryUserIndex < 0) {
      throw new ValidationError('Retry target does not have a corresponding user message');
    }

    const userMessage = messages[retryUserIndex];
    const retryText = this.extractRetryText(userMessage);
    const retryAttachments = userMessage.content.filter((part): part is FilePart => part.type === 'file');
    this.sessionService.truncateMessages(input.sessionId, retryUserIndex);

    return this.runTurn({
      userId: input.userId,
      sessionId: input.sessionId,
      message: retryText,
      modelId: input.modelId ?? this.sessionService.getSession(input.sessionId).modelId,
      reasoningEffort: input.reasoningEffort,
      attachments: retryAttachments,
      requestId: input.requestId,
    });
  }

  deleteMessage(sessionId: string, messageId: string): SessionRecord {
    const targetIndex = this.sessionService.findMessageIndex(sessionId, messageId);
    if (targetIndex < 0) {
      throw new NotFoundError(`Message not found: ${messageId}`);
    }
    return this.sessionService.truncateMessages(sessionId, targetIndex);
  }

  private prepareTurn(input: ChatTurnInput): PreparedTurn {
    const modelId = input.modelId ?? this.modelService.resolveModelIdForProfile(input.profileId);
    const model = this.modelService.getModel(modelId);
    const session = input.sessionId
      ? this.sessionService.updateSessionModel(input.sessionId, modelId)
      : this.sessionService.createSession({
          modelId,
          cwd: process.cwd(),
        });

    const history = this.sessionService.listMessages(session.sessionId);
    const userMessage = createUnifiedMessage({
      role: 'user',
      content: createUserContent(input.message, input.attachments ?? []),
      parentUuid: history.at(-1)?.uuid ?? null,
      metadata: {
        modelId: String(modelId),
        provider: model.provider,
        extensions: {
          modelId,
          model: model.model,
        },
      },
    });

    return {
      session,
      history,
      userMessage,
      modelId,
      model: model.model,
      attachments: input.attachments ?? [],
    };
  }

  private async recordMemory(sessionId: string, message: UnifiedMessage): Promise<void> {
    if (!this.memoryService) {
      return;
    }
    if (message.metadata?.isMeta) {
      return;
    }

    const text = message.content
      .map((part) => {
        if (part.type === 'text') return part.text;
        if (part.type === 'file') return `[file:${part.mimeType}]`;
        if (part.type === 'tool-call') return `[tool-call:${part.toolName}]`;
        if (part.type === 'tool-result') return `[tool-result:${part.toolName}]`;
        if (part.type === 'image') return '[image]';
        return '';
      })
      .filter(Boolean)
      .join(' ')
      .trim();

    if (!text) {
      return;
    }

    try {
      await this.memoryService.rememberSession(sessionId, text, {
        role: message.role,
        messageId: message.uuid,
        timestamp: message.timestamp,
      });
    } catch {
      // Memory write is best-effort. Chat flow should continue even if memory backend fails.
    }
  }

  private resolveRetryUserIndex(messages: UnifiedMessage[], targetIndex: number): number {
    for (let index = targetIndex; index >= 0; index -= 1) {
      if (messages[index]?.role === 'user') {
        return index;
      }
    }
    return -1;
  }

  private extractRetryText(message: UnifiedMessage): string {
    const textPart = message.content.find(
      (part): part is { type: 'text'; text: string } => part.type === 'text',
    );
    const text = textPart?.text?.trim();
    if (!text) {
      throw new ValidationError('The selected message does not contain retryable text');
    }
    return text;
  }
}
