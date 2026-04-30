import type { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../lib/response.js';

export async function getHealthHandler(request: FastifyRequest, reply: FastifyReply) {
  return sendSuccess(reply, {
    status: 'ok',
    model: request.server.services.modelService.getCurrentModelId(),
    service: '@agent-flow/web-server',
    uptimeSec: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
}
