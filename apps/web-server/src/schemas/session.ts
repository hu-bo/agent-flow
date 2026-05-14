import { z } from 'zod';
import {
  isoDateTimeSchema,
  modelIdSchema,
  sessionIdSchema,
  sessionModeSchema,
  specWorkflowPhaseSchema,
} from './common.js';

export const sessionParamsSchema = z.object({
  sessionId: sessionIdSchema,
});

export const sessionRecordSchema = z.object({
  sessionId: sessionIdSchema,
  projectId: z.string().uuid().optional(),
  title: z.string().optional(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
  modelId: modelIdSchema,
  mode: sessionModeSchema,
  cwd: z.string(),
  messageCount: z.number().int().min(0),
  systemPrompt: z.string().optional(),
  latestCheckpointId: z.string().optional(),
  boundRunnerId: z.string().optional(),
  specWorkflow: z
    .object({
      phase: specWorkflowPhaseSchema,
      awaitingConfirm: z.boolean(),
      requirementsMsgId: z.string().optional(),
      designMsgId: z.string().optional(),
      taskListMsgId: z.string().optional(),
    })
    .optional(),
});

export const createSessionBodySchema = z.object({
  modelId: modelIdSchema.optional(),
  mode: sessionModeSchema.optional().default('vibe'),
  title: z.string().trim().min(1).max(16_000).optional(),
  systemPrompt: z.string().trim().min(1).max(16_000).optional(),
  cwd: z.string().trim().min(1).optional(),
  projectId: z.string().uuid().optional(),
});
