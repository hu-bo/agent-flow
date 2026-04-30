import type { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../lib/response.js';
import { parseWithSchema } from '../lib/validation.js';
import { createSessionBodySchema, sessionParamsSchema } from '../schemas/session.js';

export async function listSessionsHandler(request: FastifyRequest, reply: FastifyReply) {
  return sendSuccess(reply, {
    sessions: request.server.services.sessionService.listSessions(),
  });
}

export async function getSessionHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(sessionParamsSchema, request.params, 'params');
  const state = request.server.services.sessionService.getSessionState(params.sessionId);
  return sendSuccess(reply, {
    session: state.session,
    messages: state.messages,
  });
}

export async function createSessionHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = parseWithSchema(createSessionBodySchema, request.body ?? {}, 'body');
  const session = request.server.services.sessionService.createSession({
    modelId: body.modelId ?? request.server.services.modelService.getCurrentModelId(),
    cwd: body.cwd ?? process.cwd(),
    systemPrompt: body.systemPrompt,
  });

  return sendSuccess(reply, {
    session,
  }, { statusCode: 201, message: 'Created' });
}

export async function deleteSessionHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(sessionParamsSchema, request.params, 'params');
  request.server.services.sessionService.deleteSession(params.sessionId);
  reply.status(204).send();
}
