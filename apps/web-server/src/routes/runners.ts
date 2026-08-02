import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  runnerBindingBodySchema,
  runnerBindingParamsSchema,
  runnerFsListBodySchema,
  runnerParamsSchema,
  runnerDownloadPlatformParamsSchema,
  runnerApprovalDecisionBodySchema,
  runnerApprovalDecisionParamsSchema,
  runnerApprovalGrantParamsSchema,
} from '@agent-flow/web-contracts';
import { AppError } from '../lib/errors.js';
import { sendSuccess } from '../lib/response.js';
import { createSseStream } from '../lib/sse.js';
import { parseWithSchema } from '../lib/validation.js';
import { requireJsonBody } from '../middlewares/require-json.js';

export async function registerRunnerRoutes(app: FastifyInstance) {
  app.get('/runners', listRunnersHandler);
  app.delete('/runners/:runnerId', deleteRunnerHandler);
  app.get('/runners/events', streamRunnersHandler);
  app.get('/runners/downloads', getRunnerDownloadsHandler);
  app.get('/runners/downloads/:platform', downloadRunnerPackageHandler);
  app.post('/runner-approvals/:requestId/decision', { preHandler: requireJsonBody }, decideRunnerApprovalHandler);
  app.get('/runners/approval-grants', listRunnerApprovalGrantsHandler);
  app.delete('/runners/approval-grants/:grantId', revokeRunnerApprovalGrantHandler);
  app.post('/runners/token', issueRunnerTokenHandler);
  app.post('/runners/token/rotate', rotateRunnerTokenHandler);
  app.post('/runners/:runnerId/fs/roots', listRunnerRootsHandler);
  app.post('/runners/:runnerId/fs/list', { preHandler: requireJsonBody }, listRunnerDirectoryHandler);
  app.post('/sessions/:sessionId/runner-binding', { preHandler: requireJsonBody }, bindSessionRunnerHandler);
}

async function listRunnersHandler(request: FastifyRequest, reply: FastifyReply) {
  const runners = await request.server.services.runnerRegistryService.listRunners(request.auth.userId);
  return sendSuccess(reply, { runners: runners.map(toRunnerView) });
}

async function deleteRunnerHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(runnerParamsSchema, request.params, 'params');
  await request.server.services.runnerRegistryService.removeRunnerForUser(request.auth.userId, params.runnerId);
  reply.status(204).send();
}

async function streamRunnersHandler(request: FastifyRequest, reply: FastifyReply) {
  const stream = createSseStream(reply);
  stream.comment(`request=${request.requestContext.requestId}`);

  let closed = false;
  let lastPayload = '';
  const publishRunners = async (force = false) => {
    const runners = await request.server.services.runnerRegistryService.listRunners(request.auth.userId);
    const payload = { runners: runners.map(toRunnerView) };
    const serialized = JSON.stringify(payload);
    if (!force && serialized === lastPayload) return;
    lastPayload = serialized;
    stream.send(payload, 'runners');
  };
  const publishError = (error: unknown) => {
    stream.send({ error: error instanceof Error ? error.message : 'Failed to stream runners' }, 'error');
  };

  try {
    await publishRunners(true);
  } catch (error) {
    publishError(error);
  }

  const timer = setInterval(() => {
    if (closed) return;
    void publishRunners().catch(publishError);
  }, 2_000);
  timer.unref?.();
  request.raw.on('close', () => {
    closed = true;
    clearInterval(timer);
  });
}

async function issueRunnerTokenHandler(request: FastifyRequest, reply: FastifyReply) {
  const issued = await request.server.services.runnerRegistrationService.issueToken(request.auth.userId);
  return sendSuccess(reply, {
    runnerToken: issued.runnerToken,
    tokenId: issued.tokenId,
    serverAddr: issued.serverAddr,
    grpcServerAddr: issued.grpcServerAddr,
    downloadUrls: issued.downloadUrls,
  }, { statusCode: 201, message: 'Created' });
}

async function rotateRunnerTokenHandler(request: FastifyRequest, reply: FastifyReply) {
  const issued = await request.server.services.runnerRegistrationService.rotateToken(request.auth.userId);
  return sendSuccess(reply, {
    runnerToken: issued.runnerToken,
    tokenId: issued.tokenId,
    serverAddr: issued.serverAddr,
    grpcServerAddr: issued.grpcServerAddr,
    downloadUrls: issued.downloadUrls,
  });
}

