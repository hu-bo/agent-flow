import { z } from 'zod';
import { isoDateTimeSchema, modelIdSchema, sessionIdSchema } from './common.js';

export const sessionParamsSchema = z.object({
  sessionId: sessionIdSchema,
});

export const sessionRecordSchema = z.object({
  sessionId: sessionIdSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
  modelId: modelIdSchema,
  cwd: z.string(),
  messageCount: z.number().int().min(0),
  systemPrompt: z.string().optional(),
  latestCheckpointId: z.string().optional(),
});

export const createSessionBodySchema = z.object({
  modelId: modelIdSchema.optional(),
  systemPrompt: z.string().trim().min(1).max(16_000).optional(),
  cwd: z.string().trim().min(1).optional(),
});
