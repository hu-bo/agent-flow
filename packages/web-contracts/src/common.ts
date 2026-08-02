import { z } from 'zod';

export const sessionIdSchema = z.string().trim().min(1);
export const projectIdSchema = z.string().uuid();
export const runnerIdSchema = z.string().trim().min(1).max(128);
export const taskIdSchema = z.string().trim().min(1);
export const modelIdSchema = z.coerce.number().int().positive();
export const messageIdSchema = z.union([
  z.string().regex(/^[a-f0-9]{16}$/i, 'messageId must be 16 hex chars'),
  z.string().uuid(),
]);
export const turnIdSchema = z.string().regex(/^[a-f0-9]{16}$/i, 'turnId must be 16 hex chars');
export const isoDateTimeSchema = z.string().datetime({ offset: true });
export const reasoningEffortSchema = z.enum(['low', 'medium', 'high']);
export const sessionModeSchema = z.enum(['vibe', 'spec']);
export const specWorkflowPhaseSchema = z.enum(['requirements', 'design', 'tasks']);
export const taskStatusSchema = z.enum([
  'pending',
  'running',
  'paused',
  'completed',
  'failed',
  'cancelled',
]);
export const taskActionSchema = z.enum(['pause', 'resume', 'cancel', 'retry']);

export type ReasoningEffort = z.infer<typeof reasoningEffortSchema>;
export type SessionMode = z.infer<typeof sessionModeSchema>;
export type SpecWorkflowPhase = z.infer<typeof specWorkflowPhaseSchema>;
export type SpecDocType = SpecWorkflowPhase;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskAction = z.infer<typeof taskActionSchema>;

