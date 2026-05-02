import { z } from 'zod';
import { sessionIdSchema } from './common.js';

export const runnerIdSchema = z.string().trim().min(1).max(128);

export const runnerBindingParamsSchema = z.object({
  sessionId: sessionIdSchema,
});

export const runnerParamsSchema = z.object({
  runnerId: runnerIdSchema,
});

export const runnerBindingBodySchema = z.object({
  runnerId: runnerIdSchema,
});

export const runnerApprovalTicketBodySchema = z.object({
  sessionId: sessionIdSchema,
  command: z.string().trim().min(1).max(128),
  workingDir: z.string().trim().min(1).max(1024).optional(),
  ttlSec: z.number().int().min(30).max(600).optional(),
});
