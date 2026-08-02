import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { TokenUsage, UnifiedMessage } from '@agent-flow/core/messages';
import {
  chatTurnBodySchema,
  chatTurnParamsSchema,
  messageMutationParamsSchema,
  retryMessageBodySchema,
  type ChatStreamEvent as BrowserChatStreamEvent,
} from '@agent-flow/web-contracts';
import type { ChatStreamEvent } from '../contracts/api.js';
import { AppError } from '../lib/errors.js';
import { sendSuccess } from '../lib/response.js';
import { createSseStream, type SseStream } from '../lib/sse.js';
import { parseWithSchema } from '../lib/validation.js';
import { requireJsonBody } from '../middlewares/require-json.js';

export async function registerChatRoutes(app: FastifyInstance) {
  app.post('/sessions/:sessionId/turns', { preHandler: requireJsonBody }, createChatTurnHandler);
  app.post('/sessions/:sessionId/turns/stream', { preHandler: requireJsonBody }, streamChatTurnHandler);
  app.post('/sessions/:sessionId/turns/cancel', cancelChatTurnHandler);
  app.post('/sessions/:sessionId/messages/:messageId/retry', { preHandler: requireJsonBody }, retryChatMessageHandler);
  app.delete('/sessions/:sessionId/messages/:messageId', deleteChatMessageHandler);
}

async function streamChatTurnHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(chatTurnParamsSchema, request.params, 'params');
  const body = parseWithSchema(chatTurnBodySchema, request.body, 'body');
  const controller = new AbortController();
  const abortOnDisconnect = () => controller.abort();
  request.raw.once('close', abortOnDisconnect);
  const stream = createSseStream(reply);
  stream.comment(`request=${request.requestContext.requestId}`);
  const usageByMessageId: Record<string, TokenUsage> = {};

  try {
    const generator = request.server.services.chatService.streamTurn({
      userId: request.auth.userId,
      sessionId: params.sessionId,
      message: body.message,
      profileId: body.profileId,
      modelId: body.modelId,
      reasoningEffort: body.reasoningEffort,
      attachments: body.attachments,
      requestId: request.requestContext.requestId,
      turnId: body.turnId,
      signal: controller.signal,
    });

    for await (const event of generator) {
      const browserEvent = toBrowserEvent(event);
      if (!browserEvent) continue;
      if (browserEvent.type === 'message.upsert') {
        const usage = browserEvent.message.metadata?.tokenUsage;
        if (usage) usageByMessageId[browserEvent.message.uuid] = usage;
      }
      sendEvent(stream, browserEvent);
      if (browserEvent.type === 'error') {
        sendEvent(stream, { type: 'done' });
        stream.close();
        return;
      }
    }

    if (Object.keys(usageByMessageId).length > 0) {
      sendEvent(stream, { type: 'usage', usageByMessageId });
    }
    sendEvent(stream, { type: 'done' });
    stream.close();
  } catch (error) {
    if (controller.signal.aborted) {
      stream.close();
    } else {
      sendEvent(stream, { type: 'error', error: toStreamErrorPayload(error) });
      sendEvent(stream, { type: 'done' });
      stream.close();
    }
  } finally {
    request.raw.removeListener('close', abortOnDisconnect);
  }
}

async function createChatTurnHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(chatTurnParamsSchema, request.params, 'params');
  const body = parseWithSchema(chatTurnBodySchema, request.body, 'body');
  const result = await request.server.services.chatService.runTurn({
    userId: request.auth.userId,
    sessionId: params.sessionId,
    message: body.message,
    profileId: body.profileId,
    modelId: body.modelId,
    reasoningEffort: body.reasoningEffort,
    attachments: body.attachments,
    requestId: request.requestContext.requestId,
    turnId: body.turnId,
  });
  return sendSuccess(reply, result, { statusCode: 201 });
}

async function cancelChatTurnHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(chatTurnParamsSchema, request.params, 'params');
  const cancelled = request.server.services.chatService.cancelTurn(request.auth.userId, params.sessionId);
  return sendSuccess(reply, { cancelled });
}

