import 'reflect-metadata';
import { DataSource } from 'typeorm';
import type { AppEnv } from '../config/env.js';
import { entities } from './entities/index.js';
import { migrations } from './migrations/index.js';

export type AppDataSource = DataSource;

export function createAppDataSource(env: AppEnv): AppDataSource {
  return new DataSource({
    type: 'postgres',
    url: env.databaseUrl,
    entities,
    migrations,
    synchronize: false,
    migrationsRun: false,
    logging: env.nodeEnv === 'development' ? ['error', 'schema'] : ['error'],
  });
}
