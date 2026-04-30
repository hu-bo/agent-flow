import type { FastifyInstance } from 'fastify';
import {
  authorizeUrlHandler,
  exchangeTokenHandler,
  getMeHandler,
  refreshTokenHandler,
  sdkGetMeHandler,
  signupUrlHandler,
} from '../handlers/auth-handlers.js';
import { requireBearerAuth } from '../middlewares/auth.js';
import { requireJsonBody } from '../middlewares/require-json.js';

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post<{ Params: { appName: string } }>(
    '/apps/:appName/oauth/authorize-url',
    { preHandler: requireJsonBody },
    authorizeUrlHandler,
  );
  app.post<{ Params: { appName: string } }>(
    '/apps/:appName/oauth/signup-url',
    { preHandler: requireJsonBody },
    signupUrlHandler,
  );
  app.post<{ Params: { appName: string } }>(
    '/apps/:appName/oauth/token',
    { preHandler: requireJsonBody },
    exchangeTokenHandler,
  );
  app.post<{ Params: { appName: string } }>(
    '/apps/:appName/oauth/token/refresh',
    { preHandler: requireJsonBody },
    refreshTokenHandler,
  );
  app.get('/me', sdkGetMeHandler);
  app.get('/auth/me', { preHandler: requireBearerAuth }, getMeHandler);
}
