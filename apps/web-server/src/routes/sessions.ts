import type { FastifyInstance } from 'fastify';
import {
  createSessionHandler,
  deleteSessionHandler,
  getSessionHandler,
  listSessionsHandler,
} from '../handlers/session-handlers.js';
import { requireJsonBody } from '../middlewares/require-json.js';

export async function registerSessionRoutes(app: FastifyInstance) {
  app.get('/sessions', listSessionsHandler);
  app.get('/sessions/:sessionId', getSessionHandler);
  app.post('/sessions', { preHandler: requireJsonBody }, createSessionHandler);
  app.delete('/sessions/:sessionId', deleteSessionHandler);
}
