export interface SemanticToolStep {
    title: string;
    toolName: 'fs.read' | 'fs.list' | 'fs.search';
    input: Record<string, unknown>;
}
export declare class SemanticFsDetector {
    detect(rawMessage: string): SemanticToolStep | undefined;
    private extractExplicitPath;
    private resolveCandidatePath;
    private shouldRead;
    private extractSearchPattern;
}
