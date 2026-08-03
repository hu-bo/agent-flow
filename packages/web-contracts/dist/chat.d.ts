import { z } from 'zod';
import type { FilePart, TokenUsage, UnifiedMessage } from '@agent-flow/core/messages';
import { specWorkflowPhaseSchema } from './common.js';
export declare const fileAttachmentSchema: z.ZodObject<{
    type: z.ZodLiteral<"file">;
    mimeType: z.ZodString;
    data: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "file";
    mimeType: string;
    data: string;
}, {
    type: "file";
    mimeType: string;
    data: string;
}>;
export declare const chatTurnBodySchema: z.ZodObject<{
    turnId: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
    profileId: z.ZodOptional<z.ZodString>;
    modelId: z.ZodOptional<z.ZodNumber>;
    reasoningEffort: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodLiteral<"file">;
        mimeType: z.ZodString;
        data: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "file";
        mimeType: string;
        data: string;
    }, {
        type: "file";
        mimeType: string;
        data: string;
    }>, "many">>;
}, "strict", z.ZodTypeAny, {
    message: string;
    modelId?: number | undefined;
    profileId?: string | undefined;
    turnId?: string | undefined;
    reasoningEffort?: "low" | "medium" | "high" | undefined;
    attachments?: {
        type: "file";
        mimeType: string;
        data: string;
    }[] | undefined;
}, {
    message: string;
    modelId?: number | undefined;
    profileId?: string | undefined;
    turnId?: string | undefined;
    reasoningEffort?: "low" | "medium" | "high" | undefined;
    attachments?: {
        type: "file";
        mimeType: string;
        data: string;
    }[] | undefined;
}>;
export declare const chatTurnParamsSchema: z.ZodObject<{
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
}, {
    sessionId: string;
}>;
export declare const messageMutationParamsSchema: z.ZodObject<{
    sessionId: z.ZodString;
    messageId: z.ZodUnion<[z.ZodString, z.ZodString]>;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    messageId: string;
}, {
    sessionId: string;
    messageId: string;
}>;
export declare const retryMessageBodySchema: z.ZodObject<{
    modelId: z.ZodOptional<z.ZodNumber>;
    reasoningEffort: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
}, "strip", z.ZodTypeAny, {
    modelId?: number | undefined;
    reasoningEffort?: "low" | "medium" | "high" | undefined;
}, {
    modelId?: number | undefined;
    reasoningEffort?: "low" | "medium" | "high" | undefined;
}>;
export declare const tokenUsageSchema: z.ZodObject<{
    promptTokens: z.ZodNumber;
    completionTokens: z.ZodNumber;
    totalTokens: z.ZodNumber;
    cacheReadTokens: z.ZodOptional<z.ZodNumber>;
    cacheWriteTokens: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cacheReadTokens?: number | undefined;
    cacheWriteTokens?: number | undefined;
}, {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cacheReadTokens?: number | undefined;
    cacheWriteTokens?: number | undefined;
}>;
export declare const approvalRequestSchema: z.ZodObject<{
    requestId: z.ZodString;
    sessionId: z.ZodString;
    runnerId: z.ZodString;
    scopeType: z.ZodEnum<["project", "chat"]>;
    scopeId: z.ZodString;
    scopeLabel: z.ZodOptional<z.ZodString>;
    command: z.ZodString;
    workingDir: z.ZodString;
    risk: z.ZodEnum<["low", "medium", "high"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    requestId: string;
    sessionId: string;
    runnerId: string;
    scopeType: "project" | "chat";
    scopeId: string;
    command: string;
    workingDir: string;
    risk: "low" | "medium" | "high";
    scopeLabel?: string | undefined;
    reason?: string | undefined;
}, {
    requestId: string;
    sessionId: string;
    runnerId: string;
    scopeType: "project" | "chat";
    scopeId: string;
    command: string;
    workingDir: string;
    risk: "low" | "medium" | "high";
    scopeLabel?: string | undefined;
    reason?: string | undefined;
}>;
export declare const chatStreamEventSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"message.upsert">;
    message: z.ZodObject<{
        uuid: z.ZodString;
        role: z.ZodEnum<["system", "user", "assistant", "tool"]>;
        type: z.ZodEnum<["text", "thinking", "image", "tool_execution"]>;
        timestamp: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        uuid: z.ZodString;
        role: z.ZodEnum<["system", "user", "assistant", "tool"]>;
        type: z.ZodEnum<["text", "thinking", "image", "tool_execution"]>;
        timestamp: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        uuid: z.ZodString;
        role: z.ZodEnum<["system", "user", "assistant", "tool"]>;
        type: z.ZodEnum<["text", "thinking", "image", "tool_execution"]>;
        timestamp: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    message: {
        type: "text" | "thinking" | "image" | "tool_execution";
        uuid: string;
        role: "system" | "user" | "assistant" | "tool";
        timestamp: string;
    } & {
        [k: string]: unknown;
    };
    type: "message.upsert";
}, {
    message: {
        type: "text" | "thinking" | "image" | "tool_execution";
        uuid: string;
        role: "system" | "user" | "assistant" | "tool";
        timestamp: string;
    } & {
        [k: string]: unknown;
    };
    type: "message.upsert";
}>, z.ZodObject<{
    type: z.ZodLiteral<"message.delta">;
    messageId: z.ZodString;
    delta: z.ZodString;
    turnId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "message.delta";
    messageId: string;
    delta: string;
    turnId?: string | undefined;
}, {
    type: "message.delta";
    messageId: string;
    delta: string;
    turnId?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"spec.document">;
    messageId: z.ZodString;
    docType: z.ZodEnum<["requirements", "design", "tasks"]>;
    content: z.ZodString;
    delta: z.ZodOptional<z.ZodString>;
    done: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "spec.document";
    messageId: string;
    docType: "requirements" | "design" | "tasks";
    content: string;
    done: boolean;
    delta?: string | undefined;
}, {
    type: "spec.document";
    messageId: string;
    docType: "requirements" | "design" | "tasks";
    content: string;
    done: boolean;
    delta?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"approval.requested">;
    approval: z.ZodObject<{
        requestId: z.ZodString;
        sessionId: z.ZodString;
        runnerId: z.ZodString;
        scopeType: z.ZodEnum<["project", "chat"]>;
        scopeId: z.ZodString;
        scopeLabel: z.ZodOptional<z.ZodString>;
        command: z.ZodString;
        workingDir: z.ZodString;
        risk: z.ZodEnum<["low", "medium", "high"]>;
        reason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        requestId: string;
        sessionId: string;
        runnerId: string;
        scopeType: "project" | "chat";
        scopeId: string;
        command: string;
        workingDir: string;
        risk: "low" | "medium" | "high";
        scopeLabel?: string | undefined;
        reason?: string | undefined;
    }, {
        requestId: string;
        sessionId: string;
        runnerId: string;
        scopeType: "project" | "chat";
        scopeId: string;
        command: string;
        workingDir: string;
        risk: "low" | "medium" | "high";
        scopeLabel?: string | undefined;
        reason?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "approval.requested";
    approval: {
        requestId: string;
        sessionId: string;
        runnerId: string;
        scopeType: "project" | "chat";
        scopeId: string;
        command: string;
        workingDir: string;
        risk: "low" | "medium" | "high";
        scopeLabel?: string | undefined;
        reason?: string | undefined;
    };
}, {
    type: "approval.requested";
    approval: {
        requestId: string;
        sessionId: string;
        runnerId: string;
        scopeType: "project" | "chat";
        scopeId: string;
        command: string;
        workingDir: string;
        risk: "low" | "medium" | "high";
        scopeLabel?: string | undefined;
        reason?: string | undefined;
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"approval.resolved">;
    requestId: z.ZodString;
    decision: z.ZodEnum<["once", "always", "deny"]>;
    approved: z.ZodBoolean;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "approval.resolved";
    requestId: string;
    decision: "once" | "always" | "deny";
    approved: boolean;
    reason?: string | undefined;
}, {
    type: "approval.resolved";
    requestId: string;
    decision: "once" | "always" | "deny";
    approved: boolean;
    reason?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"usage">;
    usageByMessageId: z.ZodRecord<z.ZodString, z.ZodObject<{
        promptTokens: z.ZodNumber;
        completionTokens: z.ZodNumber;
        totalTokens: z.ZodNumber;
        cacheReadTokens: z.ZodOptional<z.ZodNumber>;
        cacheWriteTokens: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        cacheReadTokens?: number | undefined;
        cacheWriteTokens?: number | undefined;
    }, {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        cacheReadTokens?: number | undefined;
        cacheWriteTokens?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "usage";
    usageByMessageId: Record<string, {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        cacheReadTokens?: number | undefined;
        cacheWriteTokens?: number | undefined;
    }>;
}, {
    type: "usage";
    usageByMessageId: Record<string, {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        cacheReadTokens?: number | undefined;
        cacheWriteTokens?: number | undefined;
    }>;
}>, z.ZodObject<{
    type: z.ZodLiteral<"error">;
    error: z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        details?: unknown;
    }, {
        code: string;
        message: string;
        details?: unknown;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "error";
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
}, {
    type: "error";
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"done">;
}, "strip", z.ZodTypeAny, {
    type: "done";
}, {
    type: "done";
}>]>;
export type ChatTurnBody = z.infer<typeof chatTurnBodySchema> & {
    attachments?: FilePart[];
};
export type ApprovalRequest = z.infer<typeof approvalRequestSchema>;
export type ChatStreamEvent = {
    type: 'message.upsert';
    message: UnifiedMessage;
} | {
    type: 'message.delta';
    messageId: string;
    delta: string;
    turnId?: string;
} | {
    type: 'spec.document';
    messageId: string;
    docType: z.infer<typeof specWorkflowPhaseSchema>;
    content: string;
    delta?: string;
    done: boolean;
} | {
    type: 'approval.requested';
    approval: ApprovalRequest;
} | {
    type: 'approval.resolved';
    requestId: string;
    decision: 'once' | 'always' | 'deny';
    approved: boolean;
    reason?: string;
} | {
    type: 'usage';
    usageByMessageId: Record<string, TokenUsage>;
} | {
    type: 'error';
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
} | {
    type: 'done';
};