async function retryChatMessageHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(messageMutationParamsSchema, request.params, 'params');
  const body = parseWithSchema(retryMessageBodySchema, request.body ?? {}, 'body');
  await request.server.services.chatService.retryFromMessage({
    userId: request.auth.userId,
    sessionId: params.sessionId,
    messageId: params.messageId,
    modelId: body.modelId,
    reasoningEffort: body.reasoningEffort,
    requestId: request.requestContext.requestId,
  });
  return sendSuccess(
    reply,
    await request.server.services.sessionService.getSessionState(params.sessionId, request.auth.userId),
  );
}

async function deleteChatMessageHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(messageMutationParamsSchema, request.params, 'params');
  await request.server.services.chatService.deleteMessage(params.sessionId, params.messageId);
  return sendSuccess(
    reply,
    await request.server.services.sessionService.getSessionState(params.sessionId, request.auth.userId),
  );
}

function sendEvent(stream: SseStream, event: BrowserChatStreamEvent): void {
  stream.send(event, event.type);
}

function toBrowserEvent(event: ChatStreamEvent): BrowserChatStreamEvent | null {
  if (event.type === 'error') {
    return {
      type: 'error',
      error: {
        code: event.err.code,
        message: event.err.msg,
        ...(event.err.details !== undefined ? { details: event.err.details } : {}),
      },
    };
  }
  if (event.type === 'msg_delta') {
    return { type: 'message.delta', messageId: event.msg_id, delta: event.delta };
  }
  if (event.type === 'msg' || event.type === 'thinking') {
    return { type: 'message.upsert', message: toClientMessage(event.msg) };
  }
  if (event.type === 'spec_doc_update') {
    return {
      type: 'spec.document',
      messageId: event.msg_id,
      docType: event.doc_type,
      content: event.content,
      ...(event.delta !== undefined ? { delta: event.delta } : {}),
      done: event.done,
    };
  }
  if (event.type !== 'runtime_event') return null;
  const payload = event.event.payload;
  if (event.event.type === 'approval_request') {
    return {
      type: 'approval.requested',
      approval: {
        requestId: stringValue(payload.requestId) ?? event.event.id,
        sessionId: stringValue(payload.sessionId) ?? '',
        runnerId: stringValue(payload.runnerId) ?? '',
        scopeType: payload.scopeType === 'project' ? 'project' : 'chat',
        scopeId: stringValue(payload.scopeId) ?? stringValue(payload.sessionId) ?? '',
        scopeLabel: stringValue(payload.scopeLabel),
        command: stringValue(payload.command) ?? '',
        workingDir: stringValue(payload.workingDir) ?? '',
        risk: payload.risk === 'low' || payload.risk === 'medium' ? payload.risk : 'high',
        reason: stringValue(payload.reason),
      },
    };
  }
  if (event.event.type === 'approval_response') {
    const approved = payload.approved === true;
    return {
      type: 'approval.resolved',
      requestId: stringValue(payload.requestId) ?? event.event.id,
      decision:
        approved && (payload.decision === 'once' || payload.decision === 'always')
          ? payload.decision
          : 'deny',
      approved,
      reason: stringValue(payload.reason),
    };
  }
  return null;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function toClientMessage(message: UnifiedMessage): UnifiedMessage {
  const metadata = message.metadata ?? {};
  const nextMetadata: UnifiedMessage['metadata'] = {};
  if (metadata.modelId !== undefined) nextMetadata.modelId = metadata.modelId;
  if (metadata.turnId !== undefined) nextMetadata.turnId = metadata.turnId;
  if (metadata.model !== undefined) nextMetadata.model = metadata.model;
  if (metadata.provider !== undefined) nextMetadata.provider = metadata.provider;
  if (metadata.isMeta !== undefined) nextMetadata.isMeta = metadata.isMeta;
  if (metadata.toolDuration !== undefined) nextMetadata.toolDuration = metadata.toolDuration;
  if (metadata.compactBoundary !== undefined) nextMetadata.compactBoundary = metadata.compactBoundary;
  return { ...message, metadata: nextMetadata };
}

function toStreamErrorPayload(error: unknown): { code: string; message: string; details?: unknown } {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    };
  }
  if (error instanceof Error) {
    return { code: 'STREAM_FAILED', message: error.message || 'Streaming failed' };
  }
  return { code: 'STREAM_FAILED', message: 'Streaming failed' };
}
