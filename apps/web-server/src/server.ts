import { createApp } from './app.js';
import { loadEnv } from './config/env.js';

export async function startServer() {
  const env = loadEnv();
  const app = await createApp({ env });

  try {
    await app.listen({ host: env.host, port: env.port });
    app.log.info(
      {
        host: env.host,
        port: env.port,
        model: env.defaultModel,
      },
      '@agent-flow/web-server listening',
    );
  } catch (error) {
    await app.close();
    throw error;
  }

  return app;
}
