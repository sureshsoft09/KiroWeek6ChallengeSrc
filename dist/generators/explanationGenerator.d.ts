/**
 * Explanation Generator
 * Generates neutral explanations for architecture comparisons
 */
import { Explanation, DimensionComparison, TradeoffStatement, ConditionalStatement, ExplanationContext } from '../types';
/**
 * Generate dimension comparisons between two architectures
 * Identifies significant differences and generates neutral descriptions
 */
export declare function generateDimensionComparisons(context: ExplanationContext): DimensionComparison[];
/**
 * Generate trade-off analysis for architectures
 */
export declare function generateTradeoffAnalysis(context: ExplanationContext): TradeoffStatement[];
/**
 * Generate conditional guidance statements
 */
export declare function generateConditionalGuidance(context: ExplanationContext): ConditionalStatement[];
/**
 * Generate summary statement
 */
export declare function generateSummary(context: ExplanationContext): string;
/**
 * Generate weighting context explanation
 */
export declare function generateWeightingContext(context: ExplanationContext, dimensionComparisons: DimensionComparison[]): string;
/**
 * Generate complete pairwise explanation
 */
export declare function generatePairwiseExplanation(context: ExplanationContext): Explanation;
//# sourceMappingURL=explanationGenerator.d.ts.map