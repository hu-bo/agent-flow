import { z } from 'zod';
export declare const apiErrorSchema: z.ZodObject<{
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
export type ApiError = z.infer<typeof apiErrorSchema>;
