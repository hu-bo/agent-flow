import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { attachRequestContext } from '../middlewares/request-context.js';
import { AppError, ValidationError } from '../lib/errors.js';
import { sendError } from '../lib/response.js';

interface FastifyClientError {
  statusCode?: number;
  code?: string;
}

export async function registerHttpRuntime(app: FastifyInstance) {
  const defaultJsonParser = app.getDefaultJsonParser('error', 'error');
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (request, body, done) => {
    const rawBody = typeof body === 'string' ? body : body.toString('utf8');
    if (rawBody.trim().length === 0) {
      done(null, {});
      return;
    }

    defaultJsonParser(request, rawBody, done);
  });

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
      sendError(reply, {
        statusCode: error.statusCode,
        message: error.message,
        details: error.details,
      });
      return;
    }

    if (error instanceof ZodError) {
      const validationError = new ValidationError('Invalid request payload', error.flatten());
      sendError(reply, {
        statusCode: validationError.statusCode,
        message: validationError.message,
        details: validationError.details,
      });
      return;
    }

    if (isFastifyClientError(error)) {
      sendError(reply, {
        statusCode: error.statusCode,
        message: error.message,
      });
      return;
    }

    request.log.error({ err: error }, 'Unhandled request error');
    sendError(reply, {
      statusCode: 500,
      message: 'Internal Server Error',
    });
  });

  app.setNotFoundHandler((request, reply) => {
    sendError(reply, {
      statusCode: 404,
      message: `Route not found: ${request.method} ${request.url}`,
    });
  });
}

function isFastifyClientError(error: unknown): error is Error & Required<FastifyClientError> {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const { statusCode } = error as FastifyClientError;
  return typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500;
}
