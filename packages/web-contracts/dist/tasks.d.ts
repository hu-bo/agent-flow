import { z } from 'zod';
export declare const taskParamsSchema: z.ZodObject<{
    taskId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    taskId: string;
}, {
    taskId: string;
}>;
export declare const taskActionParamsSchema: z.ZodObject<{
    taskId: z.ZodString;
} & {
    action: z.ZodEnum<["pause", "resume", "cancel", "retry"]>;
}, "strip", z.ZodTypeAny, {
    action: "pause" | "resume" | "cancel" | "retry";
    taskId: string;
}, {
    action: "pause" | "resume" | "cancel" | "retry";
    taskId: string;
}>;
export declare const taskEventsQuerySchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    cursor?: number | undefined;
}, {
    cursor?: number | undefined;
}>;
export declare const taskRecordSchema: z.ZodObject<{
    taskId: z.ZodString;
    sessionId: z.ZodString;
    profileId: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["chat", "workflow", "compact"]>;
    status: z.ZodEnum<["pending", "running", "paused", "completed", "failed", "cancelled"]>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    latestCheckpointId: z.ZodString;
    retryCount: z.ZodNumber;
    maxRetries: z.ZodNumber;
    modelId: z.ZodNumber;
    prompt: z.ZodString;
    error: z.ZodOptional<z.ZodString>;
    outputs: z.ZodOptional<z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    type: "chat" | "workflow" | "compact";
    status: "pending" | "running" | "paused" | "completed" | "failed" | "cancelled";
    modelId: number;
    createdAt: string;
    updatedAt: string;
    sessionId: string;
    latestCheckpointId: string;
    taskId: string;
    retryCount: number;
    maxRetries: number;
    prompt: string;
    profileId?: string | undefined;
    error?: string | undefined;
    outputs?: unknown;
}, {
    type: "chat" | "workflow" | "compact";
    status: "pending" | "running" | "paused" | "completed" | "failed" | "cancelled";
    modelId: number;
    createdAt: string;
    updatedAt: string;
    sessionId: string;
    latestCheckpointId: string;
    taskId: string;
    retryCount: number;
    maxRetries: number;
    prompt: string;
    profileId?: string | undefined;
    error?: string | undefined;
    outputs?: unknown;
}>;
export declare const createTaskBodySchema: z.ZodObject<{
    prompt: z.ZodString;
    profileId: z.ZodOptional<z.ZodString>;
    modelId: z.ZodOptional<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    type: z.ZodDefault<z.ZodEnum<["chat", "workflow", "compact"]>>;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    maxRetries: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "chat" | "workflow" | "compact";
    prompt: string;
    modelId?: number | undefined;
    profileId?: string | undefined;
    sessionId?: string | undefined;
    projectId?: string | undefined;
    maxRetries?: number | undefined;
    config?: Record<string, unknown> | undefined;
}, {
    prompt: string;
    type?: "chat" | "workflow" | "compact" | undefined;
    modelId?: number | undefined;
    profileId?: string | undefined;
    sessionId?: string | undefined;
    projectId?: string | undefined;
    maxRetries?: number | undefined;
    config?: Record<string, unknown> | undefined;
}>;
export type TaskRecord = z.infer<typeof taskRecordSchema>;
export type CreateTaskBody = z.infer<typeof createTaskBodySchema>;
