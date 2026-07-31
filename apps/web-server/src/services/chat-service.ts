import type { FilePart, UnifiedMessage } from '@agent-flow/core/messages';
import type { MemoryService } from '@agent-flow/memory';
import type { ChatStreamEvent, ReasoningEffort, RunnerPlatformProfile, SessionRecord } from '../contracts/api.js';
import { NotFoundError, ValidationError } from '../lib/errors.js';
import { createUserTextMessage, getMessageText } from '../lib/messages.js';
import type { RuntimeTurnEngine } from '../runtime/runtime-turn-engine.js';
import type { RunnerRegistryService } from './runner-registry-service.js';
import { createSpecPromptMessage, type SpecWorkflowService } from './spec-workflow-service.js';
import type { ModelService } from './model-service.js';
import type { SessionService } from './session-service.js';

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
  /** Set when the client closes the stream or explicitly stops generation. */
  signal?: AbortSignal;
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
  private readonly activeTurnControllers = new Map<string, AbortController>();

  constructor(
    private readonly sessionService: SessionService,
    private readonly modelService: ModelService,
    private readonly runtimeTurnEngine: RuntimeTurnEngine,
    private readonly specWorkflowService: SpecWorkflowService,
    private readonly runnerRegistryService: RunnerRegistryService,
    private readonly memoryService?: MemoryService,
  ) {}

  async *streamTurn(input: ChatTurnInput): AsyncGenerator<ChatStreamEvent, SessionRecord, undefined> {
    const prepared = await this.prepareTurn(input);
    const turnKey = this.getTurnKey(input.userId, prepared.session.sessionId);
    const activeController = this.activeTurnControllers.get(turnKey);
    if (activeController) {
      throw new ValidationError('A response is already streaming for this session.');
    }

    const controller = new AbortController();
    const abortFromRequest = () => controller.abort();
    input.signal?.addEventListener('abort', abortFromRequest, { once: true });
    if (input.signal?.aborted) {
      controller.abort();
    }
    this.activeTurnControllers.set(turnKey, controller);

    try {
    const specDocBuffers = new Map<string, string>();
    let attemptedTaskValidationRegenerate = 0;

    await this.sessionService.appendMessage(prepared.session.sessionId, prepared.userMessage);
    await this.recordMemory(prepared.session.sessionId, prepared.userMessage);
    yield {
      type: 'msg',
      msg: prepared.userMessage,
    };

    let history = [...prepared.history, prepared.userMessage];
    let requestMessage = input.message;

    const specDeltaStage = (event: ChatStreamEvent): ChatStreamEvent | null => {
      if (!isSpecDocumentDelta(prepared.session, event)) {
        return null;
      }

      const content = `${specDocBuffers.get(event.msg_id) ?? ''}${event.delta}`;
      specDocBuffers.set(event.msg_id, content);
      return {
        type: 'spec_doc_update',
        msg_id: event.msg_id,
        doc_type: prepared.session.specWorkflow?.phase ?? 'requirements',
        content,
        delta: event.delta,
        done: false,
      };
    };

    const tryBuildRegenerateRestart = async (
      error: unknown,
      parentUuid: string,
      includeMessage?: UnifiedMessage,
    ): Promise<SpecStreamRestart | null> => {
      if (
        prepared.session.mode !== 'spec' ||
        !this.specWorkflowService.shouldAutoRegenerateForTaskValidationFailure(
          error,
          attemptedTaskValidationRegenerate,
        )
      ) {
        return null;
      }

      attemptedTaskValidationRegenerate += 1;
      const regenPrompt = this.specWorkflowService.buildTaskRegeneratePromptFromValidation(
        error as ValidationError,
      );
      const persistedHistory = await this.sessionService.listMessages(prepared.session.sessionId);
      const nextHistory = includeMessage
        ? [...persistedHistory, includeMessage, createSpecPromptMessage(regenPrompt, parentUuid)]
        : [...persistedHistory, createSpecPromptMessage(regenPrompt, parentUuid)];
      specDocBuffers.delete(parentUuid);

      return {
        restart: true,
        history: nextHistory,
        requestMessage: regenPrompt,
      };
    };

    const validateFinalSpecAssistantMessage = async (message: UnifiedMessage): Promise<SpecStreamDecision> => {
      try {
        this.specWorkflowService.ensureTaskContractOrThrow(message);
        return { restart: false, events: [] };
      } catch (error) {
        const restart = await tryBuildRegenerateRestart(error, message.uuid, message);
        if (restart) {
          return restart;
        }
        throw error;
      }
    };

    const validatePersistedAssistantMessage = async (message: UnifiedMessage): Promise<SpecStreamDecision> => {
      try {
        if (prepared.session.mode === 'spec') {
          this.specWorkflowService.ensureTaskContractOrThrow(message);
        }
        return { restart: false, events: [] };
      } catch (error) {
        const restart = await tryBuildRegenerateRestart(error, message.uuid);
        if (restart) {
          return restart;
        }
        throw error;
      }
    };

    const specMessageStage = async (
      event: Extract<ChatStreamEvent, { type: 'msg' }>,
    ): Promise<SpecStreamDecision> => {
      if (isFinalSpecAssistantMessage(prepared.session, event.msg)) {
        const validation = await validateFinalSpecAssistantMessage(event.msg);
        if (validation.restart) {
          return validation;
        }

        const captured = await this.specWorkflowService.captureAssistantDocument(prepared.session.sessionId, event.msg);
        if (captured) {
          const upsertedSummary = await this.sessionService.upsertMessage(prepared.session.sessionId, captured.summary);
          await this.recordMemory(prepared.session.sessionId, upsertedSummary);
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

      const upserted = await this.sessionService.upsertMessage(prepared.session.sessionId, event.msg);
      if (!isStreamingMessage(upserted)) {
        const validation = await validatePersistedAssistantMessage(upserted);
        if (validation.restart) {
          return validation;
        }
        await this.specWorkflowService.onAssistantMessageCreated(prepared.session.sessionId, upserted);
        await this.recordMemory(prepared.session.sessionId, upserted);
      }

      return {
        restart: false,
        events: [event],
      };
    };

    while (true) {
      const preferredRunnerId = await this.sessionService.getBoundRunner(prepared.session.sessionId);
      const runnerPlatform = await this.resolveRunnerPlatform(input.userId, preferredRunnerId);
      let shouldRestart = false;
      for await (const event of this.runtimeTurnEngine.streamChat({
        session: prepared.session,
        history,
        userId: input.userId,
        message: requestMessage,
        modelId: prepared.modelId,
        model: prepared.model,
        requestId: input.requestId,
        reasoningEffort: input.reasoningEffort,
        attachments: prepared.attachments,
        preferredRunnerId,
        runnerPlatform,
        approveRiskyOps: input.approveRiskyOps,
        approvalTicket: input.approvalTicket,
        signal: controller.signal,
      })) {
        const specDeltaEvent = specDeltaStage(event);
        if (specDeltaEvent) {
          yield specDeltaEvent;
          continue;
        }

        if (event.type === 'msg') {
          const decision = await specMessageStage(event);
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

        if (event.type === 'thinking') {
          const upserted = await this.sessionService.upsertMessage(prepared.session.sessionId, event.msg);
          yield {
            type: 'thinking',
            msg: upserted,
          };
          continue;
        }

        yield event;
      }

      if (!shouldRestart) {
        break;
      }
    }

    return await this.sessionService.getSession(prepared.session.sessionId);
    } finally {
      input.signal?.removeEventListener('abort', abortFromRequest);
      if (this.activeTurnControllers.get(turnKey) === controller) {
        this.activeTurnControllers.delete(turnKey);
      }
    }
  }

  cancelTurn(userId: string, sessionId: string): boolean {
    const controller = this.activeTurnControllers.get(this.getTurnKey(userId, sessionId));
    if (!controller || controller.signal.aborted) {
      return false;
    }
    controller.abort();
    return true;
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
      if (step.value.type === 'msg' || step.value.type === 'thinking') {
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
    const retry = resolveRetryRequest(messages, input.messageId);
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
      ? createUserTextMessage(input.actionAnswer.trim(), [], {
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
    let session = input.sessionId
      ? await this.sessionService.updateSessionModel(input.sessionId, modelId, input.userId)
      : await this.sessionService.createSession({
          ownerUserId: input.userId,
          projectId: input.projectId,
          modelId,
          mode: input.mode ?? 'vibe',
          cwd: input.projectId ? undefined : process.cwd(),
        });
    if (session.projectId) {
      session = await this.sessionService.refreshProjectCwd(session.sessionId, input.userId);
    }

    const history = await this.sessionService.listMessages(session.sessionId);
    const baseUserMessage = createUserTextMessage(input.message, input.attachments ?? [], {
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
    const userMessage = await this.decorateSpecMessageIfNeeded(
      session,
      baseUserMessage,
      Boolean(input.specAutoPrompt),
    );

    return {
      session,
      history,
      userMessage,
      modelId,
      model: model.model,
      attachments: input.attachments ?? [],
    };
  }

  private getTurnKey(userId: string, sessionId: string): string {
    return `${userId}:${sessionId}`;
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
    const original = message.type === 'text' ? message.text.trim() : '';
    const wrapped = [phasePrompt, '', 'User input:', original || '(empty)'].join('\n');

    return {
      ...message,
      ...(message.type === 'text' ? { text: wrapped } : {}),
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

    const text = extractMemoryText(message);
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
      // Memory writes are best-effort; chat must continue if the backend is unavailable.
    }
  }

  private async resolveRunnerPlatform(
    ownerUserId: string,
    runnerId: string | undefined,
  ): Promise<RunnerPlatformProfile | undefined> {
    if (!runnerId) {
      return undefined;
    }
    try {
      const runner = await this.runnerRegistryService.getRunnerForUser(ownerUserId, runnerId);
      return {
        os: runner.os ?? undefined,
        arch: runner.arch ?? undefined,
        defaultShell: runner.defaultShell ?? undefined,
        pathSeparator: runner.pathSeparator ?? undefined,
        lineEnding: runner.lineEnding ?? undefined,
        workspaceRoots: runner.workspaceRoots ?? [],
        availableCommands: runner.availableCommands ?? [],
      };
    } catch {
      return undefined;
    }
  }
}

function extractMemoryText(message: UnifiedMessage): string {
  return getMessageText(message).trim();
}

interface RetryRequestParts {
  retryUserIndex: number;
  retryText: string;
  retryAttachments: FilePart[];
}

function resolveRetryRequest(messages: UnifiedMessage[], messageId: string): RetryRequestParts {
  const targetIndex = messages.findIndex((message) => message.uuid === messageId);
  if (targetIndex < 0) {
    throw new NotFoundError(`Message not found: ${messageId}`);
  }

  const retryUserIndex = resolveRetryUserIndex(messages, targetIndex);
  if (retryUserIndex < 0) {
    throw new ValidationError('Retry target does not have a corresponding user message');
  }

  const userMessage = messages[retryUserIndex];
  if (!userMessage) {
    throw new ValidationError('Retry target does not have a corresponding user message');
  }

  return {
    retryUserIndex,
    retryText: extractRetryText(userMessage),
    retryAttachments: userMessage.type === 'text' ? userMessage.attachments ?? [] : [],
  };
}

function resolveRetryUserIndex(messages: UnifiedMessage[], targetIndex: number): number {
  for (let index = targetIndex; index >= 0; index -= 1) {
    if (messages[index]?.role === 'user') {
      return index;
    }
  }
  return -1;
}

function extractRetryText(message: UnifiedMessage): string {
  const text = message.type === 'text' ? message.text.trim() : '';
  if (!text) {
    throw new ValidationError('The selected message does not contain retryable text');
  }
  return text;
}

interface SpecStreamRestart {
  restart: true;
  history: UnifiedMessage[];
  requestMessage: string;
}

interface SpecStreamContinue {
  restart: false;
  events: ChatStreamEvent[];
}

type SpecStreamDecision = SpecStreamRestart | SpecStreamContinue;

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
