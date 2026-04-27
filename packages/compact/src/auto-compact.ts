import { DefaultCompactQualityEvaluator } from './quality-evaluator.js';
import { SummarizationCompactStrategy } from './strategies/summarization.js';
import { DiffCompactStrategy } from './strategies/diff.js';
import { SemanticCompactStrategy } from './strategies/semantic.js';
import { RewriteCompactStrategy } from './strategies/rewrite.js';
import { estimateItemsTokens } from './token-estimator.js';
import type { CompactQualityEvaluator, CompactRequest, CompactResult, CompactStrategy } from './types.js';

export interface AutoCompactorOptions {
  strategies?: CompactStrategy[];
  evaluator?: CompactQualityEvaluator;
  minQualityScore?: number;
}

export class AutoCompactor {
  private readonly strategies: CompactStrategy[];
  private readonly evaluator: CompactQualityEvaluator;
  private readonly minQualityScore: number;

  constructor(options: AutoCompactorOptions = {}) {
    this.strategies = options.strategies ?? [
      new SummarizationCompactStrategy(),
      new SemanticCompactStrategy(),
      new DiffCompactStrategy(),
      new RewriteCompactStrategy(),
    ];
    this.evaluator = options.evaluator ?? new DefaultCompactQualityEvaluator();
    this.minQualityScore = options.minQualityScore ?? 0.35;
  }

  async compact(request: CompactRequest): Promise<CompactResult> {
    const currentTokens = estimateItemsTokens(request.items);
    if (currentTokens <= request.tokenLimit) {
      return {
        strategy: 'none',
        items: request.items.map((item) => ({ ...item })),
        summary: 'Token budget is sufficient. Skip compact.',
        estimatedTokens: currentTokens,
        qualityScore: 1,
        didCompact: false,
      };
    }

    const candidates: CompactResult[] = [];
    for (const strategy of this.strategies) {
      const candidate = await strategy.compact(request);
      candidate.qualityScore = this.evaluator.evaluate(request.items, candidate.items, request.tokenLimit);
      candidates.push(candidate);
    }

    const withinBudget = candidates.filter((candidate) => candidate.estimatedTokens <= request.tokenLimit);
    const preferred = withinBudget.length > 0 ? withinBudget : candidates;
    preferred.sort((a, b) => b.qualityScore - a.qualityScore || a.estimatedTokens - b.estimatedTokens);
    const winner = preferred[0];

    if (winner.qualityScore < this.minQualityScore) {
      return {
        strategy: 'none',
        items: request.items.map((item) => ({ ...item })),
        summary: `Compact rollback: best strategy "${winner.strategy}" quality ${winner.qualityScore.toFixed(2)} is below threshold ${this.minQualityScore.toFixed(2)}.`,
        estimatedTokens: currentTokens,
        qualityScore: 1,
        didCompact: false,
      };
    }

    return winner;
  }
}
