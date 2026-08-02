import type { FastifyInstance } from 'fastify';
import {
  createTaskBodySchema,
  taskActionParamsSchema,
  taskEventsQuerySchema,
  taskParamsSchema,
} from '@agent-flow/web-contracts';
import { sendSuccess } from '../lib/response.js';
import { createSseStream } from '../lib/sse.js';
import { parseWithSchema } from '../lib/validation.js';
import { requireJsonBody } from '../middlewares/require-json.js';

export async function registerTaskRoutes(app: FastifyInstance) {
  app.get('/tasks', async (request, reply) => sendSuccess(reply, {
    tasks: request.server.services.taskService.listTasks(),
  }));

  app.get('/tasks/:taskId', async (request, reply) => {
    const params = parseWithSchema(taskParamsSchema, request.params, 'params');
    return sendSuccess(reply, { task: request.server.services.taskService.getTask(params.taskId) });
  });

  app.get('/tasks/:taskId/events', async (request, reply) => {
    const params = parseWithSchema(taskParamsSchema, request.params, 'params');
    const query = parseWithSchema(taskEventsQuerySchema, request.query ?? {}, 'query');
    const stream = createSseStream(reply);
    for (const event of request.server.services.taskService.getTaskEvents(params.taskId, query.cursor)) {
      stream.send(event, 'task');
    }
    const unsubscribe = request.server.services.taskService.subscribe(params.taskId, (event) => {
      stream.send(event, 'task');
    });
    request.raw.on('close', unsubscribe);
  });

  app.post('/tasks', { preHandler: requireJsonBody }, async (request, reply) => {
    const body = parseWithSchema(createTaskBodySchema, request.body, 'body');
    const task = await request.server.services.taskService.createTask({
      ownerUserId: request.auth.userId,
      prompt: body.prompt,
      profileId: body.profileId,
      modelId: body.modelId,
      sessionId: body.sessionId,
      projectId: body.projectId,
      type: body.type,
      config: body.config,
      maxRetries: body.maxRetries,
    });
    return sendSuccess(reply, { taskId: task.taskId, status: task.status, task }, { statusCode: 202 });
  });

  app.post('/tasks/:taskId/actions/:action', async (request, reply) => {
    const params = parseWithSchema(taskActionParamsSchema, request.params, 'params');
    return sendSuccess(reply, {
      task: request.server.services.taskService.applyAction(params.taskId, params.action),
    });
  });
}
