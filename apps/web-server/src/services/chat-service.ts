import type { FilePart, UnifiedMessage } from '@agent-flow/core/messages';
import type { MemoryService } from '@agent-flow/memory';
import type { ChatStreamEvent, ReasoningEffort, RuntimeGateway, SessionRecord } from '../contracts/api.js';
import { NotFoundError, ValidationError } from '../lib/errors.js';
import { createUnifiedMessage, createUserContent } from '../lib/messages.js';
import { ModelService } from './model-service.js';
import { SessionService } from './session-service.js';
import {
  createSpecPromptMessage,
  SpecWorkflowService,
} from './spec-workflow-service.js';

export interface ChatTurnInput {
  userId: string;
  sessionId?: string;
  projectId?: string;
  mode?: 'vibe' | 'spec';
  specAutoPrompt?: boolean;
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

export interface SpecConfirmResult {
  session: SessionRecord;
  messages: UnifiedMessage[];
  workflow: SessionRecord['specWorkflow'];
  progressed: boolean;
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
    private readonly specWorkflowService: SpecWorkflowService,
    private readonly memoryService?: MemoryService,
  ) {}

  async *streamTurn(input: ChatTurnInput): AsyncGenerator<ChatStreamEvent, SessionRecord, undefined> {
    const prepared = await this.prepareTurn(input);
    const specDocBuffers = new Map<string, string>();

    await this.sessionService.appendMessage(prepared.session.sessionId, prepared.userMessage);
    await this.recordMemory(prepared.session.sessionId, prepared.userMessage);
    yield {
      type: 'msg',
      msg: prepared.userMessage,
    };

    let attemptedTaskValidationRegenerate = 0;
    let history = [...prepared.history, prepared.userMessage];
    let requestMessage = input.message;

    while (true) {
      let shouldRestart = false;
      for await (const message of this.runtimeGateway.streamChat({
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
        if (isSpecDocumentDelta(prepared.session, message)) {
          const content = `${specDocBuffers.get(message.msg_id) ?? ''}${message.delta}`;
          specDocBuffers.set(message.msg_id, content);
          yield {
            type: 'spec_doc_update',
            msg_id: message.msg_id,
            doc_type: prepared.session.specWorkflow?.phase ?? 'requirements',
            content,
            delta: message.delta,
            done: false,
          };
          continue;
        }

        if (message.type === 'msg') {
          if (isFinalSpecAssistantMessage(prepared.session, message.msg)) {
            try {
              this.specWorkflowService.ensureTaskContractOrThrow(message.msg);
            } catch (error) {
              if (
                prepared.session.mode === 'spec' &&
                this.specWorkflowService.shouldAutoRegenerateForTaskValidationFailure(
                  error,
                  attemptedTaskValidationRegenerate,
                )
              ) {
                attemptedTaskValidationRegenerate += 1;
                const regenPrompt = this.specWorkflowService.buildTaskRegeneratePromptFromValidation(
                  error as ValidationError,
                );
                history = [
                  ...(await this.sessionService.listMessages(prepared.session.sessionId)),
                  message.msg,
                  createSpecPromptMessage(regenPrompt, message.msg.uuid),
                ];
                requestMessage = regenPrompt;
                specDocBuffers.delete(message.msg.uuid);
                shouldRestart = true;
                break;
              }
              throw error;
            }

            const captured = await this.specWorkflowService.captureAssistantDocument(
              prepared.session.sessionId,
              message.msg,
            );
            if (captured) {
              const upsertedSummary = await this.sessionService.upsertMessage(prepared.session.sessionId, captured.summary);
              await this.recordMemory(prepared.session.sessionId, upsertedSummary);
              yield {
                type: 'spec_doc_update',
                msg_id: message.msg.uuid,
                doc_type: captured.docType,
                content: captured.content,
                done: true,
              };
              yield {
                type: 'msg',
                msg: upsertedSummary,
              };
              continue;
            }
          }

          const upserted = await this.sessionService.upsertMessage(prepared.session.sessionId, message.msg);
          if (!isStreamingMessage(upserted)) {
            try {
              if (prepared.session.mode === 'spec') {
                this.specWorkflowService.ensureTaskContractOrThrow(upserted);
              }
            } catch (error) {
              if (
                prepared.session.mode === 'spec' &&
                this.specWorkflowService.shouldAutoRegenerateForTaskValidationFailure(
                  error,
                  attemptedTaskValidationRegenerate,
                )
              ) {
                attemptedTaskValidationRegenerate += 1;
                const regenPrompt = this.specWorkflowService.buildTaskRegeneratePromptFromValidation(
                  error as ValidationError,
                );
                history = [
                  ...(await this.sessionService.listMessages(prepared.session.sessionId)),
                  createSpecPromptMessage(regenPrompt, upserted.uuid),
                ];
                requestMessage = regenPrompt;
                shouldRestart = true;
                break;
              }
              throw error;
            }
            await this.specWorkflowService.onAssistantMessageCreated(prepared.session.sessionId, upserted);
            await this.recordMemory(prepared.session.sessionId, upserted);
          }
        }
        yield message;
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
    await this.sessionService.truncateMessages(input.sessionId, retryUserIndex);

    return this.runTurn({
      userId: input.userId,
      sessionId: input.sessionId,
      specAutoPrompt: true,
      message: retryText,
      modelId: input.modelId ?? (await this.sessionService.getSession(input.sessionId, input.userId)).modelId,
      reasoningEffort: input.reasoningEffort,
      attachments: retryAttachments,
      requestId: input.requestId,
    });
  }

  async deleteMessage(sessionId: string, messageId: string): Promise<SessionRecord> {
    const targetIndex = await this.sessionService.findMessageIndex(sessionId, messageId);
    if (targetIndex < 0) {
      throw new NotFoundError(`Message not found: ${messageId}`);
    }
    return this.sessionService.truncateMessages(sessionId, targetIndex);
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
      await this.recordMemory(input.sessionId, actionAnswerMessage);
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

  private async prepareTurn(input: ChatTurnInput): Promise<PreparedTurn> {
    const modelId = input.modelId ?? this.modelService.resolveModelIdForProfile(input.profileId);
    const model = this.modelService.getModel(modelId);
    const session = input.sessionId
      ? await this.sessionService.updateSessionModel(input.sessionId, modelId, input.userId)
      : await this.sessionService.createSession({
          ownerUserId: input.userId,
          projectId: input.projectId,
          modelId,
          mode: input.mode ?? 'vibe',
          cwd: input.projectId ? undefined : process.cwd(),
        });

    const history = await this.sessionService.listMessages(session.sessionId);
    const baseUserMessage = createUnifiedMessage({
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
    const userMessage = await this.decorateSpecMessageIfNeeded(session, baseUserMessage, Boolean(input.specAutoPrompt));

    return {
      session,
      history,
      userMessage,
      modelId,
      model: model.model,
      attachments: input.attachments ?? [],
    };
  }

  private async decorateSpecMessageIfNeeded(
    session: SessionRecord,
    message: UnifiedMessage,
    specAutoPrompt: boolean,
  ): Promise<UnifiedMessage> {
    if (session.mode !== 'spec') {
      return message;
    }
    const workflow = (await this.specWorkflowService.ensureSpecState(session.sessionId)).workflow;
    if (specAutoPrompt) {
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
    const phasePrompt = this.specWorkflowService.buildSpecPrompt({
      session,
      phase: workflow.phase,
    });
    const textParts = message.content
      .filter((part): part is Extract<UnifiedMessage['content'][number], { type: 'text' }> => part.type === 'text');
    const original = textParts.map((part) => part.text).join('\n').trim();
    const wrapped = [phasePrompt, '', 'User input:', original || '(empty)'].join('\n');
    return {
      ...message,
      content: message.content.map((part) => (part.type === 'text' ? { ...part, text: wrapped } : part)),
      metadata: {
        ...message.metadata,
        extensions: {
          ...(message.metadata.extensions ?? {}),
          specPhase: workflow.phase,
        },
      },
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

function isStreamingMessage(message: UnifiedMessage): boolean {
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
