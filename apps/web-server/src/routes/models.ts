import type { FastifyInstance } from 'fastify';
import { sendSuccess } from '../lib/response.js';

export async function registerModelRoutes(app: FastifyInstance) {
  app.get('/models', async (request, reply) => sendSuccess(reply, {
    currentModel: request.server.services.modelService.getCurrentModelId(),
    models: request.server.services.modelService.listModels(),
  }));
}
