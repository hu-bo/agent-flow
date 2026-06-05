import type { ToolDefinition, ToolSchema } from '@agent-flow/core';
export interface FileReadInput {
    path: string;
    encoding?: BufferEncoding;
    maxBytes?: number;
}
export interface FileReadOutput {
    path: string;
    size: number;
    content: string;
}
export interface FileWriteInput {
    path: string;
    content: string;
    encoding?: BufferEncoding;
}
export interface FileWriteOutput {
    path: string;
    writtenBytes: number;
}
export declare class FileReadTool implements ToolDefinition<FileReadInput, FileReadOutput> {
    readonly schema: ToolSchema;
    execute(input: FileReadInput): Promise<FileReadOutput>;
}
export declare class FileWriteTool implements ToolDefinition<FileWriteInput, FileWriteOutput> {
    readonly schema: ToolSchema;
    execute(input: FileWriteInput): Promise<FileWriteOutput>;
}
//# sourceMappingURL=fs-tools.d.ts.map