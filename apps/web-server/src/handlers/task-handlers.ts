import type { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../lib/response.js';
import { createSseStream } from '../lib/sse.js';
import { parseWithSchema } from '../lib/validation.js';
import {
  createTaskBodySchema,
  taskActionParamsSchema,
  taskEventsQuerySchema,
  taskParamsSchema,
} from '../schemas/task.js';

export async function listTasksHandler(request: FastifyRequest, reply: FastifyReply) {
  return sendSuccess(reply, {
    tasks: request.server.services.taskService.listTasks(),
  });
}

export async function createTaskHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = parseWithSchema(createTaskBodySchema, request.body, 'body');
  const task = request.server.services.taskService.createTask({
    prompt: body.prompt,
    profileId: body.profileId,
    modelId: body.model,
    sessionId: body.sessionId,
    type: body.type,
    config: body.config,
    maxRetries: body.maxRetries,
  });

  return sendSuccess(reply, {
    taskId: task.taskId,
    status: task.status,
    task,
  }, { statusCode: 202, message: 'Accepted' });
}

export async function getTaskHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(taskParamsSchema, request.params, 'params');
  return sendSuccess(reply, {
    task: request.server.services.taskService.getTask(params.taskId),
  });
}

export async function taskActionHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = parseWithSchema(taskActionParamsSchema, request.params, 'params');
  const task = request.server.services.taskService.applyAction(params.taskId, params.action);
  return sendSuccess(reply, {
    task,
  });
}

export async function taskEventsHandler(request: FastifyRequest, reply: FastifyReply) {
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
}
