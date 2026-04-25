import type { FastifyReply, FastifyRequest } from 'fastify';
import { createSseStream } from '../lib/sse.js';
import { parseWithSchema } from '../lib/validation.js';
import { createChatBodySchema } from '../schemas/chat.js';

export async function createChatHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = parseWithSchema(createChatBodySchema, request.body, 'body');

  if (body.backgroundTask) {
    const task = request.server.services.taskService.createTask({
      prompt: body.message,
      modelId: body.model,
      sessionId: body.sessionId,
      type: 'chat',
    });
    reply.status(202).send({
      taskId: task.taskId,
      status: task.status,
      task,
    });
    return;
  }

  if (body.stream) {
    const stream = createSseStream(reply);
    stream.comment(`request=${request.requestContext.requestId}`);

    try {
      const generator = request.server.services.chatService.streamTurn({
        sessionId: body.sessionId,
        message: body.message,
        modelId: body.model,
        reasoningEffort: body.reasoningEffort,
        attachments: body.attachments,
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
    sessionId: body.sessionId,
    message: body.message,
    modelId: body.model,
    reasoningEffort: body.reasoningEffort,
    attachments: body.attachments,
    requestId: request.requestContext.requestId,
  });

  reply.send(result);
}
