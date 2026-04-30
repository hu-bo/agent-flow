import type { preHandlerHookHandler } from 'fastify';
import { AppError } from '../lib/errors.js';

export const requireBearerAuth: preHandlerHookHandler = async (request) => {
  const authorization = request.headers.authorization;
  if (!authorization) {
    throw new AppError(401, 'UNAUTHORIZED', 'Missing Authorization header');
  }

  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid Authorization header');
  }

  const verified = await request.server.services.authService.verifyAccessToken(token);
  request.auth = {
    userId: verified.user.userId,
    username: verified.user.username,
    role: verified.user.role,
    status: verified.user.status,
    claims: verified.claims,
  };
  request.requestContext.actorId = verified.user.userId;
};

export const requireAdminRole: preHandlerHookHandler = async (request) => {
  if (!request.auth || request.auth.role !== 'admin') {
    throw new AppError(403, 'FORBIDDEN', 'Admin role required');
  }
};