async function bindSessionRunnerHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(runnerBindingParamsSchema, request.params, 'params');
  const body = parseWithSchema(runnerBindingBodySchema, request.body, 'body');
  const runner = await request.server.services.runnerRegistryService.getRunnerForUser(
    request.auth.userId,
    body.runnerId,
  );
  if (runner.status !== 'online') {
    throw new AppError(409, 'RUNNER_OFFLINE', `Runner is offline: ${runner.runnerId}`);
  }
  const boundRunnerId = await request.server.services.sessionService.bindRunner(
    params.sessionId,
    runner.runnerId,
    request.auth.userId,
  );
  return sendSuccess(reply, { sessionId: params.sessionId, runnerId: boundRunnerId });
}

async function getRunnerDownloadsHandler(request: FastifyRequest, reply: FastifyReply) {
  const urls = request.server.services.runnerRegistrationService.getDownloadUrls();
  return sendSuccess(reply, { downloadUrls: urls });
}

async function downloadRunnerPackageHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(runnerDownloadPlatformParamsSchema, request.params, 'params');
  const result = await request.server.services.runnerPackageService.buildDownload(
    params.platform,
    request.auth.userId,
  );
  reply
    .header('Content-Type', 'application/zip')
    .header('Content-Disposition', `attachment; filename="${result.fileName}"`)
    .header('Cache-Control', 'no-store')
    .header('Content-Length', String(result.buffer.byteLength));
  return reply.send(result.buffer);
}

async function decideRunnerApprovalHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(runnerApprovalDecisionParamsSchema, request.params, 'params');
  const body = parseWithSchema(runnerApprovalDecisionBodySchema, request.body, 'body');
  const result = await request.server.services.runnerApprovalService.decidePending({
    ownerUserId: request.auth.userId,
    requestId: params.requestId,
    decision: body.decision,
  });
  return sendSuccess(reply, result);
}

async function listRunnerApprovalGrantsHandler(request: FastifyRequest, reply: FastifyReply) {
  const grants = await request.server.services.runnerApprovalService.listPersistentGrants(request.auth.userId);
  return sendSuccess(reply, { grants });
}

async function revokeRunnerApprovalGrantHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(runnerApprovalGrantParamsSchema, request.params, 'params');
  await request.server.services.runnerApprovalService.revokePersistentGrant(request.auth.userId, params.grantId);
  reply.status(204).send();
}

async function listRunnerRootsHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(runnerParamsSchema, request.params, 'params');
  const result = await request.server.services.runnerDirectoryService.listRoots({
    ownerUserId: request.auth.userId,
    runnerId: params.runnerId,
  });
  return sendSuccess(reply, result);
}

async function listRunnerDirectoryHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(runnerParamsSchema, request.params, 'params');
  const body = parseWithSchema(runnerFsListBodySchema, request.body ?? {}, 'body');
  const result = await request.server.services.runnerDirectoryService.listDirectory({
    ownerUserId: request.auth.userId,
    runnerId: params.runnerId,
    path: body.path,
    includeHidden: body.includeHidden,
  });
  return sendSuccess(reply, result);
}

function toRunnerView(runner: {
  runnerId: string;
  ownerUserId: string;
  tokenId: string | null;
  kind: string;
  status: string;
  host: string | null;
  hostName: string | null;
  hostIp: string | null;
  version: string | null;
  capabilities: string[];
  os: string | null;
  arch: string | null;
  defaultShell: string | null;
  pathSeparator: string | null;
  lineEnding: string | null;
  workspaceRoots: string[];
  availableCommands: string[];
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    runnerId: runner.runnerId,
    ownerUserId: runner.ownerUserId,
    tokenId: runner.tokenId,
    kind: runner.kind,
    status: runner.status,
    host: runner.host,
    hostName: runner.hostName,
    hostIp: runner.hostIp,
    version: runner.version,
    capabilities: runner.capabilities,
    platform: {
      os: runner.os ?? undefined,
      arch: runner.arch ?? undefined,
      defaultShell: runner.defaultShell ?? undefined,
      pathSeparator: runner.pathSeparator ?? undefined,
      lineEnding: runner.lineEnding ?? undefined,
      workspaceRoots: runner.workspaceRoots ?? [],
      availableCommands: runner.availableCommands ?? [],
    },
    lastSeenAt: runner.lastSeenAt?.toISOString() ?? null,
    createdAt: runner.createdAt.toISOString(),
    updatedAt: runner.updatedAt.toISOString(),
  };
}
