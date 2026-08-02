import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { sessionIdSchema } from '@agent-flow/web-contracts';
import { sendSuccess } from '../lib/response.js';
import { parseWithSchema } from '../lib/validation.js';
import { requireJsonBody } from '../middlewares/require-json.js';

const compactBodySchema = z.object({
  sessionId: sessionIdSchema.optional(),
  trigger: z.enum(['auto', 'manual', 'model-switch']).default('manual'),
});

export async function registerCompactRoutes(app: FastifyInstance) {
  app.post('/compact', { preHandler: requireJsonBody }, async (request, reply) => {
    const body = parseWithSchema(compactBodySchema, request.body ?? {}, 'body');
    const result = await request.server.services.compactService.compactSession(
      body.sessionId,
      body.trigger,
      request.auth.userId,
    );
    return sendSuccess(reply, result);
  });
}
