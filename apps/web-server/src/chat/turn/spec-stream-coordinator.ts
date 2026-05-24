import type { UnifiedMessage } from '@agent-flow/core/messages';
import type { ChatStreamEvent, SessionRecord } from '../../contracts/api.js';
import { ValidationError } from '../../lib/errors.js';
import type { SessionService } from '../../services/session-service.js';
import {
  createSpecPromptMessage,
  type SpecWorkflowService,
} from '../../services/spec-workflow-service.js';
import type { MemoryRecorder } from './memory-recorder.js';

export interface SpecStreamRestart {
  restart: true;
  history: UnifiedMessage[];
  requestMessage: string;
}

export interface SpecStreamContinue {
  restart: false;
  events: ChatStreamEvent[];
}

export type SpecStreamDecision = SpecStreamRestart | SpecStreamContinue;

export class SpecStreamCoordinator {
  private readonly specDocBuffers = new Map<string, string>();
  private attemptedTaskValidationRegenerate = 0;

  constructor(
    private readonly sessionService: SessionService,
    private readonly specWorkflowService: SpecWorkflowService,
    private readonly memoryRecorder: MemoryRecorder,
  ) {}

  handleDelta(session: SessionRecord, event: ChatStreamEvent): ChatStreamEvent | null {
    if (!isSpecDocumentDelta(session, event)) {
      return null;
    }

    const content = `${this.specDocBuffers.get(event.msg_id) ?? ''}${event.delta}`;
    this.specDocBuffers.set(event.msg_id, content);
    return {
      type: 'spec_doc_update',
      msg_id: event.msg_id,
      doc_type: session.specWorkflow?.phase ?? 'requirements',
      content,
      delta: event.delta,
      done: false,
    };
  }

  async handleMessage(session: SessionRecord, event: Extract<ChatStreamEvent, { type: 'msg' }>): Promise<SpecStreamDecision> {
    if (isFinalSpecAssistantMessage(session, event.msg)) {
      const validation = await this.validateFinalSpecAssistantMessage(session, event.msg);
      if (validation.restart) {
        return validation;
      }

      const captured = await this.specWorkflowService.captureAssistantDocument(session.sessionId, event.msg);
      if (captured) {
        const upsertedSummary = await this.sessionService.upsertMessage(session.sessionId, captured.summary);
        await this.memoryRecorder.record(session.sessionId, upsertedSummary);
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
            {
              type: 'msg',
              msg: upsertedSummary,
            },
          ],
        };
      }
    }

    const upserted = await this.sessionService.upsertMessage(session.sessionId, event.msg);
    if (!isStreamingMessage(upserted)) {
      const validation = await this.validatePersistedAssistantMessage(session, upserted);
      if (validation.restart) {
        return validation;
      }
      await this.specWorkflowService.onAssistantMessageCreated(session.sessionId, upserted);
      await this.memoryRecorder.record(session.sessionId, upserted);
    }

    return {
      restart: false,
      events: [event],
    };
  }

  private async validateFinalSpecAssistantMessage(
    session: SessionRecord,
    message: UnifiedMessage,
  ): Promise<SpecStreamDecision> {
    try {
      this.specWorkflowService.ensureTaskContractOrThrow(message);
      return { restart: false, events: [] };
    } catch (error) {
      const restart = await this.tryBuildRegenerateRestart(session, error, message.uuid, message);
      if (restart) {
        return restart;
      }
      throw error;
    }
  }

  private async validatePersistedAssistantMessage(
    session: SessionRecord,
    message: UnifiedMessage,
  ): Promise<SpecStreamDecision> {
    try {
      if (session.mode === 'spec') {
        this.specWorkflowService.ensureTaskContractOrThrow(message);
      }
      return { restart: false, events: [] };
    } catch (error) {
      const restart = await this.tryBuildRegenerateRestart(session, error, message.uuid);
      if (restart) {
        return restart;
      }
      throw error;
    }
  }

  private async tryBuildRegenerateRestart(
    session: SessionRecord,
    error: unknown,
    parentUuid: string,
    includeMessage?: UnifiedMessage,
  ): Promise<SpecStreamRestart | null> {
    if (
      session.mode !== 'spec' ||
      !this.specWorkflowService.shouldAutoRegenerateForTaskValidationFailure(
        error,
        this.attemptedTaskValidationRegenerate,
      )
    ) {
      return null;
    }

    this.attemptedTaskValidationRegenerate += 1;
    const regenPrompt = this.specWorkflowService.buildTaskRegeneratePromptFromValidation(
      error as ValidationError,
    );
    const persistedHistory = await this.sessionService.listMessages(session.sessionId);
    const history = includeMessage
      ? [...persistedHistory, includeMessage, createSpecPromptMessage(regenPrompt, parentUuid)]
      : [...persistedHistory, createSpecPromptMessage(regenPrompt, parentUuid)];
    this.specDocBuffers.delete(parentUuid);

    return {
      restart: true,
      history,
      requestMessage: regenPrompt,
    };
  }
}

export function isStreamingMessage(message: UnifiedMessage): boolean {
  return message.metadata?.extensions?.streamState === 'streaming';
}

function isSpecDocumentDelta(
  session: SessionRecord,
  event: ChatStreamEvent,
): event is Extract<ChatStreamEvent, { type: 'msg_delta' }> {
  return session.mode === 'spec' && event.type === 'msg_delta';
}

function isFinalSpecAssistantMessage(session: SessionRecord, message: UnifiedMessage): boolean {
  return session.mode === 'spec' && message.role === 'assistant' && !isStreamingMessage(message);
}
