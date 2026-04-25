import type { FilePart, UnifiedMessage } from '@agent-flow/core/messages';
import type { ReasoningEffort, RuntimeGateway, SessionRecord } from '../contracts/api.js';
import { createUnifiedMessage, createUserContent } from '../lib/messages.js';
import { ModelService } from './model-service.js';
import { SessionService } from './session-service.js';

export interface ChatTurnInput {
  sessionId?: string;
  message: string;
  modelId?: string;
  reasoningEffort?: ReasoningEffort;
  attachments?: FilePart[];
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
  ) {}

  async *streamTurn(input: ChatTurnInput): AsyncGenerator<UnifiedMessage, SessionRecord, undefined> {
    const prepared = this.prepareTurn(input);

    this.sessionService.appendMessage(prepared.session.sessionId, prepared.userMessage);
    yield prepared.userMessage;

    for await (const message of this.runtimeGateway.streamChat({
      session: prepared.session,
      history: [...prepared.history, prepared.userMessage],
      message: input.message,
      modelId: prepared.modelId,
      requestId: input.requestId,
      reasoningEffort: input.reasoningEffort,
      attachments: prepared.attachments,
    })) {
      this.sessionService.appendMessage(prepared.session.sessionId, message);
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
    const modelId = input.modelId ?? this.modelService.getCurrentModelId();
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
}
