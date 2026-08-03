import { z } from 'zod';
import { isoDateTimeSchema, projectIdSchema, runnerIdSchema } from './common.js';
import { sessionRecordSchema } from './sessions.js';
export const projectRecordSchema = z.object({
    projectId: projectIdSchema,
    name: z.string(),
    rootPath: z.string(),
    defaultRunnerId: runnerIdSchema.nullable(),
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
    chatCount: z.number().int().min(0),
    latestSession: sessionRecordSchema.optional(),
});
export const projectParamsSchema = z.object({ projectId: projectIdSchema });
export const createProjectBodySchema = z.object({
    name: z.string().trim().min(1).max(255).optional(),
    rootPath: z.string().trim().min(1).max(2048),
    runnerId: runnerIdSchema,
});
export const updateProjectBodySchema = z.object({
    name: z.string().trim().min(1).max(255).optional(),
    rootPath: z.string().trim().min(1).max(2048).optional(),
    defaultRunnerId: runnerIdSchema.optional(),
});
