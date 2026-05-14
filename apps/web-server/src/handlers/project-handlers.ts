import type { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../lib/response.js';
import { parseWithSchema } from '../lib/validation.js';
import { createProjectBodySchema, projectParamsSchema, updateProjectBodySchema } from '../schemas/project.js';

export async function listProjectsHandler(request: FastifyRequest, reply: FastifyReply) {
  return sendSuccess(reply, {
    projects: await request.server.services.projectService.listProjects(request.auth.userId),
  });
}

export async function createProjectHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = parseWithSchema(createProjectBodySchema, request.body, 'body');
  const project = await request.server.services.projectService.createProject({
    ownerUserId: request.auth.userId,
    name: body.name,
    rootPath: body.rootPath,
    runnerId: body.runnerId,
  });
  return sendSuccess(reply, { project }, { statusCode: 201, message: 'Created' });
}

export async function updateProjectHandler(request: FastifyRequest, reply: FastifyReply) {
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
}

export async function deleteProjectHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(projectParamsSchema, request.params, 'params');
  await request.server.services.projectService.deleteProject(request.auth.userId, params.projectId);
  reply.status(204).send();
}

export async function listProjectSessionsHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(projectParamsSchema, request.params, 'params');
  await request.server.services.projectService.getProject(request.auth.userId, params.projectId);
  return sendSuccess(reply, {
    sessions: await request.server.services.sessionService.listSessions(request.auth.userId, {
      projectId: params.projectId,
    }),
  });
}
