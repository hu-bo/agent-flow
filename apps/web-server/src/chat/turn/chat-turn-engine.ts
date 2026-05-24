import type { UnifiedMessage } from '@agent-flow/core/messages';
import type { MemoryService } from '@agent-flow/memory';
import type { ChatStreamEvent, RuntimeGateway, SessionRecord } from '../../contracts/api.js';
import { createUnifiedMessage, createUserContent } from '../../lib/messages.js';
import type { ModelService } from '../../services/model-service.js';
import type { SessionService } from '../../services/session-service.js';
import type { SpecWorkflowService } from '../../services/spec-workflow-service.js';
import { MemoryRecorder } from './memory-recorder.js';
import { RetryPolicy } from './retry-policy.js';
import { SpecStreamCoordinator } from './spec-stream-coordinator.js';
import { TurnPreparer } from './turn-preparer.js';
import type {
  ChatTurnInput,
  ChatTurnResult,
  RetryChatMessageInput,
  SpecConfirmResult,
} from './types.js';

export class ChatTurnEngine {
  private readonly memoryRecorder: MemoryRecorder;
  private readonly retryPolicy = new RetryPolicy();
  private readonly turnPreparer: TurnPreparer;

  constructor(
    private readonly sessionService: SessionService,
    modelService: ModelService,
    private readonly runtimeGateway: RuntimeGateway,
    private readonly specWorkflowService: SpecWorkflowService,
    memoryService?: MemoryService,
  ) {
    this.memoryRecorder = new MemoryRecorder(memoryService);
    this.turnPreparer = new TurnPreparer(sessionService, modelService, specWorkflowService);
  }

  async *streamTurn(input: ChatTurnInput): AsyncGenerator<ChatStreamEvent, SessionRecord, undefined> {
    const prepared = await this.turnPreparer.prepare(input);
    const specCoordinator = new SpecStreamCoordinator(
      this.sessionService,
      this.specWorkflowService,
      this.memoryRecorder,
    );

    await this.sessionService.appendMessage(prepared.session.sessionId, prepared.userMessage);
    await this.memoryRecorder.record(prepared.session.sessionId, prepared.userMessage);
    yield {
      type: 'msg',
      msg: prepared.userMessage,
    };

    let history = [...prepared.history, prepared.userMessage];
    let requestMessage = input.message;

    while (true) {
      let shouldRestart = false;
      for await (const event of this.runtimeGateway.streamChat({
        session: prepared.session,
        history,
        userId: input.userId,
        message: requestMessage,
        modelId: prepared.modelId,
        model: prepared.model,
        requestId: input.requestId,
        reasoningEffort: input.reasoningEffort,
        attachments: prepared.attachments,
        preferredRunnerId: await this.sessionService.getBoundRunner(prepared.session.sessionId),
        approveRiskyOps: input.approveRiskyOps,
        approvalTicket: input.approvalTicket,
      })) {
        const specDeltaEvent = specCoordinator.handleDelta(prepared.session, event);
        if (specDeltaEvent) {
          yield specDeltaEvent;
          continue;
        }

        if (event.type === 'msg') {
          const decision = await specCoordinator.handleMessage(prepared.session, event);
          if (decision.restart) {
            history = decision.history;
            requestMessage = decision.requestMessage;
            shouldRestart = true;
            break;
          }

          for (const nextEvent of decision.events) {
            yield nextEvent;
          }
          continue;
        }

        yield event;
      }

      if (!shouldRestart) {
        break;
      }
    }

    return await this.sessionService.getSession(prepared.session.sessionId);
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
      if (step.value.type === 'msg') {
        messages.push(step.value.msg);
      }
    }

    return {
      session: session ?? (await this.sessionService.getLatestSession(input.userId))!,
      messages,
    };
  }

  async retryFromMessage(input: RetryChatMessageInput): Promise<ChatTurnResult> {
    const messages = await this.sessionService.listMessages(input.sessionId);
    const retry = this.retryPolicy.resolveRetryRequest(messages, input.messageId);
    await this.sessionService.truncateMessages(input.sessionId, retry.retryUserIndex);

    return this.runTurn({
      userId: input.userId,
      sessionId: input.sessionId,
      specAutoPrompt: true,
      message: retry.retryText,
      modelId: input.modelId ?? (await this.sessionService.getSession(input.sessionId, input.userId)).modelId,
      reasoningEffort: input.reasoningEffort,
      attachments: retry.retryAttachments,
      requestId: input.requestId,
    });
  }

  async confirmSpecPhase(input: {
    userId: string;
    sessionId: string;
    selectedArtifacts?: string[];
    actionAnswer?: string;
    requestId: string;
  }): Promise<SpecConfirmResult> {
    const phaseBeforeConfirm = (await this.specWorkflowService.ensureSpecState(input.sessionId)).workflow.phase;
    const confirm = await this.specWorkflowService.confirm(input.sessionId, {
      selectedArtifacts: input.selectedArtifacts,
    });
    const actionAnswerMessage = input.actionAnswer?.trim()
      ? createUnifiedMessage({
          role: 'user',
          content: createUserContent(input.actionAnswer.trim()),
          parentUuid: (await this.sessionService.listMessages(input.sessionId)).at(-1)?.uuid ?? null,
          metadata: {
            extensions: {
              specActionAnswer: true,
              specPhase: phaseBeforeConfirm,
              selectedArtifacts: input.selectedArtifacts ?? [],
            },
          },
        })
      : null;
    if (actionAnswerMessage) {
      await this.sessionService.appendMessage(input.sessionId, actionAnswerMessage);
      await this.memoryRecorder.record(input.sessionId, actionAnswerMessage);
    }

    if (!confirm.autoPrompt) {
      return {
        session: confirm.session,
        messages: actionAnswerMessage ? [actionAnswerMessage] : [],
        workflow: confirm.workflow,
        progressed: false,
      };
    }

    const result = await this.runTurn({
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
