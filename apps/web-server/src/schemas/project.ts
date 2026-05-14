import { z } from 'zod';
import { runnerIdSchema } from './runner.js';

export const projectIdSchema = z.string().uuid();

export const projectParamsSchema = z.object({
  projectId: projectIdSchema,
});

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
