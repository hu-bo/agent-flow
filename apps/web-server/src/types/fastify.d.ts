import 'fastify';
import type { RequestContext } from '../contracts/api.js';
import type { AppDataSource } from '../db/data-source.js';
import type { UserRole, UserStatus } from '../db/entities/user.entity.js';
import type { AppServices } from '../services/types.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: AppDataSource;
    services: AppServices;
  }

  interface FastifyRequest {
    requestContext: RequestContext;
    auth: {
      userId: string;
      username: string;
      role: UserRole;
      status: UserStatus;
      claims?: Record<string, unknown>;
    };
  }
}
