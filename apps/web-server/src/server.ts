import { createApp } from './app.js';
import { loadEnv } from './config/env.js';
import { startRunnerGrpcServer } from './services/runner-grpc-server.js';

export async function startServer() {
  const env = loadEnv();
  const app = await createApp({ env });
  let runnerGrpc: { address: string; close: () => Promise<void> } | undefined;

  try {
    runnerGrpc = await startRunnerGrpcServer(
      {
        runnerRegistryService: app.services.runnerRegistryService,
        runnerDispatchService: app.services.runnerDispatchService,
      },
      {
        host: env.runnerGrpcHost,
        port: env.runnerGrpcPort,
      },
    );
    app.addHook('onClose', async () => {
      if (runnerGrpc) {
        await runnerGrpc.close();
      }
    });

    await app.listen({ host: env.host, port: env.port });
    app.log.info(
      {
        host: env.host,
        port: env.port,
        runnerGrpcAddress: runnerGrpc.address,
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
