import type { FastifyReply, FastifyRequest } from 'fastify';

export async function getHealthHandler(request: FastifyRequest, reply: FastifyReply) {
  reply.send({
    status: 'ok',
    model: request.server.services.modelService.getCurrentModelId(),
    service: '@agent-flow/web-server',
    uptimeSec: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
}
