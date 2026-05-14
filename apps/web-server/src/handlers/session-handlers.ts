import type { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../lib/response.js';
import { parseWithSchema } from '../lib/validation.js';
import { createSessionBodySchema, sessionParamsSchema } from '../schemas/session.js';

export async function listSessionsHandler(request: FastifyRequest, reply: FastifyReply) {
  return sendSuccess(reply, {
    sessions: await request.server.services.sessionService.listSessions(request.auth.userId),
  });
}

export async function getSessionHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(sessionParamsSchema, request.params, 'params');
  const state = await request.server.services.sessionService.getSessionState(params.sessionId, request.auth.userId);
  return sendSuccess(reply, {
    session: state.session,
    messages: state.messages,
  });
}

export async function createSessionHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = parseWithSchema(createSessionBodySchema, request.body ?? {}, 'body');
  const session = await request.server.services.sessionService.createSession({
    ownerUserId: request.auth.userId,
    modelId: body.modelId ?? request.server.services.modelService.getCurrentModelId(),
    mode: body.mode,
    cwd: body.cwd,
    projectId: body.projectId,
    title: body.title,
    systemPrompt: body.systemPrompt,
  });

  return sendSuccess(reply, {
    session,
  }, { statusCode: 201, message: 'Created' });
}

export async function deleteSessionHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(sessionParamsSchema, request.params, 'params');
  await request.server.services.sessionService.deleteSession(params.sessionId, request.auth.userId);
  reply.status(204).send();
}
