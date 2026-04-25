import type { preHandlerHookHandler } from 'fastify';
import { ValidationError } from '../lib/errors.js';

export const requireJsonBody: preHandlerHookHandler = async (request) => {
  const contentType = request.headers['content-type'];
  if (typeof contentType === 'string' && contentType.includes('application/json')) {
    return;
  }

  throw new ValidationError('Content-Type must be application/json');
};
