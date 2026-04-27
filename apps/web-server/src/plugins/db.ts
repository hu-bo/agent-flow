import type { FastifyInstance } from 'fastify';
import type { AppEnv } from '../config/env.js';
import { createAppDataSource } from '../db/data-source.js';

export interface RegisterDatabaseOptions {
  env: AppEnv;
}

export async function registerDatabase(app: FastifyInstance, options: RegisterDatabaseOptions) {
  const db = createAppDataSource(options.env);

  try {
    await db.initialize();
    await db.runMigrations();
  } catch (error) {
    if (db.isInitialized) {
      await db.destroy();
    }
    throw error;
  }

  app.decorate('db', db);
  app.addHook('onClose', async () => {
    if (db.isInitialized) {
      await db.destroy();
    }
  });
}
