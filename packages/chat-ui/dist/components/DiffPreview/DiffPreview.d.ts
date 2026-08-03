import type { RunnerFilesChangedHunk } from '@agent-flow/core/messages';
export interface DiffPreviewProps {
    filename: string;
    hunks: RunnerFilesChangedHunk[];
}
export declare function DiffPreview({ filename, hunks }: DiffPreviewProps): import("react").JSX.Element;
