import type { onRequestHookHandler } from 'fastify';

export const attachRequestContext: onRequestHookHandler = async (request) => {
  request.requestContext = {
    requestId: request.id,
    startedAt: new Date().toISOString(),
    source: detectRequestSource(request.headers['user-agent']),
    actorId: singleHeaderValue(request.headers['x-actor-id']),
    idempotencyKey: singleHeaderValue(request.headers['x-idempotency-key']),
  };
};

function detectRequestSource(userAgent: string | string[] | undefined) {
  const value = singleHeaderValue(userAgent)?.toLowerCase() ?? '';
  if (!value) return 'unknown';
  if (value.includes('mozilla') || value.includes('chrome') || value.includes('safari')) {
    return 'browser';
  }
  if (value.includes('node') || value.includes('agent-flow')) {
    return 'server';
  }
  return 'unknown';
}

function singleHeaderValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
