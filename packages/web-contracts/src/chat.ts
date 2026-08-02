import { z } from 'zod';
import type { FilePart, TokenUsage, UnifiedMessage } from '@agent-flow/core/messages';
import {
  messageIdSchema,
  modelIdSchema,
  reasoningEffortSchema,
  sessionIdSchema,
  specWorkflowPhaseSchema,
  turnIdSchema,
} from './common.js';

export const fileAttachmentSchema = z.object({
  type: z.literal('file'),
  mimeType: z.string().min(1),
  data: z.string().min(1),
});

export const chatTurnBodySchema = z.object({
  turnId: turnIdSchema.optional(),
  message: z.string().trim().min(1),
  profileId: z.string().trim().min(1).max(64).optional(),
  modelId: modelIdSchema.optional(),
  reasoningEffort: reasoningEffortSchema.optional(),
  attachments: z.array(fileAttachmentSchema).max(10).optional(),
}).strict();

export const chatTurnParamsSchema = z.object({ sessionId: sessionIdSchema });
export const messageMutationParamsSchema = z.object({
  sessionId: sessionIdSchema,
  messageId: messageIdSchema,
});
export const retryMessageBodySchema = z.object({
  modelId: modelIdSchema.optional(),
  reasoningEffort: reasoningEffortSchema.optional(),
});

export const tokenUsageSchema = z.object({
  promptTokens: z.number().int().min(0),
  completionTokens: z.number().int().min(0),
  totalTokens: z.number().int().min(0),
  cacheReadTokens: z.number().int().min(0).optional(),
  cacheWriteTokens: z.number().int().min(0).optional(),
});

const unifiedMessageSchema = z.object({
  uuid: z.string().min(1),
  role: z.enum(['system', 'user', 'assistant', 'tool']),
  type: z.enum(['text', 'thinking', 'image', 'tool_execution']),
  timestamp: z.string(),
}).passthrough();

export const approvalRequestSchema = z.object({
  requestId: z.string().min(1),
  sessionId: sessionIdSchema,
  runnerId: z.string().min(1),
  scopeType: z.enum(['project', 'chat']),
  scopeId: z.string().min(1),
  scopeLabel: z.string().optional(),
  command: z.string().min(1),
  workingDir: z.string(),
  risk: z.enum(['low', 'medium', 'high']),
  reason: z.string().optional(),
});

export const chatStreamEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('message.upsert'), message: unifiedMessageSchema }),
  z.object({
    type: z.literal('message.delta'),
    messageId: z.string().min(1),
    delta: z.string(),
    turnId: z.string().optional(),
  }),
  z.object({
    type: z.literal('spec.document'),
    messageId: z.string().min(1),
    docType: specWorkflowPhaseSchema,
    content: z.string(),
    delta: z.string().optional(),
    done: z.boolean(),
  }),
  z.object({ type: z.literal('approval.requested'), approval: approvalRequestSchema }),
  z.object({
    type: z.literal('approval.resolved'),
    requestId: z.string().min(1),
    decision: z.enum(['once', 'always', 'deny']),
    approved: z.boolean(),
    reason: z.string().optional(),
  }),
  z.object({ type: z.literal('usage'), usageByMessageId: z.record(z.string(), tokenUsageSchema) }),
  z.object({
    type: z.literal('error'),
    error: z.object({ code: z.string().min(1), message: z.string().min(1), details: z.unknown().optional() }),
  }),
  z.object({ type: z.literal('done') }),
]);

export type ChatTurnBody = z.infer<typeof chatTurnBodySchema> & { attachments?: FilePart[] };
export type ApprovalRequest = z.infer<typeof approvalRequestSchema>;
export type ChatStreamEvent =
  | { type: 'message.upsert'; message: UnifiedMessage }
  | { type: 'message.delta'; messageId: string; delta: string; turnId?: string }
  | { type: 'spec.document'; messageId: string; docType: z.infer<typeof specWorkflowPhaseSchema>; content: string; delta?: string; done: boolean }
  | { type: 'approval.requested'; approval: ApprovalRequest }
  | { type: 'approval.resolved'; requestId: string; decision: 'once' | 'always' | 'deny'; approved: boolean; reason?: string }
  | { type: 'usage'; usageByMessageId: Record<string, TokenUsage> }
  | { type: 'error'; error: { code: string; message: string; details?: unknown } }
  | { type: 'done' };
