import { z } from 'zod';
import type { UnifiedMessage } from '@agent-flow/core/messages';
export declare const specWorkflowStateSchema: z.ZodObject<{
    phase: z.ZodEnum<["requirements", "design", "tasks"]>;
    awaitingConfirm: z.ZodBoolean;
    requirementsMsgId: z.ZodOptional<z.ZodString>;
    designMsgId: z.ZodOptional<z.ZodString>;
    taskListMsgId: z.ZodOptional<z.ZodString>;
    documents: z.ZodOptional<z.ZodObject<{
        requirements: z.ZodOptional<z.ZodString>;
        design: z.ZodOptional<z.ZodString>;
        tasks: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        requirements?: string | undefined;
        design?: string | undefined;
        tasks?: string | undefined;
    }, {
        requirements?: string | undefined;
        design?: string | undefined;
        tasks?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    phase: "requirements" | "design" | "tasks";
    awaitingConfirm: boolean;
    requirementsMsgId?: string | undefined;
    designMsgId?: string | undefined;
    taskListMsgId?: string | undefined;
    documents?: {
        requirements?: string | undefined;
        design?: string | undefined;
        tasks?: string | undefined;
    } | undefined;
}, {
    phase: "requirements" | "design" | "tasks";
    awaitingConfirm: boolean;
    requirementsMsgId?: string | undefined;
    designMsgId?: string | undefined;
    taskListMsgId?: string | undefined;
    documents?: {
        requirements?: string | undefined;
        design?: string | undefined;
        tasks?: string | undefined;
    } | undefined;
}>;
export declare const sessionRecordSchema: z.ZodObject<{
    sessionId: z.ZodString;
    projectId: z.ZodNullable<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    modelId: z.ZodNumber;
    mode: z.ZodEnum<["vibe", "spec"]>;
    cwd: z.ZodString;
    messageCount: z.ZodNumber;
    systemPrompt: z.ZodOptional<z.ZodString>;
    latestCheckpointId: z.ZodOptional<z.ZodString>;
    boundRunnerId: z.ZodOptional<z.ZodString>;
    specWorkflow: z.ZodOptional<z.ZodObject<{
        phase: z.ZodEnum<["requirements", "design", "tasks"]>;
        awaitingConfirm: z.ZodBoolean;
        requirementsMsgId: z.ZodOptional<z.ZodString>;
        designMsgId: z.ZodOptional<z.ZodString>;
        taskListMsgId: z.ZodOptional<z.ZodString>;
        documents: z.ZodOptional<z.ZodObject<{
            requirements: z.ZodOptional<z.ZodString>;
            design: z.ZodOptional<z.ZodString>;
            tasks: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            requirements?: string | undefined;
            design?: string | undefined;
            tasks?: string | undefined;
        }, {
            requirements?: string | undefined;
            design?: string | undefined;
            tasks?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        phase: "requirements" | "design" | "tasks";
        awaitingConfirm: boolean;
        requirementsMsgId?: string | undefined;
        designMsgId?: string | undefined;
        taskListMsgId?: string | undefined;
        documents?: {
            requirements?: string | undefined;
            design?: string | undefined;
            tasks?: string | undefined;
        } | undefined;
    }, {
        phase: "requirements" | "design" | "tasks";
        awaitingConfirm: boolean;
        requirementsMsgId?: string | undefined;
        designMsgId?: string | undefined;
        taskListMsgId?: string | undefined;
        documents?: {
            requirements?: string | undefined;
            design?: string | undefined;
            tasks?: string | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    modelId: number;
    createdAt: string;
    updatedAt: string;
    sessionId: string;
    projectId: string | null;
    mode: "vibe" | "spec";
    cwd: string;
    messageCount: number;
    title?: string | undefined;
    systemPrompt?: string | undefined;
    latestCheckpointId?: string | undefined;
    boundRunnerId?: string | undefined;
    specWorkflow?: {
        phase: "requirements" | "design" | "tasks";
        awaitingConfirm: boolean;
        requirementsMsgId?: string | undefined;
        designMsgId?: string | undefined;
        taskListMsgId?: string | undefined;
        documents?: {
            requirements?: string | undefined;
            design?: string | undefined;
            tasks?: string | undefined;
        } | undefined;
    } | undefined;
}, {
    modelId: number;
    createdAt: string;
    updatedAt: string;
    sessionId: string;
    projectId: string | null;
    mode: "vibe" | "spec";
    cwd: string;
    messageCount: number;
    title?: string | undefined;
    systemPrompt?: string | undefined;
    latestCheckpointId?: string | undefined;
    boundRunnerId?: string | undefined;
    specWorkflow?: {
        phase: "requirements" | "design" | "tasks";
        awaitingConfirm: boolean;
        requirementsMsgId?: string | undefined;
        designMsgId?: string | undefined;
        taskListMsgId?: string | undefined;
        documents?: {
            requirements?: string | undefined;
            design?: string | undefined;
            tasks?: string | undefined;
        } | undefined;
    } | undefined;
}>;
export declare const sessionParamsSchema: z.ZodObject<{
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
}, {
    sessionId: string;
}>;
export declare const createSessionBodySchema: z.ZodObject<{
    modelId: z.ZodOptional<z.ZodNumber>;
    mode: z.ZodDefault<z.ZodOptional<z.ZodEnum<["vibe", "spec"]>>>;
    title: z.ZodOptional<z.ZodString>;
    systemPrompt: z.ZodOptional<z.ZodString>;
    cwd: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    mode: "vibe" | "spec";
    modelId?: number | undefined;
    projectId?: string | undefined;
    title?: string | undefined;
    cwd?: string | undefined;
    systemPrompt?: string | undefined;
}, {
    modelId?: number | undefined;
    projectId?: string | undefined;
    title?: string | undefined;
    mode?: "vibe" | "spec" | undefined;
    cwd?: string | undefined;
    systemPrompt?: string | undefined;
}>;
export type SpecWorkflowState = z.infer<typeof specWorkflowStateSchema>;
export type SessionRecord = z.infer<typeof sessionRecordSchema>;
export type CreateSessionBody = z.infer<typeof createSessionBodySchema>;
export interface SessionState {
    session: SessionRecord;
    messages: UnifiedMessage[];
}
//# sourceMappingURL=sessions.d.ts.map