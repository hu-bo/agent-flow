import type { FastifyInstance } from 'fastify';
import { specConfirmBodySchema, specSessionParamsSchema } from '@agent-flow/web-contracts';
import { toClientMessages } from '../lib/client-messages.js';
import { sendSuccess } from '../lib/response.js';
import { parseWithSchema } from '../lib/validation.js';
import { requireJsonBody } from '../middlewares/require-json.js';

export async function registerSpecRoutes(app: FastifyInstance) {
  app.get('/spec/:sessionId/state', async (request, reply) => {
    const params = parseWithSchema(specSessionParamsSchema, request.params, 'params');
    const { session, workflow } = await request.server.services.specWorkflowService.ensureSpecState(params.sessionId);
    return sendSuccess(reply, { sessionId: session.sessionId, mode: 'spec', specWorkflow: workflow });
  });

  app.post('/spec/:sessionId/confirm', { preHandler: requireJsonBody }, async (request, reply) => {
    const params = parseWithSchema(specSessionParamsSchema, request.params, 'params');
    const body = parseWithSchema(specConfirmBodySchema, request.body ?? {}, 'body');
    const confirmResult = await request.server.services.specConversationService.confirmPhase({
      userId: request.auth.userId,
      sessionId: params.sessionId,
      selectedArtifacts: body.selectedArtifacts,
      actionAnswer: body.actionAnswer,
      requestId: request.requestContext.requestId,
    });
    const state = await request.server.services.sessionService.getSessionState(
      params.sessionId,
      request.auth.userId,
    );
    return sendSuccess(reply, {
      session: state.session,
      messages: toClientMessages(confirmResult.messages),
      specWorkflow: confirmResult.workflow ?? state.session.specWorkflow,
      progressed: confirmResult.progressed,
    });
  });
}
