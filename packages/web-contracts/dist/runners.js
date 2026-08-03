import { z } from 'zod';
import { isoDateTimeSchema, runnerIdSchema, sessionIdSchema } from './common.js';
export const runnerPlatformProfileSchema = z.object({
    os: z.string().optional(),
    arch: z.string().optional(),
    defaultShell: z.string().optional(),
    pathSeparator: z.string().optional(),
    lineEnding: z.string().optional(),
    workspaceRoots: z.array(z.string()),
    availableCommands: z.array(z.string()),
});
export const runnerRecordSchema = z.object({
    runnerId: runnerIdSchema,
    ownerUserId: z.string(),
    tokenId: z.string().nullable(),
    kind: z.enum(['local', 'remote', 'sandbox']),
    status: z.enum(['online', 'offline']),
    host: z.string().nullable(),
    hostName: z.string().nullable(),
    hostIp: z.string().nullable(),
    version: z.string().nullable(),
    capabilities: z.array(z.string()),
    platform: runnerPlatformProfileSchema.optional(),
    lastSeenAt: isoDateTimeSchema.nullable(),
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
});
export const runnerParamsSchema = z.object({ runnerId: runnerIdSchema });
export const runnerBindingParamsSchema = z.object({ sessionId: sessionIdSchema });
export const runnerBindingBodySchema = z.object({ runnerId: runnerIdSchema });
export const runnerApprovalDecisionParamsSchema = z.object({ requestId: z.string().trim().min(1).max(128) });
export const runnerApprovalDecisionBodySchema = z.object({ decision: z.enum(['once', 'always', 'deny']) });
export const runnerApprovalGrantParamsSchema = z.object({ grantId: z.string().uuid() });
export const runnerFsListBodySchema = z.object({
    path: z.string().trim().min(1).max(2048),
    includeHidden: z.boolean().optional().default(false),
});
export const runnerDownloadPlatformSchema = z.enum([
    'windows-amd64',
    'windows-arm64',
    'darwin-arm64',
    'darwin-amd64',
    'macos-arm64',
    'macos-amd64',
    'linux-amd64',
]);
export const runnerDownloadPlatformParamsSchema = z.object({ platform: runnerDownloadPlatformSchema });
export const runnerTokenIssueResultSchema = z.object({
    runnerToken: z.string().min(1),
    tokenId: z.string().min(1),
    serverAddr: z.string().min(1),
    grpcServerAddr: z.string().min(1),
    downloadUrls: z.object({
        windows: z.string().min(1),
        macos: z.string().min(1),
        linux: z.string().min(1),
    }),
});
export const runnerApprovalGrantSchema = z.object({
    grantId: z.string().uuid(),
    runnerId: runnerIdSchema,
    scopeType: z.enum(['project', 'chat']),
    scopeId: z.string().min(1),
    scopeLabel: z.string().optional(),
    coverage: z.literal('all_high_risk'),
    createdAt: isoDateTimeSchema,
    lastUsedAt: isoDateTimeSchema.optional(),
});
export const runnerDirectoryEntrySchema = z.object({
    path: z.string(),
    name: z.string(),
    type: z.enum(['directory', 'file']),
    size: z.number().int().min(0).optional(),
});
