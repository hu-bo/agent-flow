import type { FastifyInstance } from 'fastify';
import { compactSessionHandler } from '../handlers/compact-handlers.js';
import { requireJsonBody } from '../middlewares/require-json.js';

export async function registerCompactRoutes(app: FastifyInstance) {
  app.post('/compact', { preHandler: requireJsonBody }, compactSessionHandler);
}
