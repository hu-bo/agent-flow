import type { FastifyInstance } from 'fastify';
import { createChatHandler } from '../handlers/chat-handlers.js';
import { requireJsonBody } from '../middlewares/require-json.js';

export async function registerChatRoutes(app: FastifyInstance) {
  app.post('/chat', { preHandler: requireJsonBody }, createChatHandler);
}
