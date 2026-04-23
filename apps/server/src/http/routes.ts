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
import {
  createSession,
  deleteSession,
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
    if (
      reasoningEffortRaw &&
      reasoningEffortRaw !== 'low' &&
      reasoningEffortRaw !== 'medium' &&
      reasoningEffortRaw !== 'high'
    ) {
      throw new HttpError(400, 'reasoningEffort must be low, medium, or high', 'VALIDATION_ERROR');
    }
    const reasoningEffort = reasoningEffortRaw as 'low' | 'medium' | 'high' | undefined;

    if (!stream) {
      const messages = [];
      for await (const msg of runChat(runtime, { message, model, reasoningEffort, sessionId })) {
        messages.push(msg);
      }
      return c.json({ messages });
    }

    return createSseResponse(
      c,
      async (sse) => {
        for await (const msg of runChat(runtime, { message, model, reasoningEffort, sessionId })) {
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

  api.get('/sessions', (c) => {
    return c.json({ sessions: listSessions(runtime) });
  });

  api.post('/sessions', async (c) => {
    const body = await parseJsonBody(c);
    const modelId = optionalString(body, 'modelId') ?? optionalString(body, 'model');
    const systemPrompt = optionalString(body, 'systemPrompt', { trim: false });
    const session = createSession(runtime, { modelId, systemPrompt });
    return c.json({ session }, 201);
  });

  api.get('/sessions/:id', (c) => {
    const session = loadSession(runtime, c.req.param('id'));
    return c.json({ session: session.info, messages: session.messages });
  });

  api.delete('/sessions/:id', (c) => {
    deleteSession(runtime, c.req.param('id'));
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

    const result = await compactSession(runtime, { sessionId, trigger });
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
