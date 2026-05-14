import type { FastifyInstance } from 'fastify';
import {
  createProjectHandler,
  deleteProjectHandler,
  listProjectSessionsHandler,
  listProjectsHandler,
  updateProjectHandler,
} from '../handlers/project-handlers.js';
import { requireJsonBody } from '../middlewares/require-json.js';

export async function registerProjectRoutes(app: FastifyInstance) {
  app.get('/projects', listProjectsHandler);
  app.post('/projects', { preHandler: requireJsonBody }, createProjectHandler);
  app.patch('/projects/:projectId', { preHandler: requireJsonBody }, updateProjectHandler);
  app.delete('/projects/:projectId', deleteProjectHandler);
  app.get('/projects/:projectId/sessions', listProjectSessionsHandler);
}
