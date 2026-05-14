import { z } from 'zod';
import { modelIdSchema, reasoningEffortSchema, sessionIdSchema, sessionModeSchema } from './common.js';

const shortMessageIdSchema = z.string().regex(/^[a-f0-9]{16}$/i, 'msg_id must be 16 hex chars');
const legacyUuidSchema = z.string().uuid();
const messageIdSchema = z.union([shortMessageIdSchema, legacyUuidSchema]);

export const fileAttachmentSchema = z.object({
  type: z.literal('file'),
  mimeType: z.string().min(1),
  data: z.string().min(1),
});

export const createChatBodySchema = z.object({
  session_id: sessionIdSchema.optional(),
  project_id: z.string().uuid().optional(),
  mode: sessionModeSchema.optional().default('vibe'),
  message: z.string().trim().min(1),
  profile_id: z.string().trim().min(1).max(64).optional(),
  model_id: modelIdSchema.optional(),
  reasoning_effort: reasoningEffortSchema.optional(),
  attachments: z.array(fileAttachmentSchema).max(10).optional(),
  approve_risky_ops: z.boolean().optional().default(false),
  approval_ticket: z.string().trim().min(1).max(256).optional(),
  stream: z.boolean().default(false),
  background_task: z.boolean().default(false),
});

export const retryChatMessageBodySchema = z.object({
  msg_id: messageIdSchema,
  model_id: modelIdSchema.optional(),
  reasoning_effort: reasoningEffortSchema.optional(),
});

export const messageMutationParamsSchema = z.object({
  session_id: sessionIdSchema,
  msg_id: messageIdSchema,
});
