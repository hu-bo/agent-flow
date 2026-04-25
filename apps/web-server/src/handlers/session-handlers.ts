import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseWithSchema } from '../lib/validation.js';
import { createSessionBodySchema, sessionParamsSchema } from '../schemas/session.js';

export async function listSessionsHandler(request: FastifyRequest, reply: FastifyReply) {
  reply.send({
    sessions: request.server.services.sessionService.listSessions(),
  });
}

export async function getSessionHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(sessionParamsSchema, request.params, 'params');
  const state = request.server.services.sessionService.getSessionState(params.sessionId);
  reply.send({
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

  reply.status(201).send({
    session,
  });
}

export async function deleteSessionHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(sessionParamsSchema, request.params, 'params');
  request.server.services.sessionService.deleteSession(params.sessionId);
  reply.status(204).send();
}
