import type { FilePart, UnifiedMessage } from '@agent-flow/core/messages';
import type { MemoryService } from '@agent-flow/memory';
import type { ChatStreamEvent, ReasoningEffort, RunnerPlatformProfile, SessionRecord } from '../contracts/api.js';
import { NotFoundError, ValidationError } from '../lib/errors.js';
import { createUserTextMessage } from '../lib/messages.js';
import type { RuntimeTurnEngine } from '../runtime/runtime-turn-engine.js';
import type { RunnerRegistryService } from './runner-registry-service.js';
import type { ChatModeStrategyRegistry } from './chat-mode-strategy.js';
import type { ModelService } from './model-service.js';
import { recordSessionMessage } from './session-memory-recorder.js';
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
  requestId: string;
  turnId?: string;
  /** Set when the client closes the stream or explicitly stops generation. */
  signal?: AbortSignal;
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
  turnId: string;
}

export class ChatService {
  private readonly activeTurnControllers = new Map<string, AbortController>();

  constructor(
    private readonly sessionService: SessionService,
    private readonly modelService: ModelService,
    private readonly runtimeTurnEngine: RuntimeTurnEngine,
    private readonly modeStrategies: ChatModeStrategyRegistry,
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
    const eventProcessor = this.modeStrategies.forSession(prepared.session).createEventProcessor({
      session: prepared.session,
      persistMessage: (message) => this.sessionService.upsertMessage(prepared.session.sessionId, message),
      listPersistedMessages: () => this.sessionService.listMessages(prepared.session.sessionId),
      recordMemory: (message) => recordSessionMessage(
        this.memoryService,
        prepared.session.sessionId,
        message,
      ),
    });

    await this.sessionService.upsertMessage(prepared.session.sessionId, prepared.userMessage);
    await recordSessionMessage(this.memoryService, prepared.session.sessionId, prepared.userMessage);
    yield {
      type: 'msg',
      msg: prepared.userMessage,
    };

    let history = [...prepared.history, prepared.userMessage];
    let requestMessage = input.message;

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
        turnId: prepared.turnId,
        reasoningEffort: input.reasoningEffort,
        attachments: prepared.attachments,
        preferredRunnerId,
        runnerPlatform,
        signal: controller.signal,
      })) {
        const modeDeltaEvent = eventProcessor.mapDelta(event);
        if (modeDeltaEvent) {
          yield modeDeltaEvent;
          continue;
        }

        if (event.type === 'msg') {
          const decision = await eventProcessor.handleMessage(event);
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
      ...(input.turnId ? { uuid: input.turnId } : {}),
      parentUuid: history.at(-1)?.uuid ?? null,
      metadata: {
        ...(input.turnId ? { turnId: input.turnId } : {}),
        modelId: String(modelId),
        provider: model.provider,
        extensions: {
          modelId,
          model: model.model,
        },
      },
    });
    const turnId = input.turnId ?? baseUserMessage.uuid;
    const identifiedUserMessage: UnifiedMessage = {
      ...baseUserMessage,
      metadata: { ...baseUserMessage.metadata, turnId },
    };
    const userMessage = await this.modeStrategies.forSession(session).decorateUserMessage(
      session,
      identifiedUserMessage,
      { autoPrompt: Boolean(input.specAutoPrompt) },
    );

    return {
      session,
      history,
      userMessage,
      modelId,
      model: model.model,
      attachments: input.attachments ?? [],
      turnId,
    };
  }

  private getTurnKey(userId: string, sessionId: string): string {
    return `${userId}:${sessionId}`;
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
