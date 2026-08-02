import type { FastifyReply } from 'fastify';

export interface ApiErrorEnvelope {
  code: string;
  message: string;
  details?: unknown;
}

export function sendSuccess<T>(
  reply: FastifyReply,
  data: T,
  options: {
    message?: string;
    statusCode?: number;
  } = {},
) {
  return reply.status(options.statusCode ?? 200).send(data);
}

export function sendError(
  reply: FastifyReply,
  options: {
    code: string;
    message: string;
    statusCode: number;
    details?: unknown;
  },
) {
  const payload: ApiErrorEnvelope = {
    code: options.code,
    message: options.message,
  };
  if (options.details !== undefined) {
    payload.details = options.details;
  }
  return reply.status(options.statusCode).send(payload);
}
