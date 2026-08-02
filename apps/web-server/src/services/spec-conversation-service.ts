import type { UnifiedMessage } from '@agent-flow/core/messages';
import type { MemoryService } from '@agent-flow/memory';
import type { SessionRecord } from '../contracts/api.js';
import { createUserTextMessage } from '../lib/messages.js';
import type { ChatService } from './chat-service.js';
import { recordSessionMessage } from './session-memory-recorder.js';
import type { SessionService } from './session-service.js';
import type { SpecWorkflowService } from './spec-workflow-service.js';

export interface SpecConfirmResult {
  session: SessionRecord;
  messages: UnifiedMessage[];
  workflow: SessionRecord['specWorkflow'];
  progressed: boolean;
}

export class SpecConversationService {
  constructor(
    private readonly chatService: ChatService,
    private readonly sessionService: SessionService,
    private readonly specWorkflowService: SpecWorkflowService,
    private readonly memoryService?: MemoryService,
  ) {}

  async confirmPhase(input: {
    userId: string;
    sessionId: string;
    selectedArtifacts?: string[];
    actionAnswer?: string;
    requestId: string;
  }): Promise<SpecConfirmResult> {
    const phase = (await this.specWorkflowService.ensureSpecState(input.sessionId)).workflow.phase;
    const confirm = await this.specWorkflowService.confirm(input.sessionId, {
      selectedArtifacts: input.selectedArtifacts,
    });
    const actionAnswerMessage = input.actionAnswer?.trim()
      ? createUserTextMessage(input.actionAnswer.trim(), [], {
          parentUuid: (await this.sessionService.listMessages(input.sessionId)).at(-1)?.uuid ?? null,
          metadata: {
            extensions: {
              specActionAnswer: true,
              specPhase: phase,
              selectedArtifacts: input.selectedArtifacts ?? [],
            },
          },
        })
      : null;

    if (actionAnswerMessage) {
      await this.sessionService.appendMessage(input.sessionId, actionAnswerMessage);
      await recordSessionMessage(this.memoryService, input.sessionId, actionAnswerMessage);
    }

    if (!confirm.autoPrompt) {
      return {
        session: confirm.session,
        messages: actionAnswerMessage ? [actionAnswerMessage] : [],
        workflow: confirm.workflow,
        progressed: false,
      };
    }

    const result = await this.chatService.runTurn({
      userId: input.userId,
      sessionId: input.sessionId,
      mode: 'spec',
      specAutoPrompt: true,
      message: confirm.autoPrompt,
      modelId: confirm.session.modelId,
      requestId: input.requestId,
    });
    return {
      session: result.session,
      messages: actionAnswerMessage ? [actionAnswerMessage, ...result.messages] : result.messages,
      workflow: confirm.workflow,
      progressed: true,
    };
  }
}
