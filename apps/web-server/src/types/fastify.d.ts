import 'fastify';
import type { RequestContext } from '../contracts/api.js';
import type { AppDataSource } from '../db/data-source.js';
import type { AppServices } from '../services/types.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: AppDataSource;
    services: AppServices;
  }

  interface FastifyRequest {
    requestContext: RequestContext;
  }
}
