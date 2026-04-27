import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseWithSchema } from '../lib/validation.js';
import { switchModelBodySchema } from '../schemas/model.js';

export async function listModelsHandler(request: FastifyRequest, reply: FastifyReply) {
  reply.send({
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
  reply.send({
    model: descriptor.modelId,
    descriptor,
  });
}
