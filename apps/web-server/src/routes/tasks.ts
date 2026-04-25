import type { FastifyInstance } from 'fastify';
import {
  createTaskHandler,
  getTaskHandler,
  listTasksHandler,
  taskActionHandler,
  taskEventsHandler,
} from '../handlers/task-handlers.js';
import { requireJsonBody } from '../middlewares/require-json.js';

export async function registerTaskRoutes(app: FastifyInstance) {
  app.get('/tasks', listTasksHandler);
  app.get('/tasks/:taskId', getTaskHandler);
  app.get('/tasks/:taskId/events', taskEventsHandler);
  app.post('/tasks', { preHandler: requireJsonBody }, createTaskHandler);
  app.post('/tasks/:taskId/actions/:action', taskActionHandler);
}
