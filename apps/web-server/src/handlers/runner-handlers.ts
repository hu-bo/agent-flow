import type { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../lib/response.js';
import { createSseStream } from '../lib/sse.js';
import { parseWithSchema } from '../lib/validation.js';
import { AppError } from '../lib/errors.js';
import {
  runnerBindingBodySchema,
  runnerBindingParamsSchema,
  runnerParamsSchema,
  runnerApprovalTicketBodySchema,
} from '../schemas/runner.js';

export async function listRunnersHandler(request: FastifyRequest, reply: FastifyReply) {
  const runners = await request.server.services.runnerRegistryService.listRunners(request.auth.userId);
  return sendSuccess(reply, {
    runners: runners.map(toRunnerView),
  });
}

export async function deleteRunnerHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(runnerParamsSchema, request.params, 'params');
  await request.server.services.runnerRegistryService.removeRunnerForUser(request.auth.userId, params.runnerId);
  reply.status(204).send();
}

export async function streamRunnersHandler(request: FastifyRequest, reply: FastifyReply) {
  const stream = createSseStream(reply);
  stream.comment(`request=${request.requestContext.requestId}`);

  let closed = false;
  let lastPayload = '';

  const publishRunners = async (force = false) => {
    const runners = await request.server.services.runnerRegistryService.listRunners(request.auth.userId);
    const payload = {
      runners: runners.map(toRunnerView),
    };
    const serialized = JSON.stringify(payload);
    if (!force && serialized === lastPayload) {
      return;
    }
    lastPayload = serialized;
    stream.send(payload, 'runners');
  };

  const publishError = (error: unknown) => {
    const message = error instanceof Error ? error.message : 'Failed to stream runners';
    stream.send({ error: message }, 'error');
  };

  try {
    await publishRunners(true);
  } catch (error) {
    publishError(error);
  }

  const timer = setInterval(() => {
    if (closed) return;
    void publishRunners().catch((error) => {
      publishError(error);
    });
  }, 2_000);
  timer.unref?.();

  request.raw.on('close', () => {
    closed = true;
    clearInterval(timer);
  });
}

export async function issueRunnerTokenHandler(request: FastifyRequest, reply: FastifyReply) {
  const issued = await request.server.services.runnerRegistrationService.issueToken(request.auth.userId);
  return sendSuccess(
    reply,
    {
      runnerToken: issued.runnerToken,
      tokenId: issued.tokenId,
      serverAddr: issued.serverAddr,
      grpcServerAddr: issued.grpcServerAddr,
      downloadUrls: issued.downloadUrls,
    },
    { statusCode: 201, message: 'Created' },
  );
}

export async function rotateRunnerTokenHandler(request: FastifyRequest, reply: FastifyReply) {
  const issued = await request.server.services.runnerRegistrationService.rotateToken(request.auth.userId);
  return sendSuccess(reply, {
    runnerToken: issued.runnerToken,
    tokenId: issued.tokenId,
    serverAddr: issued.serverAddr,
    grpcServerAddr: issued.grpcServerAddr,
    downloadUrls: issued.downloadUrls,
  });
}

export async function bindSessionRunnerHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(runnerBindingParamsSchema, request.params, 'params');
  const body = parseWithSchema(runnerBindingBodySchema, request.body, 'body');

  const runner = await request.server.services.runnerRegistryService.getRunnerForUser(
    request.auth.userId,
    body.runnerId,
  );
  if (runner.status !== 'online') {
    throw new AppError(409, 'RUNNER_OFFLINE', `Runner is offline: ${runner.runnerId}`);
  }
  const boundRunnerId = request.server.services.sessionService.bindRunner(params.sessionId, runner.runnerId);

  return sendSuccess(reply, {
    sessionId: params.sessionId,
    runnerId: boundRunnerId,
  });
}

export async function getRunnerDownloadsHandler(request: FastifyRequest, reply: FastifyReply) {
  const urls = request.server.services.runnerRegistrationService.getDownloadUrls();
  return sendSuccess(reply, {
    downloadUrls: urls,
  });
}

export async function issueRunnerApprovalTicketHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = parseWithSchema(runnerApprovalTicketBodySchema, request.body, 'body');
  const session = request.server.services.sessionService.getSession(body.sessionId);
  const issued = request.server.services.runnerApprovalService.issue({
    ownerUserId: request.auth.userId,
    sessionId: body.sessionId,
    command: body.command,
    workingDir: body.workingDir ?? session.cwd,
    ttlSec: body.ttlSec,
  });
  return sendSuccess(reply, issued, { statusCode: 201, message: 'Created' });
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
    lastSeenAt: runner.lastSeenAt?.toISOString() ?? null,
    createdAt: runner.createdAt.toISOString(),
    updatedAt: runner.updatedAt.toISOString(),
  };
}
