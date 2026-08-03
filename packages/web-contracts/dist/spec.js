import { z } from 'zod';
import { sessionIdSchema } from './common.js';
import { specWorkflowStateSchema } from './sessions.js';
export const specSessionParamsSchema = z.object({ sessionId: sessionIdSchema });
export const specConfirmBodySchema = z.object({
    selectedArtifacts: z.array(z.string().min(1)).optional(),
    actionAnswer: z.string().trim().min(1).optional(),
});
export const specStateSchema = z.object({
    sessionId: sessionIdSchema,
    mode: z.literal('spec'),
    specWorkflow: specWorkflowStateSchema,
});
