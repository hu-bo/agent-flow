import { z } from 'zod';
import {
  isoDateTimeSchema,
  modelIdSchema,
  sessionIdSchema,
  taskActionSchema,
  taskIdSchema,
  taskStatusSchema,
} from './common.js';

export const taskParamsSchema = z.object({
  taskId: taskIdSchema,
});

export const taskActionParamsSchema = taskParamsSchema.extend({
  action: taskActionSchema,
});

export const taskEventsQuerySchema = z.object({
  cursor: z.coerce.number().int().min(0).optional(),
});

export const taskRecordSchema = z.object({
  taskId: taskIdSchema,
  sessionId: sessionIdSchema,
  type: z.enum(['chat', 'workflow', 'compact']),
  status: taskStatusSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
  latestCheckpointId: z.string(),
  retryCount: z.number().int().min(0),
  maxRetries: z.number().int().min(0),
  modelId: modelIdSchema,
  prompt: z.string(),
  error: z.string().optional(),
  outputs: z.unknown().optional(),
});

export const createTaskBodySchema = z.object({
  prompt: z.string().trim().min(1),
  model: modelIdSchema.optional(),
  sessionId: sessionIdSchema.optional(),
  type: z.enum(['chat', 'workflow', 'compact']).default('chat'),
  config: z.record(z.string(), z.unknown()).optional(),
  maxRetries: z.number().int().min(0).max(10).optional(),
});
