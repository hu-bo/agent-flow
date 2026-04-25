import { z } from 'zod';

export const sessionIdSchema = z.string().min(1);
export const taskIdSchema = z.string().min(1);
export const modelIdSchema = z.string().min(1);
export const isoDateTimeSchema = z.string().datetime({ offset: true });
export const reasoningEffortSchema = z.enum(['low', 'medium', 'high']);
export const taskStatusSchema = z.enum([
  'pending',
  'running',
  'paused',
  'completed',
  'failed',
  'cancelled',
]);
export const taskActionSchema = z.enum(['pause', 'resume', 'cancel', 'retry']);
