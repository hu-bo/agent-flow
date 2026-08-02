import type { FastifyInstance } from 'fastify';
import { sendSuccess } from '../lib/response.js';

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get('/health', async (request, reply) => sendSuccess(reply, {
    status: 'ok',
    model: request.server.services.modelService.getCurrentModelId(),
    service: '@agent-flow/web-server',
    uptimeSec: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  }));
}
