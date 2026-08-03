import { z } from 'zod';
export declare const specSessionParamsSchema: z.ZodObject<{
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
}, {
    sessionId: string;
}>;
export declare const specConfirmBodySchema: z.ZodObject<{
    selectedArtifacts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    actionAnswer: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    selectedArtifacts?: string[] | undefined;
    actionAnswer?: string | undefined;
}, {
    selectedArtifacts?: string[] | undefined;
    actionAnswer?: string | undefined;
}>;
export declare const specStateSchema: z.ZodObject<{
    sessionId: z.ZodString;
    mode: z.ZodLiteral<"spec">;
    specWorkflow: z.ZodObject<{
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
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    mode: "spec";
    specWorkflow: {
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
    };
}, {
    sessionId: string;
    mode: "spec";
    specWorkflow: {
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
    };
}>;
//# sourceMappingURL=spec.d.ts.map