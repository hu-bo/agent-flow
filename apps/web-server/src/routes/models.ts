import type { FastifyInstance } from 'fastify';
import { listModelsHandler, switchModelHandler } from '../handlers/model-handlers.js';
import { requireJsonBody } from '../middlewares/require-json.js';

export async function registerModelRoutes(app: FastifyInstance) {
  app.get('/models', listModelsHandler);
  app.post('/model', { preHandler: requireJsonBody }, switchModelHandler);
}
