export type CompactStrategyName = 'summarization' | 'diff' | 'semantic' | 'rewrite' | 'none';

export interface CompactItem {
  id: string;
  text: string;
  importance?: number;
  metadata?: Record<string, unknown>;
}

export interface CompactRequest {
  items: CompactItem[];
  tokenLimit: number;
  query?: string;
  targetRatio?: number;
  maxItems?: number;
}

export interface CompactResult {
  strategy: CompactStrategyName;
  items: CompactItem[];
  summary: string;
  estimatedTokens: number;
  qualityScore: number;
  didCompact: boolean;
}

export interface CompactStrategy {
  readonly name: Exclude<CompactStrategyName, 'none'>;
  compact(request: CompactRequest): Promise<CompactResult>;
}

export interface CompactQualityEvaluator {
  evaluate(before: CompactItem[], after: CompactItem[], tokenLimit: number): number;
}
