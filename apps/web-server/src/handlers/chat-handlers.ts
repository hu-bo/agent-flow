import type { FastifyReply, FastifyRequest } from 'fastify';
import type { TokenUsage, UnifiedMessage } from '@agent-flow/core/messages';
import { sendSuccess } from '../lib/response.js';
import { createSseStream } from '../lib/sse.js';
import { parseWithSchema } from '../lib/validation.js';
import { AppError } from '../lib/errors.js';
import {
  createChatBodySchema,
  chatSessionParamsSchema,
  messageMutationParamsSchema,
  retryChatMessageBodySchema,
} from '../schemas/chat.js';

export async function createChatHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = parseWithSchema(createChatBodySchema, request.body, 'body');

  if (body.background_task) {
    const task = await request.server.services.taskService.createTask({
      ownerUserId: request.auth.userId,
      prompt: body.message,
      profileId: body.profile_id,
      modelId: body.model_id,
      sessionId: body.session_id,
      projectId: body.project_id,
      type: 'chat',
      config: {
        userId: request.auth.userId,
      },
    });
    return sendSuccess(reply, {
      taskId: task.taskId,
      status: task.status,
      task,
    }, { statusCode: 202, message: 'Accepted' });
  }

  if (body.stream) {
    const controller = new AbortController();
    const abortOnDisconnect = () => controller.abort();
    request.raw.once('close', abortOnDisconnect);
    const stream = createSseStream(reply);
    stream.comment(`request=${request.requestContext.requestId}`);
    stream.send('v1', 'delta_encoding');

    const usageByMsg: Record<string, TokenUsage> = {};
    const knownMessageIds = new Set<string>();
    const orderedMessageIds = new Set<string>();
    let lastAppendPointer: string | null = null;

    const sendDelta = (frame: DeltaFrame) => {
      stream.send(frame, 'delta');
      if (isFullDeltaFrame(frame) && frame.o === 'append') {
        lastAppendPointer = frame.p;
        return;
      }
      if (isDeltaShorthandFrame(frame)) {
        return;
      }
      lastAppendPointer = null;
    };

    const ensureOrderAppended = (msgId: string): FullDeltaFrame | null => {
      if (orderedMessageIds.has(msgId)) return null;
      orderedMessageIds.add(msgId);
      return { p: '/order', o: 'append', v: msgId };
    };

    const sendAppend = (pointer: string, chunk: string) => {
      if (lastAppendPointer === pointer) {
        sendDelta({ v: chunk });
        return;
      }
      sendDelta({ p: pointer, o: 'append', v: chunk });
    };

    try {
      const generator = request.server.services.chatService.streamTurn({
        userId: request.auth.userId,
        sessionId: body.session_id,
        projectId: body.project_id,
        mode: body.mode,
        message: body.message,
        profileId: body.profile_id,
        modelId: body.model_id,
        reasoningEffort: body.reasoning_effort,
        attachments: body.attachments,
        approveRiskyOps: body.approve_risky_ops,
        approvalTicket: body.approval_ticket,
        requestId: request.requestContext.requestId,
        signal: controller.signal,
      });

      while (true) {
        const step = await generator.next();
        if (step.done) break;

        const event = step.value;
        if (event.type === 'error') {
          stream.send(
            {
              code: event.err.code,
              message: event.err.msg,
              ...(event.err.details !== undefined ? { details: event.err.details } : {}),
            },
            'error',
          );
          stream.done();
          return;
        }

        if (event.type === 'approval_req') {
          sendDelta({ p: '/approval', o: 'replace', v: event.approval });
          continue;
        }

        if (event.type === 'runtime_event') {
          stream.send(event.event, event.event.type);
          if (event.event.type === 'approval_request') {
            sendDelta({
              p: '/approval',
              o: 'replace',
              v: {
                request_id: String(event.event.payload.requestId ?? event.event.id),
                session_id: String(event.event.payload.session_id ?? ''),
                runner_id: String(event.event.payload.runnerId ?? ''),
                scope_type: event.event.payload.scopeType === 'project' ? 'project' : 'chat',
                scope_id: String(event.event.payload.scopeId ?? ''),
                scope_label: typeof event.event.payload.scopeLabel === 'string' ? event.event.payload.scopeLabel : undefined,
                cmd: String(event.event.payload.cmd ?? ''),
                workdir: String(event.event.payload.workdir ?? ''),
                risk: event.event.payload.risk === 'low' || event.event.payload.risk === 'medium'
                  ? event.event.payload.risk
                  : 'high',
                reason: typeof event.event.payload.reason === 'string' ? event.event.payload.reason : undefined,
              },
            });
          }
          continue;
        }

        if (event.type === 'spec_doc_update') {
          const pointer = `/spec_docs/${escapeJsonPointerToken(event.doc_type)}`;

          if (typeof event.delta === 'string' && event.delta.length > 0) {
            sendAppend(pointer, event.delta);
          }

          if (event.done) {
            sendDelta({ p: pointer, o: 'replace', v: event.content });
          }
          continue;
        }

        if (event.type === 'msg_delta') {
          const msgId = event.msg_id;
          const escapedMsgId = escapeJsonPointerToken(msgId);

          if (!knownMessageIds.has(msgId)) {
            knownMessageIds.add(msgId);

            const patchOps: FullDeltaFrame[] = [
              {
                p: `/messages/${escapedMsgId}`,
                o: 'replace',
                v: createAssistantSkeletonMessage(msgId),
              },
            ];
            const orderOp = ensureOrderAppended(msgId);
            if (orderOp) patchOps.push(orderOp);
            sendDelta({ o: 'patch', v: patchOps });
          }

          const pointer = `/messages/${escapedMsgId}/content/0/text`;
          sendAppend(pointer, event.delta);
          continue;
        }

        if (event.type === 'thinking') {
          const msg = event.msg;
          knownMessageIds.add(msg.uuid);

          const patchOps: FullDeltaFrame[] = [
            {
              p: `/messages/${escapeJsonPointerToken(msg.uuid)}`,
              o: 'replace',
              v: toClientMessage(msg),
            },
          ];
          const orderOp = ensureOrderAppended(msg.uuid);
          if (orderOp) patchOps.push(orderOp);
          sendDelta({ o: 'patch', v: patchOps });
          continue;
        }

        if (event.type === 'msg') {
          const msg = event.msg;
          // Web-ui does optimistic user messages; don't stream them to avoid duplicates.
          if (msg.role === 'user') continue;

          const tokenUsage = msg.metadata?.tokenUsage;
          if (tokenUsage) {
            usageByMsg[msg.uuid] = tokenUsage;
          }

          knownMessageIds.add(msg.uuid);

          const patchOps: FullDeltaFrame[] = [
            {
              p: `/messages/${escapeJsonPointerToken(msg.uuid)}`,
              o: 'replace',
              v: toClientMessage(msg),
            },
          ];
          const orderOp = ensureOrderAppended(msg.uuid);
          if (orderOp) patchOps.push(orderOp);
          sendDelta({ o: 'patch', v: patchOps });
          continue;
        }
      }

      if (Object.keys(usageByMsg).length > 0) {
        stream.send({ usage_by_msg: usageByMsg }, 'usage');
      }
      stream.done();
    } catch (error) {
      if (!controller.signal.aborted) {
        stream.send(toStreamErrorPayload(error), 'error');
        stream.done();
      } else {
        stream.close();
      }
    } finally {
      request.raw.removeListener('close', abortOnDisconnect);
    }

    return;
  }

  const result = await request.server.services.chatService.runTurn({
    userId: request.auth.userId,
    sessionId: body.session_id,
    projectId: body.project_id,
    mode: body.mode,
    message: body.message,
    profileId: body.profile_id,
    modelId: body.model_id,
    reasoningEffort: body.reasoning_effort,
    attachments: body.attachments,
    approveRiskyOps: body.approve_risky_ops,
    approvalTicket: body.approval_ticket,
    requestId: request.requestContext.requestId,
  });

  return sendSuccess(reply, result);
}

