import { z } from 'zod';
import { modelIdSchema } from './common.js';

const providerStatusSchema = z.enum(['active', 'disabled']);
const providerCredentialStatusSchema = z.enum(['active', 'disabled']);
const providerModelStatusSchema = z.enum(['active', 'disabled']);
const modelProfileStatusSchema = z.enum(['active', 'disabled']);
const routingPolicyStatusSchema = z.enum(['active', 'disabled']);

const jsonObjectSchema = z.record(z.string(), z.unknown());

export const providerParamsSchema = z.object({
  providerId: z.coerce.number().int().positive(),
});

export const createProviderBodySchema = z.object({
  name: z.string().trim().min(1).max(64),
  type: z.string().trim().min(1).max(64),
  status: providerStatusSchema.optional(),
  metadata: jsonObjectSchema.nullable().optional(),
});

export const updateProviderBodySchema = z.object({
  status: providerStatusSchema,
});

export const createProviderCredentialBodySchema = z.object({
  secretRef: z.string().trim().min(1).max(255),
  keyVersion: z.number().int().min(1).max(10_000).optional(),
  status: providerCredentialStatusSchema.optional(),
});

export const listAdminModelsQuerySchema = z.object({
  provider: z.string().trim().min(1).max(64).optional(),
});

export const modelParamsSchema = z.object({
  modelId: modelIdSchema,
});

export const createAdminModelBodySchema = z.object({
  modelId: modelIdSchema,
  displayName: z.string().trim().min(1).max(128),
  providerId: z.number().int().positive(),
  tokenLimit: z.number().int().positive().max(2_000_000),
  status: providerModelStatusSchema.optional(),
});

export const updateAdminModelBodySchema = z
  .object({
    displayName: z.string().trim().min(1).max(128).optional(),
    providerId: z.number().int().positive().optional(),
    tokenLimit: z.number().int().positive().max(2_000_000).optional(),
    status: providerModelStatusSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const modelProfileParamsSchema = z.object({
  profileId: z.string().trim().min(1).max(64),
});

export const createModelProfileBodySchema = z.object({
  profileId: z.string().trim().min(1).max(64),
  displayName: z.string().trim().min(1).max(128),
  intentTags: z.array(z.string().trim().min(1).max(64)).max(64).optional(),
  sla: jsonObjectSchema.nullable().optional(),
  status: modelProfileStatusSchema.optional(),
});

export const updateModelProfileBodySchema = z
  .object({
    displayName: z.string().trim().min(1).max(128).optional(),
    intentTags: z.array(z.string().trim().min(1).max(64)).max(64).optional(),
    sla: jsonObjectSchema.nullable().optional(),
    status: modelProfileStatusSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const upsertRoutingPolicyBodySchema = z.object({
  policyId: z.string().trim().min(1).max(64).optional(),
  primaryModelId: modelIdSchema,
  fallbacks: z.array(modelIdSchema).max(64).optional(),
  strategy: z.string().trim().min(1).max(32).optional(),
  status: routingPolicyStatusSchema.optional(),
});

export const listAuditLogsQuerySchema = z.object({
  actor: z.string().trim().min(1).max(128).optional(),
  action: z.string().trim().min(1).max(128).optional(),
  resource: z.string().trim().min(1).max(128).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});
