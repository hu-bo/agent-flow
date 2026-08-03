import { z } from 'zod';
export declare const modelDescriptorSchema: z.ZodObject<{
    modelId: z.ZodNumber;
    model: z.ZodString;
    displayName: z.ZodString;
    provider: z.ZodString;
    providerType: z.ZodString;
    providerModel: z.ZodString;
    maxInputTokens: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    provider: string;
    modelId: number;
    model: string;
    displayName: string;
    providerType: string;
    providerModel: string;
    maxInputTokens: number;
}, {
    provider: string;
    modelId: number;
    model: string;
    displayName: string;
    providerType: string;
    providerModel: string;
    maxInputTokens: number;
}>;
export type ModelDescriptor = z.infer<typeof modelDescriptorSchema>;
//# sourceMappingURL=models.d.ts.map