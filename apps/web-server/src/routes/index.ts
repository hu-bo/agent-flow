import type { FastifyInstance } from 'fastify';
import { registerChatRoutes } from './chat.js';
import { registerCompactRoutes } from './compact.js';
import { registerHealthRoutes } from './health.js';
import { registerModelRoutes } from './models.js';
import { registerSessionRoutes } from './sessions.js';
import { registerTaskRoutes } from './tasks.js';

export async function registerRoutes(app: FastifyInstance) {
  app.get('/', async () => ({
    service: '@agent-flow/web-server',
    status: 'ok',
    apiBase: '/api',
  }));

  await app.register(async (api) => {
    await registerHealthRoutes(api);
    await registerModelRoutes(api);
    await registerSessionRoutes(api);
    await registerCompactRoutes(api);
    await registerChatRoutes(api);
    await registerTaskRoutes(api);
  }, { prefix: '/api' });
}
