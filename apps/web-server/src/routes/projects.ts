import type { FastifyInstance } from 'fastify';
import {
  createProjectBodySchema,
  projectParamsSchema,
  updateProjectBodySchema,
} from '@agent-flow/web-contracts';
import { sendSuccess } from '../lib/response.js';
import { parseWithSchema } from '../lib/validation.js';
import { requireJsonBody } from '../middlewares/require-json.js';

export async function registerProjectRoutes(app: FastifyInstance) {
  app.get('/projects', async (request, reply) => sendSuccess(reply, {
    projects: await request.server.services.projectService.listProjects(request.auth.userId),
  }));

  app.post('/projects', { preHandler: requireJsonBody }, async (request, reply) => {
    const body = parseWithSchema(createProjectBodySchema, request.body, 'body');
    const project = await request.server.services.projectService.createProject({
      ownerUserId: request.auth.userId,
      name: body.name,
      rootPath: body.rootPath,
      runnerId: body.runnerId,
    });
    return sendSuccess(reply, { project }, { statusCode: 201 });
  });

  app.patch('/projects/:projectId', { preHandler: requireJsonBody }, async (request, reply) => {
    const params = parseWithSchema(projectParamsSchema, request.params, 'params');
    const body = parseWithSchema(updateProjectBodySchema, request.body ?? {}, 'body');
    const project = await request.server.services.projectService.updateProject({
      ownerUserId: request.auth.userId,
      projectId: params.projectId,
      name: body.name,
      rootPath: body.rootPath,
      defaultRunnerId: body.defaultRunnerId,
    });
    return sendSuccess(reply, { project });
  });

  app.delete('/projects/:projectId', async (request, reply) => {
    const params = parseWithSchema(projectParamsSchema, request.params, 'params');
    await request.server.services.projectService.deleteProject(request.auth.userId, params.projectId);
    reply.status(204).send();
  });

  app.get('/projects/:projectId/sessions', async (request, reply) => {
    const params = parseWithSchema(projectParamsSchema, request.params, 'params');
    await request.server.services.projectService.getProject(request.auth.userId, params.projectId);
    return sendSuccess(reply, {
      sessions: await request.server.services.sessionService.listSessions(request.auth.userId, {
        projectId: params.projectId,
      }),
    });
  });
}
