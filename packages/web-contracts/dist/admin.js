import { z } from 'zod';
import { isoDateTimeSchema, modelIdSchema } from './common.js';
const activeStatusSchema = z.enum(['active', 'disabled']);
const jsonObjectSchema = z.record(z.string(), z.unknown());
const providerModelNameSchema = z.string().trim().min(1).max(128);
export const providerParamsSchema = z.object({ providerId: z.coerce.number().int().positive() });
export const createProviderBodySchema = z.object({
    name: z.string().trim().min(1).max(64),
    type: z.string().trim().min(1).max(64),
    status: activeStatusSchema.optional(),
    metadata: jsonObjectSchema.nullable().optional(),
});
export const updateProviderBodySchema = z.object({ status: activeStatusSchema });
export const createProviderCredentialBodySchema = z.object({
    secretRef: z.string().trim().min(1).max(255),
    keyVersion: z.number().int().min(1).max(10_000).optional(),
    status: activeStatusSchema.optional(),
});
export const listAdminModelsQuerySchema = z.object({ provider: z.string().trim().min(1).max(64).optional() });
export const modelParamsSchema = z.object({ modelId: modelIdSchema });
export const createAdminModelBodySchema = z.object({
    model: providerModelNameSchema,
    displayName: z.string().trim().min(1).max(128),
    providerId: z.number().int().positive(),
    tokenLimit: z.number().int().positive().max(2_000_000),
    status: activeStatusSchema.optional(),
});
export const updateAdminModelBodySchema = createAdminModelBodySchema.partial().refine((value) => Object.keys(value).length > 0, { message: 'At least one field is required' });
export const modelProfileParamsSchema = z.object({ profileId: z.string().trim().min(1).max(64) });
export const createModelProfileBodySchema = z.object({
    profileId: z.string().trim().min(1).max(64),
    displayName: z.string().trim().min(1).max(128),
    intentTags: z.array(z.string().trim().min(1).max(64)).max(64).optional(),
    sla: jsonObjectSchema.nullable().optional(),
    status: activeStatusSchema.optional(),
});
export const updateModelProfileBodySchema = createModelProfileBodySchema.omit({ profileId: true }).partial().refine((value) => Object.keys(value).length > 0, { message: 'At least one field is required' });
export const upsertRoutingPolicyBodySchema = z.object({
    policyId: z.string().trim().min(1).max(64).optional(),
    primaryModelId: modelIdSchema,
    fallbacks: z.array(modelIdSchema).max(64).optional(),
    strategy: z.string().trim().min(1).max(32).optional(),
    status: activeStatusSchema.optional(),
});
export const listAuditLogsQuerySchema = z.object({
    actor: z.string().trim().min(1).max(128).optional(),
    action: z.string().trim().min(1).max(128).optional(),
    resource: z.string().trim().min(1).max(128).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
});
export const providerRecordSchema = z.object({
    providerId: z.number().int().positive(),
    name: z.string(),
    type: z.string(),
    status: activeStatusSchema,
    metadata: jsonObjectSchema.nullable(),
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
    activeModelCount: z.number().int().min(0),
    credentialCount: z.number().int().min(0),
});
export const providerCredentialRecordSchema = z.object({
    credentialId: z.string().min(1),
    providerId: z.number().int().positive(),
    secretRef: z.string(),
    keyVersion: z.number().int().positive(),
    status: activeStatusSchema,
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
});
export const providerModelRecordSchema = z.object({
    modelId: modelIdSchema,
    model: z.string(),
    displayName: z.string(),
    providerId: z.number().int().positive(),
    providerName: z.string(),
    providerType: z.string(),
    providerStatus: activeStatusSchema,
    tokenLimit: z.number().int().positive(),
    status: activeStatusSchema,
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
});
export const routingPolicyRecordSchema = z.object({
    policyId: z.string().min(1),
    profileId: z.string().min(1),
    primaryModelId: modelIdSchema,
    fallbacks: z.array(modelIdSchema),
    strategy: z.string(),
    status: activeStatusSchema,
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
});
export const modelProfileRecordSchema = z.object({
    profileId: z.string().min(1),
    displayName: z.string(),
    intentTags: z.array(z.string()),
    sla: jsonObjectSchema.nullable(),
    status: activeStatusSchema,
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
    routingPolicy: routingPolicyRecordSchema.nullable(),
});
export const auditLogRecordSchema = z.object({
    auditId: z.string().min(1),
    actor: z.string().nullable(),
    action: z.string(),
    resource: z.string(),
    resourceId: z.string().nullable(),
    requestId: z.string().nullable(),
    before: jsonObjectSchema.nullable(),
    after: jsonObjectSchema.nullable(),
    createdAt: isoDateTimeSchema,
});
//# sourceMappingURL=admin.js.map