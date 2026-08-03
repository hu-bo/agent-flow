import { z } from 'zod';
import { isoDateTimeSchema, modelIdSchema, projectIdSchema, runnerIdSchema, sessionIdSchema, sessionModeSchema, specWorkflowPhaseSchema, } from './common.js';
export const specWorkflowStateSchema = z.object({
    phase: specWorkflowPhaseSchema,
    awaitingConfirm: z.boolean(),
    requirementsMsgId: z.string().optional(),
    designMsgId: z.string().optional(),
    taskListMsgId: z.string().optional(),
    documents: z.object({
        requirements: z.string().optional(),
        design: z.string().optional(),
        tasks: z.string().optional(),
    }).optional(),
});
export const sessionRecordSchema = z.object({
    sessionId: sessionIdSchema,
    projectId: projectIdSchema.nullable(),
    title: z.string().optional(),
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
    modelId: modelIdSchema,
    mode: sessionModeSchema,
    cwd: z.string(),
    messageCount: z.number().int().min(0),
    systemPrompt: z.string().optional(),
    latestCheckpointId: z.string().optional(),
    boundRunnerId: runnerIdSchema.optional(),
    specWorkflow: specWorkflowStateSchema.optional(),
});
export const sessionParamsSchema = z.object({ sessionId: sessionIdSchema });
export const createSessionBodySchema = z.object({
    modelId: modelIdSchema.optional(),
    mode: sessionModeSchema.optional().default('vibe'),
    title: z.string().trim().min(1).max(16_000).optional(),
    systemPrompt: z.string().trim().min(1).max(16_000).optional(),
    cwd: z.string().trim().min(1).optional(),
    projectId: projectIdSchema.optional(),
});
//# sourceMappingURL=sessions.js.map