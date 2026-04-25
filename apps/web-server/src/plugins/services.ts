import type { FastifyInstance } from 'fastify';
import type { AppEnv } from '../config/env.js';
import { createServices } from '../services/service-container.js';

export interface RegisterServicesOptions {
  env: AppEnv;
}

export async function registerServices(app: FastifyInstance, options: RegisterServicesOptions) {
  app.decorate('services', createServices(options.env));
}
