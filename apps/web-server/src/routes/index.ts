import type { FastifyInstance } from 'fastify';
import { requireBearerAuth } from '../middlewares/auth.js';
import { registerAdminRoutes } from './admin.js';
import { registerAuthRoutes } from './auth.js';
import { registerChatRoutes } from './chat.js';
import { registerCompactRoutes } from './compact.js';
import { registerHealthRoutes } from './health.js';
import { registerModelRoutes } from './models.js';
import { registerRunnerRoutes } from './runners.js';
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
    await registerAuthRoutes(api);

    await api.register(async (protectedApi) => {
      protectedApi.addHook('preHandler', requireBearerAuth);
      await registerAdminRoutes(protectedApi);
      await registerModelRoutes(protectedApi);
      await registerSessionRoutes(protectedApi);
      await registerRunnerRoutes(protectedApi);
      await registerCompactRoutes(protectedApi);
      await registerChatRoutes(protectedApi);
      await registerTaskRoutes(protectedApi);
    });
  }, { prefix: '/api' });
}
