import type { FastifyReply } from 'fastify';

export interface ApiSuccessEnvelope<T> {
  code: 0;
  data: T;
  message: string;
  requestId: string;
}

export interface ApiErrorEnvelope {
  code: string | number;
  data: null;
  message: string;
  requestId: string;
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
  const payload: ApiSuccessEnvelope<T> = {
    code: 0,
    data,
    message: options.message ?? 'OK',
    requestId: reply.request.id,
  };
  return reply.status(options.statusCode ?? 200).send(payload);
}

export function sendError(
  reply: FastifyReply,
  options: {
    code: string | number;
    message: string;
    statusCode: number;
    details?: unknown;
  },
) {
  const payload: ApiErrorEnvelope = {
    code: options.code,
    data: null,
    message: options.message,
    requestId: reply.request.id,
  };
  if (options.details !== undefined) {
    payload.details = options.details;
  }
  return reply.status(options.statusCode).send(payload);
}
