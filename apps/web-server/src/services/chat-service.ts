import type { MemoryService } from '@agent-flow/memory';
import type { ChatStreamEvent, RuntimeGateway, SessionRecord } from '../contracts/api.js';
import { NotFoundError } from '../lib/errors.js';
import { ChatTurnEngine } from '../chat/turn/chat-turn-engine.js';
import type {
  ChatTurnInput,
  ChatTurnResult,
  RetryChatMessageInput,
  SpecConfirmResult,
} from '../chat/turn/types.js';
import { ModelService } from './model-service.js';
import { SessionService } from './session-service.js';
import { SpecWorkflowService } from './spec-workflow-service.js';

export type {
  ChatTurnInput,
  ChatTurnResult,
  RetryChatMessageInput,
  SpecConfirmResult,
} from '../chat/turn/types.js';

export class ChatService {
  private readonly engine: ChatTurnEngine;

  constructor(
    private readonly sessionService: SessionService,
    modelService: ModelService,
    runtimeGateway: RuntimeGateway,
    specWorkflowService: SpecWorkflowService,
    memoryService?: MemoryService,
  ) {
    this.engine = new ChatTurnEngine(
      sessionService,
      modelService,
      runtimeGateway,
      specWorkflowService,
      memoryService,
    );
  }

  async *streamTurn(input: ChatTurnInput): AsyncGenerator<ChatStreamEvent, SessionRecord, undefined> {
    return yield* this.engine.streamTurn(input);
  }

  runTurn(input: ChatTurnInput): Promise<ChatTurnResult> {
    return this.engine.runTurn(input);
  }

  retryFromMessage(input: RetryChatMessageInput): Promise<ChatTurnResult> {
    return this.engine.retryFromMessage(input);
  }

  async deleteMessage(sessionId: string, messageId: string): Promise<SessionRecord> {
    const targetIndex = await this.sessionService.findMessageIndex(sessionId, messageId);
    if (targetIndex < 0) {
      throw new NotFoundError(`Message not found: ${messageId}`);
    }
    return this.sessionService.truncateMessages(sessionId, targetIndex);
  }

  confirmSpecPhase(input: {
    userId: string;
    sessionId: string;
    selectedArtifacts?: string[];
    actionAnswer?: string;
    requestId: string;
  }): Promise<SpecConfirmResult> {
    return this.engine.confirmSpecPhase(input);
  }
}
