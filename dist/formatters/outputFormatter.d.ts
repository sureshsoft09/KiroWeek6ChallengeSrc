/**
 * Output Formatter
 * Structures evaluation results and explanations into final JSON output
 */
import { ComparisonOutput, ArchitectureEvaluation, ValidatedConstraints } from '../types';
/**
 * Build comparison output with all evaluations and explanations
 */
export declare function buildComparisonOutput(evaluations: ArchitectureEvaluation[], constraints: ValidatedConstraints): ComparisonOutput;
/**
 * Serialize comparison output to JSON string
 */
export declare function serializeToJSON(output: ComparisonOutput): string;
/**
 * Validate that output is valid JSON
 */
export declare function validateJSON(jsonString: string): boolean;
//# sourceMappingURL=outputFormatter.d.ts.map