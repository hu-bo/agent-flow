import type { FastifyInstance } from 'fastify';
import { getHealthHandler } from '../handlers/health-handlers.js';

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get('/health', getHealthHandler);
}
