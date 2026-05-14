import type { FastifyInstance } from 'fastify';
import { confirmSpecPhaseHandler, getSpecStateHandler } from '../handlers/spec-handlers.js';
import { requireJsonBody } from '../middlewares/require-json.js';

export async function registerSpecRoutes(app: FastifyInstance) {
  app.get('/spec/:session_id/state', getSpecStateHandler);
  app.post('/spec/:session_id/confirm', { preHandler: requireJsonBody }, confirmSpecPhaseHandler);
}
