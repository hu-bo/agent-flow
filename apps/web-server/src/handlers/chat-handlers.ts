import type { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../lib/response.js';
import { createSseStream } from '../lib/sse.js';
import { parseWithSchema } from '../lib/validation.js';
import { createChatBodySchema } from '../schemas/chat.js';

export async function createChatHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = parseWithSchema(createChatBodySchema, request.body, 'body');

  if (body.backgroundTask) {
    const task = request.server.services.taskService.createTask({
      prompt: body.message,
      profileId: body.profileId,
      modelId: body.model,
      sessionId: body.sessionId,
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
        sessionId: body.sessionId,
        message: body.message,
        profileId: body.profileId,
        modelId: body.model,
        reasoningEffort: body.reasoningEffort,
        attachments: body.attachments,
        approveRiskyOps: body.approveRiskyOps,
        approvalTicket: body.approvalTicket,
        requestId: request.requestContext.requestId,
      });

      while (true) {
        const step = await generator.next();
        if (step.done) break;
        stream.send(step.value);
      }

      stream.done();
    } catch (error) {
      stream.send({
        error: error instanceof Error ? error.message : 'Streaming failed',
      });
      stream.done();
    }

    return;
  }

  const result = await request.server.services.chatService.runTurn({
    userId: request.auth.userId,
    sessionId: body.sessionId,
    message: body.message,
    profileId: body.profileId,
    modelId: body.model,
    reasoningEffort: body.reasoningEffort,
    attachments: body.attachments,
    approveRiskyOps: body.approveRiskyOps,
    approvalTicket: body.approvalTicket,
    requestId: request.requestContext.requestId,
  });

  return sendSuccess(reply, result);
}
