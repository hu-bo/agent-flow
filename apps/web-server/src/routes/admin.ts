import type { FastifyInstance } from 'fastify';
import {
  createAdminModelHandler,
  createModelProfileHandler,
  createProviderCredentialHandler,
  createProviderHandler,
  deleteProviderHandler,
  deleteAdminModelHandler,
  listAdminModelsHandler,
  listAuditLogsHandler,
  listModelProfilesHandler,
  listProvidersHandler,
  updateAdminModelHandler,
  updateProviderHandler,
  updateModelProfileHandler,
  upsertRoutingPolicyHandler,
} from '../handlers/admin-handlers.js';
import { requireJsonBody } from '../middlewares/require-json.js';

export async function registerAdminRoutes(app: FastifyInstance) {
  app.get('/admin/providers', listProvidersHandler);
  app.post('/admin/providers', { preHandler: requireJsonBody }, createProviderHandler);
  app.patch('/admin/providers/:providerId', { preHandler: requireJsonBody }, updateProviderHandler);
  app.delete('/admin/providers/:providerId', deleteProviderHandler);
  app.post(
    '/admin/providers/:providerId/credentials',
    { preHandler: requireJsonBody },
    createProviderCredentialHandler,
  );

  app.get('/admin/models', listAdminModelsHandler);
  app.post('/admin/models', { preHandler: requireJsonBody }, createAdminModelHandler);
  app.patch('/admin/models/:modelId', { preHandler: requireJsonBody }, updateAdminModelHandler);
  app.delete('/admin/models/:modelId', deleteAdminModelHandler);

  app.get('/admin/model-profiles', listModelProfilesHandler);
  app.post('/admin/model-profiles', { preHandler: requireJsonBody }, createModelProfileHandler);
  app.patch(
    '/admin/model-profiles/:profileId',
    { preHandler: requireJsonBody },
    updateModelProfileHandler,
  );
  app.put(
    '/admin/model-profiles/:profileId/routing',
    { preHandler: requireJsonBody },
    upsertRoutingPolicyHandler,
  );

  app.get('/admin/audit-logs', listAuditLogsHandler);
}
