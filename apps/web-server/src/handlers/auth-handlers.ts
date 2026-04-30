import type { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../lib/response.js';
import { parseWithSchema } from '../lib/validation.js';
import { oauthUrlBodySchema, tokenExchangeBodySchema, tokenRefreshBodySchema } from '../schemas/auth.js';

type AppAuthRequest = FastifyRequest<{
  Params: {
    appName: string;
  };
}>;

export async function authorizeUrlHandler(request: AppAuthRequest, reply: FastifyReply) {
  const body = parseWithSchema(oauthUrlBodySchema, request.body, 'body');
  const result = await request.server.services.authService.createAuthorizeUrl({
    appName: request.params.appName,
    redirectUri: body.redirect_uri,
    state: body.state,
  });
  return reply.send(result);
}

export async function signupUrlHandler(request: AppAuthRequest, reply: FastifyReply) {
  const body = parseWithSchema(oauthUrlBodySchema, request.body, 'body');
  const result = await request.server.services.authService.createSignupUrl({
    appName: request.params.appName,
    redirectUri: body.redirect_uri,
    state: body.state,
    enablePassword: body.enable_password,
  });
  return reply.send(result);
}

export async function exchangeTokenHandler(request: AppAuthRequest, reply: FastifyReply) {
  const body = parseWithSchema(tokenExchangeBodySchema, request.body, 'body');
  const result = await request.server.services.authService.exchangeCodeForToken(
    body.code,
    body.state,
    request.params.appName,
  );
  return reply.send(result);
}

export async function refreshTokenHandler(request: AppAuthRequest, reply: FastifyReply) {
  const body = parseWithSchema(tokenRefreshBodySchema, request.body, 'body');
  const token = await request.server.services.authService.refreshToken(
    body.refresh_token,
    request.params.appName,
  );
  return reply.send(token);
}

export async function getMeHandler(request: FastifyRequest, reply: FastifyReply) {
  const profile = await request.server.services.authService.getUserProfileById(request.auth.userId);
  return sendSuccess(reply, { user: profile });
}

export async function sdkGetMeHandler(request: FastifyRequest, reply: FastifyReply) {
  const authorization = request.headers.authorization;
  const tokenFromHeader = authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length).trim() : '';
  const tokenFromQuery =
    typeof request.query === 'object' &&
    request.query !== null &&
    'token' in request.query &&
    typeof request.query.token === 'string'
      ? request.query.token
      : '';
  const token = tokenFromHeader || tokenFromQuery;

  if (!token) {
    return reply.status(400).send({ error: 'token is required' });
  }

  const result = await request.server.services.authService.getMe(token);
  return reply.send(result);
}
