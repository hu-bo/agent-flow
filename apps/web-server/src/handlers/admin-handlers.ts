import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseWithSchema } from '../lib/validation.js';
import {
  createAdminModelBodySchema,
  createModelProfileBodySchema,
  createProviderBodySchema,
  createProviderCredentialBodySchema,
  listAdminModelsQuerySchema,
  listAuditLogsQuerySchema,
  modelParamsSchema,
  modelProfileParamsSchema,
  providerParamsSchema,
  updateAdminModelBodySchema,
  updateProviderBodySchema,
  updateModelProfileBodySchema,
  upsertRoutingPolicyBodySchema,
} from '../schemas/admin.js';

export async function listProvidersHandler(request: FastifyRequest, reply: FastifyReply) {
  const providers = await request.server.services.modelService.listProviders();
  reply.send({ providers });
}

export async function createProviderHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = parseWithSchema(createProviderBodySchema, request.body, 'body');
  const provider = await request.server.services.modelService.createProvider(body, {
    actorId: request.requestContext.actorId,
    requestId: request.requestContext.requestId,
  });
  reply.status(201).send({ provider });
}

export async function deleteProviderHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(providerParamsSchema, request.params, 'params');
  await request.server.services.modelService.deleteProvider(params.providerId, {
    actorId: request.requestContext.actorId,
    requestId: request.requestContext.requestId,
  });
  reply.status(204).send();
}

export async function updateProviderHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(providerParamsSchema, request.params, 'params');
  const body = parseWithSchema(updateProviderBodySchema, request.body, 'body');
  const provider = await request.server.services.modelService.updateProvider(
    params.providerId,
    body,
    {
      actorId: request.requestContext.actorId,
      requestId: request.requestContext.requestId,
    },
  );
  reply.send({ provider });
}

export async function createProviderCredentialHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = parseWithSchema(providerParamsSchema, request.params, 'params');
  const body = parseWithSchema(createProviderCredentialBodySchema, request.body, 'body');
  const credential = await request.server.services.modelService.createProviderCredential(
    params.providerId,
    body,
    {
      actorId: request.requestContext.actorId,
      requestId: request.requestContext.requestId,
    },
  );
  reply.status(201).send({ credential });
}

export async function listAdminModelsHandler(request: FastifyRequest, reply: FastifyReply) {
  const query = parseWithSchema(listAdminModelsQuerySchema, request.query ?? {}, 'query');
  const models = await request.server.services.modelService.listAdminModels(query);
  reply.send({ models });
}

export async function createAdminModelHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = parseWithSchema(createAdminModelBodySchema, request.body, 'body');
  const model = await request.server.services.modelService.createAdminModel(body, {
    actorId: request.requestContext.actorId,
    requestId: request.requestContext.requestId,
  });
  reply.status(201).send({ model });
}

export async function updateAdminModelHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(modelParamsSchema, request.params, 'params');
  const body = parseWithSchema(updateAdminModelBodySchema, request.body, 'body');
  const model = await request.server.services.modelService.updateAdminModel(params.modelId, body, {
    actorId: request.requestContext.actorId,
    requestId: request.requestContext.requestId,
  });
  reply.send({ model });
}

export async function deleteAdminModelHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(modelParamsSchema, request.params, 'params');

  await request.server.services.modelService.deleteAdminModel(params.modelId, {
    actorId: request.requestContext.actorId,
    requestId: request.requestContext.requestId,
  });
  reply.status(204).send();
}

export async function listModelProfilesHandler(request: FastifyRequest, reply: FastifyReply) {
  const profiles = await request.server.services.modelService.listModelProfiles();
  reply.send({ profiles });
}

export async function createModelProfileHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = parseWithSchema(createModelProfileBodySchema, request.body, 'body');
  const profile = await request.server.services.modelService.createModelProfile(body, {
    actorId: request.requestContext.actorId,
    requestId: request.requestContext.requestId,
  });
  reply.status(201).send({ profile });
}

export async function updateModelProfileHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(modelProfileParamsSchema, request.params, 'params');
  const body = parseWithSchema(updateModelProfileBodySchema, request.body, 'body');
  const profile = await request.server.services.modelService.updateModelProfile(
    params.profileId,
    body,
    {
      actorId: request.requestContext.actorId,
      requestId: request.requestContext.requestId,
    },
  );
  reply.send({ profile });
}

export async function upsertRoutingPolicyHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(modelProfileParamsSchema, request.params, 'params');
  const body = parseWithSchema(upsertRoutingPolicyBodySchema, request.body, 'body');
  const policy = await request.server.services.modelService.upsertRoutingPolicy(
    params.profileId,
    body,
    {
      actorId: request.requestContext.actorId,
      requestId: request.requestContext.requestId,
    },
  );
  reply.send({ policy });
}

export async function listAuditLogsHandler(request: FastifyRequest, reply: FastifyReply) {
  const query = parseWithSchema(listAuditLogsQuerySchema, request.query ?? {}, 'query');
  const auditLogs = await request.server.services.modelService.listAuditLogs(query);
  reply.send({ auditLogs });
}
