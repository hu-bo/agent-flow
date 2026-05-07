import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ChatStreamEvent } from '../contracts/api.js';
import { sendSuccess } from '../lib/response.js';
import { createSseStream } from '../lib/sse.js';
import { parseWithSchema } from '../lib/validation.js';
import { AppError } from '../lib/errors.js';
import {
  createChatBodySchema,
  messageMutationParamsSchema,
  retryChatMessageBodySchema,
} from '../schemas/chat.js';

export async function createChatHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = parseWithSchema(createChatBodySchema, request.body, 'body');

  if (body.background_task) {
    const task = request.server.services.taskService.createTask({
      prompt: body.message,
      profileId: body.profile_id,
      modelId: body.model_id,
      sessionId: body.session_id,
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
    const stream = createSseStream(reply);
    stream.comment(`request=${request.requestContext.requestId}`);

    try {
      const generator = request.server.services.chatService.streamTurn({
        userId: request.auth.userId,
        sessionId: body.session_id,
        message: body.message,
        profileId: body.profile_id,
        modelId: body.model_id,
        reasoningEffort: body.reasoning_effort,
        attachments: body.attachments,
        approveRiskyOps: body.approve_risky_ops,
        approvalTicket: body.approval_ticket,
        requestId: request.requestContext.requestId,
      });

      while (true) {
        const step = await generator.next();
        if (step.done) break;
        stream.send(step.value);
      }

      stream.done();
    } catch (error) {
      stream.send(toStreamErrorEvent(error));
      stream.done();
    }

    return;
  }

  const result = await request.server.services.chatService.runTurn({
    userId: request.auth.userId,
    sessionId: body.session_id,
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

  const state = request.server.services.sessionService.getSessionState(params.session_id);
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

function toStreamErrorEvent(error: unknown): ChatStreamEvent {
  const payload = toStreamErrorPayload(error);
  return {
    type: 'error',
    err: {
      code: payload.code,
      msg: payload.message,
      ...(payload.details !== undefined ? { details: payload.details } : {}),
    },
  };
}

export async function deleteChatMessageHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(messageMutationParamsSchema, request.params, 'params');
  request.server.services.chatService.deleteMessage(params.session_id, params.msg_id);

  const state = request.server.services.sessionService.getSessionState(params.session_id);
  return sendSuccess(reply, {
    session: state.session,
    messages: state.messages,
  });
}
