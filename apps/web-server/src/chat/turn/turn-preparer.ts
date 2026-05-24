import type { UnifiedMessage } from '@agent-flow/core/messages';
import type { SessionRecord } from '../../contracts/api.js';
import { createUnifiedMessage, createUserContent } from '../../lib/messages.js';
import type { ModelService } from '../../services/model-service.js';
import type { SessionService } from '../../services/session-service.js';
import type { SpecWorkflowService } from '../../services/spec-workflow-service.js';
import type { ChatTurnInput, PreparedTurn } from './types.js';

export class TurnPreparer {
  constructor(
    private readonly sessionService: SessionService,
    private readonly modelService: ModelService,
    private readonly specWorkflowService: SpecWorkflowService,
  ) {}

  async prepare(input: ChatTurnInput): Promise<PreparedTurn> {
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
}
