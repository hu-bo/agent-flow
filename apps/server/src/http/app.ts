import * as crypto from 'crypto';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { StatusCode } from 'hono/utils/http-status';
import type { ServerConfig } from '../config.js';
import { toErrorPayload } from '../errors.js';
import type { ServerRuntime } from '../runtime.js';
import { createApiRoutes } from './routes.js';
import { createStaticMiddleware } from './static.js';

export function createServerApp(runtime: ServerRuntime, config: ServerConfig): Hono {
  const app = new Hono();

  app.use('*', async (c, next) => {
    const requestId = crypto.randomUUID();
    c.header('x-request-id', requestId);
    await next();
  });

  app.use(
    '/api/*',
    cors({
      origin: config.corsOrigins ?? ['*'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: [
        'Content-Type',
        'Authorization',
        'X-User-ID',
        'X-Device-ID',
        'X-Session-ID',
        'X-Request-ID',
        'X-Source',
      ],
    }),
  );

  app.route('/api', createApiRoutes(runtime));

  if (config.staticDir) {
    app.use('*', createStaticMiddleware(config.staticDir));
  }

  app.notFound((c) => c.json({ error: 'Not Found', code: 'NOT_FOUND' }, 404));

  app.onError((error, c) => {
    const mapped = toErrorPayload(error);
    if (mapped.status >= 500) {
      console.error('[server:error]', {
        method: c.req.method,
        path: c.req.path,
        error: mapped.body.error,
      });
    }
    return c.newResponse(JSON.stringify(mapped.body), mapped.status as StatusCode, {
      'Content-Type': 'application/json; charset=utf-8',
    });
  });

  return app;
}
