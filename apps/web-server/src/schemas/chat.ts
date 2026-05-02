import { z } from 'zod';
import { modelIdSchema, reasoningEffortSchema, sessionIdSchema } from './common.js';

export const fileAttachmentSchema = z.object({
  type: z.literal('file'),
  mimeType: z.string().min(1),
  data: z.string().min(1),
});

export const createChatBodySchema = z.object({
  sessionId: sessionIdSchema.optional(),
  message: z.string().trim().min(1),
  profileId: z.string().trim().min(1).max(64).optional(),
  model: modelIdSchema.optional(),
  reasoningEffort: reasoningEffortSchema.optional(),
  attachments: z.array(fileAttachmentSchema).max(10).optional(),
  approveRiskyOps: z.boolean().optional().default(false),
  approvalTicket: z.string().trim().min(1).max(256).optional(),
  stream: z.boolean().default(false),
  backgroundTask: z.boolean().default(false),
});

export const retryChatMessageBodySchema = z.object({
  messageId: z.string().uuid(),
  model: modelIdSchema.optional(),
  reasoningEffort: reasoningEffortSchema.optional(),
});

export const messageMutationParamsSchema = z.object({
  sessionId: sessionIdSchema,
  messageId: z.string().uuid(),
});
