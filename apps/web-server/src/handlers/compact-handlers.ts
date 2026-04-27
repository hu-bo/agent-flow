import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseWithSchema } from '../lib/validation.js';
import { compactBodySchema } from '../schemas/compact.js';

export async function compactSessionHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = parseWithSchema(compactBodySchema, request.body ?? {}, 'body');
  const result = await request.server.services.compactService.compactSession(
    body.sessionId,
    body.trigger,
  );
  reply.send(result);
}
