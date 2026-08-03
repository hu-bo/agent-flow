import { z } from 'zod';
export declare const providerParamsSchema: z.ZodObject<{
    providerId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    providerId: number;
}, {
    providerId: number;
}>;
export declare const createProviderBodySchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodString;
    status: z.ZodOptional<z.ZodEnum<["active", "disabled"]>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    type: string;
    name: string;
    status?: "active" | "disabled" | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    type: string;
    name: string;
    status?: "active" | "disabled" | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
export declare const updateProviderBodySchema: z.ZodObject<{
    status: z.ZodEnum<["active", "disabled"]>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "disabled";
}, {
    status: "active" | "disabled";
}>;
export declare const createProviderCredentialBodySchema: z.ZodObject<{
    secretRef: z.ZodString;
    keyVersion: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<["active", "disabled"]>>;
}, "strip", z.ZodTypeAny, {
    secretRef: string;
    status?: "active" | "disabled" | undefined;
    keyVersion?: number | undefined;
}, {
    secretRef: string;
    status?: "active" | "disabled" | undefined;
    keyVersion?: number | undefined;
}>;
export declare const listAdminModelsQuerySchema: z.ZodObject<{
    provider: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider?: string | undefined;
}, {
    provider?: string | undefined;
}>;
export declare const modelParamsSchema: z.ZodObject<{
    modelId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    modelId: number;
}, {
    modelId: number;
}>;
export declare const createAdminModelBodySchema: z.ZodObject<{
    model: z.ZodString;
    displayName: z.ZodString;
    providerId: z.ZodNumber;
    tokenLimit: z.ZodNumber;
    status: z.ZodOptional<z.ZodEnum<["active", "disabled"]>>;
}, "strip", z.ZodTypeAny, {
    providerId: number;
    model: string;
    displayName: string;
    tokenLimit: number;
    status?: "active" | "disabled" | undefined;
}, {
    providerId: number;
    model: string;
    displayName: string;
    tokenLimit: number;
    status?: "active" | "disabled" | undefined;
}>;
export declare const updateAdminModelBodySchema: z.ZodEffects<z.ZodObject<{
    model: z.ZodOptional<z.ZodString>;
    displayName: z.ZodOptional<z.ZodString>;
    providerId: z.ZodOptional<z.ZodNumber>;
    tokenLimit: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodOptional<z.ZodEnum<["active", "disabled"]>>>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "disabled" | undefined;
    providerId?: number | undefined;
    model?: string | undefined;
    displayName?: string | undefined;
    tokenLimit?: number | undefined;
}, {
    status?: "active" | "disabled" | undefined;
    providerId?: number | undefined;
    model?: string | undefined;
    displayName?: string | undefined;
    tokenLimit?: number | undefined;
}>, {
    status?: "active" | "disabled" | undefined;
    providerId?: number | undefined;
    model?: string | undefined;
    displayName?: string | undefined;
    tokenLimit?: number | undefined;
}, {
    status?: "active" | "disabled" | undefined;
    providerId?: number | undefined;
    model?: string | undefined;
    displayName?: string | undefined;
    tokenLimit?: number | undefined;
}>;
export declare const modelProfileParamsSchema: z.ZodObject<{
    profileId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    profileId: string;
}, {
    profileId: string;
}>;
export declare const createModelProfileBodySchema: z.ZodObject<{
    profileId: z.ZodString;
    displayName: z.ZodString;
    intentTags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    sla: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    status: z.ZodOptional<z.ZodEnum<["active", "disabled"]>>;
}, "strip", z.ZodTypeAny, {
    displayName: string;
    profileId: string;
    status?: "active" | "disabled" | undefined;
    intentTags?: string[] | undefined;
    sla?: Record<string, unknown> | null | undefined;
}, {
    displayName: string;
    profileId: string;
    status?: "active" | "disabled" | undefined;
    intentTags?: string[] | undefined;
    sla?: Record<string, unknown> | null | undefined;
}>;
export declare const updateModelProfileBodySchema: z.ZodEffects<z.ZodObject<{
    status: z.ZodOptional<z.ZodOptional<z.ZodEnum<["active", "disabled"]>>>;
    displayName: z.ZodOptional<z.ZodString>;
    intentTags: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    sla: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "disabled" | undefined;
    displayName?: string | undefined;
    intentTags?: string[] | undefined;
    sla?: Record<string, unknown> | null | undefined;
}, {
    status?: "active" | "disabled" | undefined;
    displayName?: string | undefined;
    intentTags?: string[] | undefined;
    sla?: Record<string, unknown> | null | undefined;
}>, {
    status?: "active" | "disabled" | undefined;
    displayName?: string | undefined;
    intentTags?: string[] | undefined;
    sla?: Record<string, unknown> | null | undefined;
}, {
    status?: "active" | "disabled" | undefined;
    displayName?: string | undefined;
    intentTags?: string[] | undefined;
    sla?: Record<string, unknown> | null | undefined;
}>;
export declare const upsertRoutingPolicyBodySchema: z.ZodObject<{
    policyId: z.ZodOptional<z.ZodString>;
    primaryModelId: z.ZodNumber;
    fallbacks: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    strategy: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "disabled"]>>;
}, "strip", z.ZodTypeAny, {
    primaryModelId: number;
    status?: "active" | "disabled" | undefined;
    policyId?: string | undefined;
    fallbacks?: number[] | undefined;
    strategy?: string | undefined;
}, {
    primaryModelId: number;
    status?: "active" | "disabled" | undefined;
    policyId?: string | undefined;
    fallbacks?: number[] | undefined;
    strategy?: string | undefined;
}>;
export declare const listAuditLogsQuerySchema: z.ZodObject<{
    actor: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodString>;
    resource: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    actor?: string | undefined;
    action?: string | undefined;
    resource?: string | undefined;
    limit?: number | undefined;
}, {
    actor?: string | undefined;
    action?: string | undefined;
    resource?: string | undefined;
    limit?: number | undefined;
}>;
export declare const providerRecordSchema: z.ZodObject<{
    providerId: z.ZodNumber;
    name: z.ZodString;
    type: z.ZodString;
    status: z.ZodEnum<["active", "disabled"]>;
    metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    activeModelCount: z.ZodNumber;
    credentialCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: string;
    status: "active" | "disabled";
    providerId: number;
    name: string;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
    activeModelCount: number;
    credentialCount: number;
}, {
    type: string;
    status: "active" | "disabled";
    providerId: number;
    name: string;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
    activeModelCount: number;
    credentialCount: number;
}>;
export declare const providerCredentialRecordSchema: z.ZodObject<{
    credentialId: z.ZodString;
    providerId: z.ZodNumber;
    secretRef: z.ZodString;
    keyVersion: z.ZodNumber;
    status: z.ZodEnum<["active", "disabled"]>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "active" | "disabled";
    providerId: number;
    secretRef: string;
    keyVersion: number;
    createdAt: string;
    updatedAt: string;
    credentialId: string;
}, {
    status: "active" | "disabled";
    providerId: number;
    secretRef: string;
    keyVersion: number;
    createdAt: string;
    updatedAt: string;
    credentialId: string;
}>;
export declare const providerModelRecordSchema: z.ZodObject<{
    modelId: z.ZodNumber;
    model: z.ZodString;
    displayName: z.ZodString;
    providerId: z.ZodNumber;
    providerName: z.ZodString;
    providerType: z.ZodString;
    providerStatus: z.ZodEnum<["active", "disabled"]>;
    tokenLimit: z.ZodNumber;
    status: z.ZodEnum<["active", "disabled"]>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "active" | "disabled";
    providerId: number;
    modelId: number;
    model: string;
    displayName: string;
    tokenLimit: number;
    createdAt: string;
    updatedAt: string;
    providerName: string;
    providerType: string;
    providerStatus: "active" | "disabled";
}, {
    status: "active" | "disabled";
    providerId: number;
    modelId: number;
    model: string;
    displayName: string;
    tokenLimit: number;
    createdAt: string;
    updatedAt: string;
    providerName: string;
    providerType: string;
    providerStatus: "active" | "disabled";
}>;
export declare const routingPolicyRecordSchema: z.ZodObject<{
    policyId: z.ZodString;
    profileId: z.ZodString;
    primaryModelId: z.ZodNumber;
    fallbacks: z.ZodArray<z.ZodNumber, "many">;
    strategy: z.ZodString;
    status: z.ZodEnum<["active", "disabled"]>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "active" | "disabled";
    profileId: string;
    policyId: string;
    primaryModelId: number;
    fallbacks: number[];
    strategy: string;
    createdAt: string;
    updatedAt: string;
}, {
    status: "active" | "disabled";
    profileId: string;
    policyId: string;
    primaryModelId: number;
    fallbacks: number[];
    strategy: string;
    createdAt: string;
    updatedAt: string;
}>;
export declare const modelProfileRecordSchema: z.ZodObject<{
    profileId: z.ZodString;
    displayName: z.ZodString;
    intentTags: z.ZodArray<z.ZodString, "many">;
    sla: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    status: z.ZodEnum<["active", "disabled"]>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    routingPolicy: z.ZodNullable<z.ZodObject<{
        policyId: z.ZodString;
        profileId: z.ZodString;
        primaryModelId: z.ZodNumber;
        fallbacks: z.ZodArray<z.ZodNumber, "many">;
        strategy: z.ZodString;
        status: z.ZodEnum<["active", "disabled"]>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "active" | "disabled";
        profileId: string;
        policyId: string;
        primaryModelId: number;
        fallbacks: number[];
        strategy: string;
        createdAt: string;
        updatedAt: string;
    }, {
        status: "active" | "disabled";
        profileId: string;
        policyId: string;
        primaryModelId: number;
        fallbacks: number[];
        strategy: string;
        createdAt: string;
        updatedAt: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "disabled";
    displayName: string;
    profileId: string;
    intentTags: string[];
    sla: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
    routingPolicy: {
        status: "active" | "disabled";
        profileId: string;
        policyId: string;
        primaryModelId: number;
        fallbacks: number[];
        strategy: string;
        createdAt: string;
        updatedAt: string;
    } | null;
}, {
    status: "active" | "disabled";
    displayName: string;
    profileId: string;
    intentTags: string[];
    sla: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
    routingPolicy: {
        status: "active" | "disabled";
        profileId: string;
        policyId: string;
        primaryModelId: number;
        fallbacks: number[];
        strategy: string;
        createdAt: string;
        updatedAt: string;
    } | null;
}>;
export declare const auditLogRecordSchema: z.ZodObject<{
    auditId: z.ZodString;
    actor: z.ZodNullable<z.ZodString>;
    action: z.ZodString;
    resource: z.ZodString;
    resourceId: z.ZodNullable<z.ZodString>;
    requestId: z.ZodNullable<z.ZodString>;
    before: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    after: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    actor: string | null;
    action: string;
    resource: string;
    createdAt: string;
    auditId: string;
    resourceId: string | null;
    requestId: string | null;
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
}, {
    actor: string | null;
    action: string;
    resource: string;
    createdAt: string;
    auditId: string;
    resourceId: string | null;
    requestId: string | null;
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
}>;
export type CreateProviderInput = z.infer<typeof createProviderBodySchema>;
export type UpdateProviderInput = z.infer<typeof updateProviderBodySchema>;
export type CreateProviderCredentialInput = z.infer<typeof createProviderCredentialBodySchema>;
export type ListAdminModelsQuery = z.infer<typeof listAdminModelsQuerySchema>;
export type CreateProviderModelInput = z.infer<typeof createAdminModelBodySchema>;
export type UpdateProviderModelInput = z.infer<typeof updateAdminModelBodySchema>;
export type CreateModelProfileInput = z.infer<typeof createModelProfileBodySchema>;
export type UpdateModelProfileInput = z.infer<typeof updateModelProfileBodySchema>;
export type UpsertRoutingPolicyInput = z.infer<typeof upsertRoutingPolicyBodySchema>;
export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;
export type ProviderRecord = z.infer<typeof providerRecordSchema>;
export type ProviderCredentialRecord = z.infer<typeof providerCredentialRecordSchema>;
export type ProviderModelRecord = z.infer<typeof providerModelRecordSchema>;
export type RoutingPolicyRecord = z.infer<typeof routingPolicyRecordSchema>;
export type ModelProfileRecord = z.infer<typeof modelProfileRecordSchema>;
export type AuditLogRecord = z.infer<typeof auditLogRecordSchema>;
//# sourceMappingURL=admin.d.ts.map