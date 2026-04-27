import cors from '@fastify/cors';
import Fastify from 'fastify';
import type { AppEnv } from './config/env.js';
import { registerDatabase } from './plugins/db.js';
import { registerHttpRuntime } from './plugins/http.js';
import { registerServices } from './plugins/services.js';
import { registerRoutes } from './routes/index.js';

export interface CreateAppOptions {
  env: AppEnv;
}

export async function createApp({ env }: CreateAppOptions) {
  const app = Fastify({
    logger: {
      level: env.nodeEnv === 'production' ? 'info' : 'debug',
    },
  });

  await app.register(cors, {
    origin: env.corsOrigin,
    credentials: true,
  });

  await registerHttpRuntime(app);
  await registerDatabase(app, { env });
  await registerServices(app, { env });
  await registerRoutes(app);

  return app;
}
