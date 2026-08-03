import { z } from 'zod';
export declare const projectRecordSchema: z.ZodObject<{
    projectId: z.ZodString;
    name: z.ZodString;
    rootPath: z.ZodString;
    defaultRunnerId: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    chatCount: z.ZodNumber;
    latestSession: z.ZodOptional<z.ZodObject<{
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
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    createdAt: string;
    updatedAt: string;
    projectId: string;
    rootPath: string;
    defaultRunnerId: string | null;
    chatCount: number;
    latestSession?: {
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
    } | undefined;
}, {
    name: string;
    createdAt: string;
    updatedAt: string;
    projectId: string;
    rootPath: string;
    defaultRunnerId: string | null;
    chatCount: number;
    latestSession?: {
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
    } | undefined;
}>;
export declare const projectParamsSchema: z.ZodObject<{
    projectId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectId: string;
}, {
    projectId: string;
}>;
export declare const createProjectBodySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    rootPath: z.ZodString;
    runnerId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    runnerId: string;
    rootPath: string;
    name?: string | undefined;
}, {
    runnerId: string;
    rootPath: string;
    name?: string | undefined;
}>;
export declare const updateProjectBodySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    rootPath: z.ZodOptional<z.ZodString>;
    defaultRunnerId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    rootPath?: string | undefined;
    defaultRunnerId?: string | undefined;
}, {
    name?: string | undefined;
    rootPath?: string | undefined;
    defaultRunnerId?: string | undefined;
}>;
export type ProjectRecord = z.infer<typeof projectRecordSchema>;
export type CreateProjectBody = z.infer<typeof createProjectBodySchema>;
export type UpdateProjectBody = z.infer<typeof updateProjectBodySchema>;
