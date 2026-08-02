import type { FastifyInstance } from 'fastify';
import { createSessionBodySchema, sessionParamsSchema } from '@agent-flow/web-contracts';
import { sendSuccess } from '../lib/response.js';
import { parseWithSchema } from '../lib/validation.js';
import { requireJsonBody } from '../middlewares/require-json.js';

export async function registerSessionRoutes(app: FastifyInstance) {
  app.get('/sessions', async (request, reply) => sendSuccess(reply, {
    sessions: await request.server.services.sessionService.listSessions(request.auth.userId),
  }));

  app.get('/sessions/:sessionId', async (request, reply) => {
    const params = parseWithSchema(sessionParamsSchema, request.params, 'params');
    return sendSuccess(
      reply,
      await request.server.services.sessionService.getSessionState(params.sessionId, request.auth.userId),
    );
  });

  app.post('/sessions', { preHandler: requireJsonBody }, async (request, reply) => {
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
    return sendSuccess(reply, { session }, { statusCode: 201 });
  });

  app.delete('/sessions/:sessionId', async (request, reply) => {
    const params = parseWithSchema(sessionParamsSchema, request.params, 'params');
    await request.server.services.sessionService.deleteSession(params.sessionId, request.auth.userId);
    reply.status(204).send();
  });
}
