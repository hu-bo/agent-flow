import type { FastifyInstance } from 'fastify';
import {
  bindSessionRunnerHandler,
  deleteRunnerHandler,
  getRunnerDownloadsHandler,
  issueRunnerApprovalTicketHandler,
  issueRunnerTokenHandler,
  listRunnerDirectoryHandler,
  listRunnerRootsHandler,
  listRunnersHandler,
  streamRunnersHandler,
  rotateRunnerTokenHandler,
} from '../handlers/runner-handlers.js';
import { requireJsonBody } from '../middlewares/require-json.js';

export async function registerRunnerRoutes(app: FastifyInstance) {
  app.get('/runners', listRunnersHandler);
  app.delete('/runners/:runner_id', deleteRunnerHandler);
  app.get('/runners/events', streamRunnersHandler);
  app.get('/runners/downloads', getRunnerDownloadsHandler);
  app.post('/runners/approval-ticket', { preHandler: requireJsonBody }, issueRunnerApprovalTicketHandler);
  app.post('/runners/token', issueRunnerTokenHandler);
  app.post('/runners/token/rotate', rotateRunnerTokenHandler);
  app.post('/runners/:runner_id/fs/roots', listRunnerRootsHandler);
  app.post('/runners/:runner_id/fs/list', { preHandler: requireJsonBody }, listRunnerDirectoryHandler);
  app.post('/sessions/:session_id/runner-binding', { preHandler: requireJsonBody }, bindSessionRunnerHandler);
}
