import type { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../lib/response.js';
import { parseWithSchema } from '../lib/validation.js';
import { specConfirmBodySchema, specSessionParamsSchema } from '../schemas/spec.js';

export async function getSpecStateHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(specSessionParamsSchema, request.params, 'params');
  const { session, workflow } = await request.server.services.specWorkflowService.ensureSpecState(params.session_id);
  return sendSuccess(reply, {
    sessionId: session.sessionId,
    mode: 'spec',
    specWorkflow: workflow,
  });
}

export async function confirmSpecPhaseHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(specSessionParamsSchema, request.params, 'params');
  const body = parseWithSchema(specConfirmBodySchema, request.body ?? {}, 'body');
  const confirmResult = await request.server.services.chatService.confirmSpecPhase({
    userId: request.auth.userId,
    sessionId: params.session_id,
    selectedArtifacts: body.selected_artifacts,
    actionAnswer: body.action_answer,
    requestId: request.requestContext.requestId,
  });
  const state = await request.server.services.sessionService.getSessionState(params.session_id, request.auth.userId);
  return sendSuccess(reply, {
    session: state.session,
    messages: confirmResult.messages,
    specWorkflow: confirmResult.workflow ?? state.session.specWorkflow,
    progressed: confirmResult.progressed,
  });
}
