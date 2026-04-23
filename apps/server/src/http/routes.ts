import { Hono } from 'hono';
import { HttpError } from '../errors.js';
import type { ServerRuntime } from '../runtime.js';
import {
  optionalBoolean,
  optionalString,
  parseJsonBody,
  requiredString,
} from './validation.js';
import { runChat } from '../services/chat-service.js';
import { compactSession } from '../services/compact-service.js';
import { createTask, getTask } from '../services/task-service.js';
import type { SessionPrincipal } from '../services/session-service.js';
import {
  createSession,
  deleteSession,
  listSessionMessages,
  loadSession,
  listSessions,
} from '../services/session-service.js';
import { getHealth, getModels, switchModel } from '../services/model-service.js';
import { createSseResponse } from '../transport/sse.js';

export function createApiRoutes(runtime: ServerRuntime): Hono {
  const api = new Hono();

  api.get('/health', (c) => {
    return c.json(getHealth(runtime));
  });

  api.post('/chat', async (c) => {
    const body = await parseJsonBody(c);
    const message = requiredString(body, 'message');
    const model = optionalString(body, 'model');
    const reasoningEffortRaw = optionalString(body, 'reasoningEffort');
    const sessionId = optionalString(body, 'sessionId');
    const stream = optionalBoolean(body, 'stream') ?? false;
    const principal = resolvePrincipal(c);
    const reasoningEffort = parseReasoningEffort(reasoningEffortRaw);

    if (!stream) {
      const messages = [];
      for await (const msg of runChat(runtime, {
        message,
        model,
        reasoningEffort,
        sessionId,
        principal: sessionId ? principal : undefined,
      })) {
        messages.push(msg);
      }
      return c.json({ messages });
    }

    return createSseResponse(
      c,
      async (sse) => {
        for await (const msg of runChat(runtime, {
          message,
          model,
          reasoningEffort,
          sessionId,
          principal: sessionId ? principal : undefined,
        })) {
          if (sse.isClosed()) break;
          const sent = await sse.sendJson(msg);
          if (!sent) break;
        }
        await sse.sendDone();
      },
      {
        heartbeatMs: 12_000,
        retryMs: 3_000,
      },
    );
  });

  api.get('/sessions', async (c) => {
    const principal = resolvePrincipal(c);
    const userId = c.req.query('user_id')?.trim() || principal.userId;
    const limit = parsePositiveInt(c.req.query('limit'));
    const offset = parseNonNegativeInt(c.req.query('offset'));
    const sessions = await listSessions(runtime, { userId, limit, offset });
    return c.json({ sessions });
  });

  api.post('/sessions', async (c) => {
    const body = await parseJsonBody(c);
    const principal = resolvePrincipal(c);
    const modelId = optionalString(body, 'modelId') ?? optionalString(body, 'model');
    const title = optionalString(body, 'title', { trim: false });
    const systemPrompt = optionalString(body, 'systemPrompt', { trim: false });
    const session = await createSession(runtime, { principal, modelId, title, systemPrompt });
    return c.json({ session }, 201);
  });

  api.get('/sessions/:id', async (c) => {
    const principal = resolvePrincipal(c);
    const session = await loadSession(runtime, principal, c.req.param('id'));
    return c.json({ session: session.metadata, messages: session.messages });
  });

  api.get('/sessions/:id/messages', async (c) => {
    const principal = resolvePrincipal(c);
    const afterUuid = c.req.query('after')?.trim();
    const limit = parsePositiveInt(c.req.query('limit'));
    const messages = await listSessionMessages(runtime, {
      sessionId: c.req.param('id'),
      principal,
      afterUuid,
      limit,
    });
    return c.json({ messages });
  });

  api.post('/sessions/:id/chat', async (c) => {
    const body = await parseJsonBody(c);
    const principal = resolvePrincipal(c);
    const message = requiredString(body, 'message');
    const model = optionalString(body, 'model');
    const stream = optionalBoolean(body, 'stream') ?? true;
    const reasoningEffortRaw = optionalString(body, 'reasoningEffort');
    const reasoningEffort = parseReasoningEffort(reasoningEffortRaw);
    const sessionId = c.req.param('id');

    if (!stream) {
      const messages = [];
      for await (const msg of runChat(runtime, {
        message,
        model,
        reasoningEffort,
        sessionId,
        principal,
      })) {
        messages.push(msg);
      }
      return c.json({ messages });
    }

    return createSseResponse(
      c,
      async (sse) => {
        for await (const msg of runChat(runtime, {
          message,
          model,
          reasoningEffort,
          sessionId,
          principal,
        })) {
          if (sse.isClosed()) break;
          const sent = await sse.sendJson(msg);
          if (!sent) break;
        }
        await sse.sendDone();
      },
      {
        heartbeatMs: 12_000,
        retryMs: 3_000,
      },
    );
  });

  api.delete('/sessions/:id', async (c) => {
    const principal = resolvePrincipal(c);
    await deleteSession(runtime, principal, c.req.param('id'));
    return c.newResponse(null, 204);
  });

  api.post('/tasks', async (c) => {
    const body = await parseJsonBody(c);
    const message = optionalString(body, 'message') ?? optionalString(body, 'prompt');
    if (!message) {
      throw new HttpError(400, 'message is required', 'VALIDATION_ERROR');
    }

    const model = optionalString(body, 'model');
    const state = createTask(runtime, { message, model });
    return c.json({ taskId: state.taskId, status: state.status }, 202);
  });

  api.get('/tasks/:id', (c) => {
    const state = getTask(runtime, c.req.param('id'));
    if (!state) {
      throw new HttpError(404, 'Task not found', 'TASK_NOT_FOUND');
    }
    return c.json(state);
  });

  api.post('/compact', async (c) => {
    const body = await parseJsonBody(c);
    const sessionId = requiredString(body, 'sessionId');
    const trigger = optionalString(body, 'trigger') as 'manual' | 'auto' | undefined;

    if (trigger && trigger !== 'manual' && trigger !== 'auto') {
      throw new HttpError(400, 'trigger must be manual or auto', 'VALIDATION_ERROR');
    }

    const principal = resolvePrincipal(c);
    const result = await compactSession(runtime, { sessionId, principal, trigger });
    return c.json(result);
  });

  api.post('/model', async (c) => {
    const body = await parseJsonBody(c);
    const modelId = requiredString(body, 'modelId');
    return c.json(switchModel(runtime, modelId));
  });

  api.get('/models', (c) => {
    return c.json(getModels(runtime));
  });

  return api;
}

function resolvePrincipal(c: { req: { header: (name: string) => string | undefined } }): SessionPrincipal {
  const userId = c.req.header('X-User-ID')?.trim() || 'anonymous';
  const deviceId = c.req.header('X-Device-ID')?.trim() || 'unknown-device';
  return { userId, deviceId };
}

function parseReasoningEffort(value?: string): 'low' | 'medium' | 'high' | undefined {
  if (!value) return undefined;
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value;
  }
  throw new HttpError(400, 'reasoningEffort must be low, medium, or high', 'VALIDATION_ERROR');
}

function parsePositiveInt(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new HttpError(400, 'query parameter must be a positive integer', 'VALIDATION_ERROR');
  }
  return parsed;
}

function parseNonNegativeInt(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new HttpError(400, 'query parameter must be a non-negative integer', 'VALIDATION_ERROR');
  }
  return parsed;
}

