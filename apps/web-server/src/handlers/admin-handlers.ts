import type { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../lib/response.js';
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
  const providers = await request.server.services.modelAdminService.listProviders();
  return sendSuccess(reply, { providers });
}

export async function createProviderHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = parseWithSchema(createProviderBodySchema, request.body, 'body');
  const provider = await request.server.services.modelAdminService.createProvider(body, {
    actorId: request.requestContext.actorId,
    requestId: request.requestContext.requestId,
  });
  return sendSuccess(reply, { provider }, { statusCode: 201, message: 'Created' });
}

export async function deleteProviderHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(providerParamsSchema, request.params, 'params');
  await request.server.services.modelAdminService.deleteProvider(params.providerId, {
    actorId: request.requestContext.actorId,
    requestId: request.requestContext.requestId,
  });
  reply.status(204).send();
}

export async function updateProviderHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(providerParamsSchema, request.params, 'params');
  const body = parseWithSchema(updateProviderBodySchema, request.body, 'body');
  const provider = await request.server.services.modelAdminService.updateProvider(
    params.providerId,
    body,
    {
      actorId: request.requestContext.actorId,
      requestId: request.requestContext.requestId,
    },
  );
  return sendSuccess(reply, { provider });
}

export async function createProviderCredentialHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = parseWithSchema(providerParamsSchema, request.params, 'params');
  const body = parseWithSchema(createProviderCredentialBodySchema, request.body, 'body');
  const credential = await request.server.services.modelAdminService.createProviderCredential(
    params.providerId,
    body,
    {
      actorId: request.requestContext.actorId,
      requestId: request.requestContext.requestId,
    },
  );
  return sendSuccess(reply, { credential }, { statusCode: 201, message: 'Created' });
}

export async function listAdminModelsHandler(request: FastifyRequest, reply: FastifyReply) {
  const query = parseWithSchema(listAdminModelsQuerySchema, request.query ?? {}, 'query');
  const models = await request.server.services.modelAdminService.listAdminModels(query);
  return sendSuccess(reply, { models });
}

export async function createAdminModelHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = parseWithSchema(createAdminModelBodySchema, request.body, 'body');
  const model = await request.server.services.modelAdminService.createAdminModel(body, {
    actorId: request.requestContext.actorId,
    requestId: request.requestContext.requestId,
  });
  return sendSuccess(reply, { model }, { statusCode: 201, message: 'Created' });
}

export async function updateAdminModelHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(modelParamsSchema, request.params, 'params');
  const body = parseWithSchema(updateAdminModelBodySchema, request.body, 'body');
  const model = await request.server.services.modelAdminService.updateAdminModel(params.modelId, body, {
    actorId: request.requestContext.actorId,
    requestId: request.requestContext.requestId,
  });
  return sendSuccess(reply, { model });
}

export async function deleteAdminModelHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(modelParamsSchema, request.params, 'params');

  await request.server.services.modelAdminService.deleteAdminModel(params.modelId, {
    actorId: request.requestContext.actorId,
    requestId: request.requestContext.requestId,
  });
  reply.status(204).send();
}

export async function listModelProfilesHandler(request: FastifyRequest, reply: FastifyReply) {
  const profiles = await request.server.services.modelAdminService.listModelProfiles();
  return sendSuccess(reply, { profiles });
}

export async function createModelProfileHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = parseWithSchema(createModelProfileBodySchema, request.body, 'body');
  const profile = await request.server.services.modelAdminService.createModelProfile(body, {
    actorId: request.requestContext.actorId,
    requestId: request.requestContext.requestId,
  });
  return sendSuccess(reply, { profile }, { statusCode: 201, message: 'Created' });
}

export async function updateModelProfileHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(modelProfileParamsSchema, request.params, 'params');
  const body = parseWithSchema(updateModelProfileBodySchema, request.body, 'body');
  const profile = await request.server.services.modelAdminService.updateModelProfile(
    params.profileId,
    body,
    {
      actorId: request.requestContext.actorId,
      requestId: request.requestContext.requestId,
    },
  );
  return sendSuccess(reply, { profile });
}

export async function upsertRoutingPolicyHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(modelProfileParamsSchema, request.params, 'params');
  const body = parseWithSchema(upsertRoutingPolicyBodySchema, request.body, 'body');
  const policy = await request.server.services.modelAdminService.upsertRoutingPolicy(
    params.profileId,
    body,
    {
      actorId: request.requestContext.actorId,
      requestId: request.requestContext.requestId,
    },
  );
  return sendSuccess(reply, { policy });
}

export async function listAuditLogsHandler(request: FastifyRequest, reply: FastifyReply) {
  const query = parseWithSchema(listAuditLogsQuerySchema, request.query ?? {}, 'query');
  const auditLogs = await request.server.services.modelAdminService.listAuditLogs(query);
  return sendSuccess(reply, { auditLogs });
}
