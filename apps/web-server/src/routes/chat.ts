import type { FastifyInstance } from 'fastify';
import {
  createChatHandler,
  deleteChatMessageHandler,
  retryChatMessageHandler,
} from '../handlers/chat-handlers.js';
import { requireJsonBody } from '../middlewares/require-json.js';

export async function registerChatRoutes(app: FastifyInstance) {
  app.post('/chat', { preHandler: requireJsonBody }, createChatHandler);
  app.post('/chat/:session_id/retry', { preHandler: requireJsonBody }, retryChatMessageHandler);
  app.delete('/chat/:session_id/messages/:msg_id', deleteChatMessageHandler);
}
