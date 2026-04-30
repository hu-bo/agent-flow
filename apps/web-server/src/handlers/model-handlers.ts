import type { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../lib/response.js';
import { parseWithSchema } from '../lib/validation.js';
import { switchModelBodySchema } from '../schemas/model.js';

export async function listModelsHandler(request: FastifyRequest, reply: FastifyReply) {
  return sendSuccess(reply, {
    currentModel: request.server.services.modelService.getCurrentModelId(),
    models: request.server.services.modelService.listModels(),
  });
}

export async function switchModelHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = parseWithSchema(switchModelBodySchema, request.body, 'body');
  const descriptor = await request.server.services.modelService.switchModel(body.modelId, {
    actorId: request.requestContext.actorId,
    requestId: request.requestContext.requestId,
  });
  return sendSuccess(reply, {
    model: descriptor.modelId,
    descriptor,
  });
}
