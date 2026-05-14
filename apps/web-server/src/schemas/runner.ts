import { z } from 'zod';
import { sessionIdSchema } from './common.js';

export const runnerIdSchema = z.string().trim().min(1).max(128);

export const runnerBindingParamsSchema = z.object({
  session_id: sessionIdSchema,
});

export const runnerParamsSchema = z.object({
  runner_id: runnerIdSchema,
});

export const runnerFsParamsSchema = z.object({
  runner_id: runnerIdSchema,
});

export const runnerBindingBodySchema = z.object({
  runner_id: runnerIdSchema,
});

export const runnerApprovalTicketBodySchema = z.object({
  session_id: sessionIdSchema,
  cmd: z.string().trim().min(1).max(128),
  workdir: z.string().trim().min(1).max(1024).optional(),
  ttl_sec: z.number().int().min(30).max(600).optional(),
});

export const runnerFsListBodySchema = z.object({
  path: z.string().trim().min(1).max(2048),
  includeHidden: z.boolean().optional().default(false),
});
