import { z } from 'zod';
export declare const runnerPlatformProfileSchema: z.ZodObject<{
    os: z.ZodOptional<z.ZodString>;
    arch: z.ZodOptional<z.ZodString>;
    defaultShell: z.ZodOptional<z.ZodString>;
    pathSeparator: z.ZodOptional<z.ZodString>;
    lineEnding: z.ZodOptional<z.ZodString>;
    workspaceRoots: z.ZodArray<z.ZodString, "many">;
    availableCommands: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    workspaceRoots: string[];
    availableCommands: string[];
    os?: string | undefined;
    arch?: string | undefined;
    defaultShell?: string | undefined;
    pathSeparator?: string | undefined;
    lineEnding?: string | undefined;
}, {
    workspaceRoots: string[];
    availableCommands: string[];
    os?: string | undefined;
    arch?: string | undefined;
    defaultShell?: string | undefined;
    pathSeparator?: string | undefined;
    lineEnding?: string | undefined;
}>;
export declare const runnerRecordSchema: z.ZodObject<{
    runnerId: z.ZodString;
    ownerUserId: z.ZodString;
    tokenId: z.ZodNullable<z.ZodString>;
    kind: z.ZodEnum<["local", "remote", "sandbox"]>;
    status: z.ZodEnum<["online", "offline"]>;
    host: z.ZodNullable<z.ZodString>;
    hostName: z.ZodNullable<z.ZodString>;
    hostIp: z.ZodNullable<z.ZodString>;
    version: z.ZodNullable<z.ZodString>;
    capabilities: z.ZodArray<z.ZodString, "many">;
    platform: z.ZodOptional<z.ZodObject<{
        os: z.ZodOptional<z.ZodString>;
        arch: z.ZodOptional<z.ZodString>;
        defaultShell: z.ZodOptional<z.ZodString>;
        pathSeparator: z.ZodOptional<z.ZodString>;
        lineEnding: z.ZodOptional<z.ZodString>;
        workspaceRoots: z.ZodArray<z.ZodString, "many">;
        availableCommands: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        workspaceRoots: string[];
        availableCommands: string[];
        os?: string | undefined;
        arch?: string | undefined;
        defaultShell?: string | undefined;
        pathSeparator?: string | undefined;
        lineEnding?: string | undefined;
    }, {
        workspaceRoots: string[];
        availableCommands: string[];
        os?: string | undefined;
        arch?: string | undefined;
        defaultShell?: string | undefined;
        pathSeparator?: string | undefined;
        lineEnding?: string | undefined;
    }>>;
    lastSeenAt: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "online" | "offline";
    createdAt: string;
    updatedAt: string;
    runnerId: string;
    ownerUserId: string;
    tokenId: string | null;
    kind: "local" | "remote" | "sandbox";
    host: string | null;
    hostName: string | null;
    hostIp: string | null;
    version: string | null;
    capabilities: string[];
    lastSeenAt: string | null;
    platform?: {
        workspaceRoots: string[];
        availableCommands: string[];
        os?: string | undefined;
        arch?: string | undefined;
        defaultShell?: string | undefined;
        pathSeparator?: string | undefined;
        lineEnding?: string | undefined;
    } | undefined;
}, {
    status: "online" | "offline";
    createdAt: string;
    updatedAt: string;
    runnerId: string;
    ownerUserId: string;
    tokenId: string | null;
    kind: "local" | "remote" | "sandbox";
    host: string | null;
    hostName: string | null;
    hostIp: string | null;
    version: string | null;
    capabilities: string[];
    lastSeenAt: string | null;
    platform?: {
        workspaceRoots: string[];
        availableCommands: string[];
        os?: string | undefined;
        arch?: string | undefined;
        defaultShell?: string | undefined;
        pathSeparator?: string | undefined;
        lineEnding?: string | undefined;
    } | undefined;
}>;
export declare const runnerParamsSchema: z.ZodObject<{
    runnerId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    runnerId: string;
}, {
    runnerId: string;
}>;
export declare const runnerBindingParamsSchema: z.ZodObject<{
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
}, {
    sessionId: string;
}>;
export declare const runnerBindingBodySchema: z.ZodObject<{
    runnerId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    runnerId: string;
}, {
    runnerId: string;
}>;
export declare const runnerApprovalDecisionParamsSchema: z.ZodObject<{
    requestId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    requestId: string;
}, {
    requestId: string;
}>;
export declare const runnerApprovalDecisionBodySchema: z.ZodObject<{
    decision: z.ZodEnum<["once", "always", "deny"]>;
}, "strip", z.ZodTypeAny, {
    decision: "once" | "always" | "deny";
}, {
    decision: "once" | "always" | "deny";
}>;
export declare const runnerApprovalGrantParamsSchema: z.ZodObject<{
    grantId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    grantId: string;
}, {
    grantId: string;
}>;
export declare const runnerFsListBodySchema: z.ZodObject<{
    path: z.ZodString;
    includeHidden: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    path: string;
    includeHidden: boolean;
}, {
    path: string;
    includeHidden?: boolean | undefined;
}>;
export declare const runnerDownloadPlatformSchema: z.ZodEnum<["windows-amd64", "windows-arm64", "darwin-arm64", "darwin-amd64", "macos-arm64", "macos-amd64", "linux-amd64"]>;
export declare const runnerDownloadPlatformParamsSchema: z.ZodObject<{
    platform: z.ZodEnum<["windows-amd64", "windows-arm64", "darwin-arm64", "darwin-amd64", "macos-arm64", "macos-amd64", "linux-amd64"]>;
}, "strip", z.ZodTypeAny, {
    platform: "windows-amd64" | "windows-arm64" | "darwin-arm64" | "darwin-amd64" | "macos-arm64" | "macos-amd64" | "linux-amd64";
}, {
    platform: "windows-amd64" | "windows-arm64" | "darwin-arm64" | "darwin-amd64" | "macos-arm64" | "macos-amd64" | "linux-amd64";
}>;
export declare const runnerTokenIssueResultSchema: z.ZodObject<{
    runnerToken: z.ZodString;
    tokenId: z.ZodString;
    serverAddr: z.ZodString;
    grpcServerAddr: z.ZodString;
    downloadUrls: z.ZodObject<{
        windows: z.ZodString;
        macos: z.ZodString;
        linux: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        windows: string;
        macos: string;
        linux: string;
    }, {
        windows: string;
        macos: string;
        linux: string;
    }>;
}, "strip", z.ZodTypeAny, {
    tokenId: string;
    runnerToken: string;
    serverAddr: string;
    grpcServerAddr: string;
    downloadUrls: {
        windows: string;
        macos: string;
        linux: string;
    };
}, {
    tokenId: string;
    runnerToken: string;
    serverAddr: string;
    grpcServerAddr: string;
    downloadUrls: {
        windows: string;
        macos: string;
        linux: string;
    };
}>;
export declare const runnerApprovalGrantSchema: z.ZodObject<{
    grantId: z.ZodString;
    runnerId: z.ZodString;
    scopeType: z.ZodEnum<["project", "chat"]>;
    scopeId: z.ZodString;
    scopeLabel: z.ZodOptional<z.ZodString>;
    coverage: z.ZodLiteral<"all_high_risk">;
    createdAt: z.ZodString;
    lastUsedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    runnerId: string;
    scopeType: "project" | "chat";
    scopeId: string;
    grantId: string;
    coverage: "all_high_risk";
    scopeLabel?: string | undefined;
    lastUsedAt?: string | undefined;
}, {
    createdAt: string;
    runnerId: string;
    scopeType: "project" | "chat";
    scopeId: string;
    grantId: string;
    coverage: "all_high_risk";
    scopeLabel?: string | undefined;
    lastUsedAt?: string | undefined;
}>;
export declare const runnerDirectoryEntrySchema: z.ZodObject<{
    path: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["directory", "file"]>;
    size: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    path: string;
    type: "file" | "directory";
    name: string;
    size?: number | undefined;
}, {
    path: string;
    type: "file" | "directory";
    name: string;
    size?: number | undefined;
}>;
export type RunnerRecord = z.infer<typeof runnerRecordSchema>;
export type RunnerPlatformProfile = z.infer<typeof runnerPlatformProfileSchema>;
export type RunnerApprovalDecision = z.infer<typeof runnerApprovalDecisionBodySchema>['decision'];
export type RunnerTokenIssueResult = z.infer<typeof runnerTokenIssueResultSchema>;
export type RunnerApprovalGrant = z.infer<typeof runnerApprovalGrantSchema>;
export type RunnerDirectoryEntry = z.infer<typeof runnerDirectoryEntrySchema>;
export type RunnerDownloadPlatform = z.infer<typeof runnerDownloadPlatformSchema>;
