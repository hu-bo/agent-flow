import { z } from 'zod';
import { sessionIdSchema, specWorkflowPhaseSchema } from './common.js';

export const specSessionParamsSchema = z.object({
  session_id: sessionIdSchema,
});

export const specConfirmBodySchema = z.object({
  selected_artifacts: z.array(z.string().min(1)).optional(),
  action_answer: z.string().trim().min(1).optional(),
});

export const specStateSchema = z.object({
  sessionId: sessionIdSchema,
  mode: z.literal('spec'),
  specWorkflow: z.object({
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
  }),
});
