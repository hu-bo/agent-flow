import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { attachRequestContext } from '../middlewares/request-context.js';
import { AppError, ValidationError } from '../lib/errors.js';

export async function registerHttpRuntime(app: FastifyInstance) {
  app.addHook('onRequest', attachRequestContext);
  app.addHook('onSend', async (request, reply, payload) => {
    reply.header('x-request-id', request.id);
    return payload;
  });

  app.setErrorHandler((error, request, reply) => {
    if (reply.sent) {
      request.log.error({ err: error }, 'Unhandled error after reply was sent');
      return;
    }

    if (error instanceof AppError) {
      reply.status(error.statusCode).send({
        error: error.message,
        code: error.code,
        details: error.details,
        requestId: request.id,
      });
      return;
    }

    if (error instanceof ZodError) {
      const validationError = new ValidationError('Invalid request payload', error.flatten());
      reply.status(validationError.statusCode).send({
        error: validationError.message,
        code: validationError.code,
        details: validationError.details,
        requestId: request.id,
      });
      return;
    }

    request.log.error({ err: error }, 'Unhandled request error');
    reply.status(500).send({
      error: 'Internal Server Error',
      code: 'INTERNAL_SERVER_ERROR',
      requestId: request.id,
    });
  });

  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: `Route not found: ${request.method} ${request.url}`,
      code: 'NOT_FOUND',
      requestId: request.id,
    });
  });
}
