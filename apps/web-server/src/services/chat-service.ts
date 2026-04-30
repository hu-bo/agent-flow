import type { FilePart, UnifiedMessage } from '@agent-flow/core/messages';
import type { MemoryService } from '@agent-flow/memory';
import type { ReasoningEffort, RuntimeGateway, SessionRecord } from '../contracts/api.js';
import { createUnifiedMessage, createUserContent } from '../lib/messages.js';
import { ModelService } from './model-service.js';
import { SessionService } from './session-service.js';

export interface ChatTurnInput {
  userId: string;
  sessionId?: string;
  message: string;
  profileId?: string;
  modelId?: string;
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

interface PreparedTurn {
  session: SessionRecord;
  history: UnifiedMessage[];
  userMessage: UnifiedMessage;
  modelId: string;
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

  private prepareTurn(input: ChatTurnInput): PreparedTurn {
    const modelId = input.modelId ?? this.modelService.resolveModelIdForProfile(input.profileId);
    this.modelService.getModel(modelId);

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
        modelId,
      },
    });

    return {
      session,
      history,
      userMessage,
      modelId,
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
}