export async function cancelChatHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(chatSessionParamsSchema, request.params, 'params');
  const cancelled = request.server.services.chatService.cancelTurn(request.auth.userId, params.session_id);
  return sendSuccess(reply, { cancelled });
}

export async function retryChatMessageHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(messageMutationParamsSchema, request.params, 'params');
  const body = parseWithSchema(retryChatMessageBodySchema, request.body ?? {}, 'body');

  await request.server.services.chatService.retryFromMessage({
    userId: request.auth.userId,
    sessionId: params.session_id,
    messageId: body.msg_id,
    modelId: body.model_id,
    reasoningEffort: body.reasoning_effort,
    requestId: request.requestContext.requestId,
  });

  const state = await request.server.services.sessionService.getSessionState(params.session_id, request.auth.userId);
  return sendSuccess(reply, {
    session: state.session,
    messages: state.messages,
  });
}

function toStreamErrorPayload(error: unknown): {
  code: string;
  message: string;
  details?: unknown;
} {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    };
  }

  if (error instanceof Error) {
    return {
      code: 'STREAM_FAILED',
      message: error.message || 'Streaming failed',
    };
  }

  return {
    code: 'STREAM_FAILED',
    message: 'Streaming failed',
  };
}

type FullDeltaFrame =
  | { p: string; o: 'add' | 'replace' | 'remove'; v?: unknown }
  | { p: string; o: 'append'; v: unknown };

