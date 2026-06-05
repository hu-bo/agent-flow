import './CodeDiffRenderer.less';
import type { ContentRendererProps } from '../registry';
export interface CodeDiffPreviewLine {
    type: 'context' | 'add' | 'del';
    text: string;
    oldLine: number | null;
    newLine: number | null;
}
export interface CodeDiffPreviewHunk {
    header: string;
    lines: CodeDiffPreviewLine[];
}
interface CodeDiffPreviewProps {
    filename?: string;
    language?: string;
    hunks: CodeDiffPreviewHunk[];
}
export declare function CodeDiffPreview({ filename, language, hunks }: CodeDiffPreviewProps): import("react").JSX.Element;
export declare function CodeDiffRenderer({ part }: ContentRendererProps): import("react").JSX.Element;
export {};
