import 'fastify';
import type { RequestContext } from '../contracts/api.js';
import type { AppServices } from '../services/types.js';

declare module 'fastify' {
  interface FastifyInstance {
    services: AppServices;
  }

  interface FastifyRequest {
    requestContext: RequestContext;
  }
}