type DeltaPatchFrame = { o: 'patch'; v: FullDeltaFrame[] };
type DeltaShorthandFrame = { v: string };

type DeltaFrame = FullDeltaFrame | DeltaPatchFrame | DeltaShorthandFrame;

function isFullDeltaFrame(frame: DeltaFrame): frame is FullDeltaFrame {
  return typeof (frame as FullDeltaFrame).p === 'string' && typeof (frame as FullDeltaFrame).o === 'string';
}

function isDeltaShorthandFrame(frame: DeltaFrame): frame is DeltaShorthandFrame {
  return !isFullDeltaFrame(frame) && (frame as DeltaShorthandFrame).v !== undefined && typeof (frame as DeltaShorthandFrame).v === 'string';
}

function escapeJsonPointerToken(token: string): string {
  return token.replace(/~/g, '~0').replace(/\//g, '~1');
}

function createAssistantSkeletonMessage(uuid: string): UnifiedMessage {
  return {
    uuid,
    parentUuid: null,
    role: 'assistant',
    content: [{ type: 'text', text: '' }],
    timestamp: new Date().toISOString(),
    metadata: {},
  };
}

function toClientMessage(message: UnifiedMessage): UnifiedMessage {
  const metadata = message.metadata ?? {};
  const nextMetadata: UnifiedMessage['metadata'] = {};

  if (metadata.modelId !== undefined) nextMetadata.modelId = metadata.modelId;
  if (metadata.model !== undefined) nextMetadata.model = metadata.model;
  if (metadata.provider !== undefined) nextMetadata.provider = metadata.provider;
  if (metadata.isMeta !== undefined) nextMetadata.isMeta = metadata.isMeta;
  if (metadata.toolDuration !== undefined) nextMetadata.toolDuration = metadata.toolDuration;
  if (metadata.compactBoundary !== undefined) nextMetadata.compactBoundary = metadata.compactBoundary;

  return {
    ...message,
    content: [...message.content],
    metadata: nextMetadata,
  };
}

export async function deleteChatMessageHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(messageMutationParamsSchema, request.params, 'params');
  await request.server.services.chatService.deleteMessage(params.session_id, params.msg_id);

  const state = await request.server.services.sessionService.getSessionState(params.session_id, request.auth.userId);
  return sendSuccess(reply, {
    session: state.session,
    messages: state.messages,
  });
}
