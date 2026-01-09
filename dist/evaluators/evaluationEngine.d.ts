/**
 * Evaluation Engine
 * Calculates weighted scores for architectures based on constraints
 */
import { Architecture, Dimension, ValidatedConstraints, DimensionScore, ArchitectureEvaluation } from '../types';
/**
 * Calculate dimension score for a specific architecture and dimension
 * @param architecture - The architecture to evaluate
 * @param dimension - The dimension to evaluate
 * @param constraints - User constraints that affect weighting
 * @returns DimensionScore object with all fields populated
 */
export declare function calculateDimensionScore(architecture: Architecture, dimension: Dimension, constraints: ValidatedConstraints): DimensionScore;
/**
 * Evaluate a single architecture across all dimensions
 * @param architecture - The architecture to evaluate
 * @param constraints - User constraints that affect weighting
 * @returns ArchitectureEvaluation with all dimension scores and total
 */
export declare function evaluateArchitecture(architecture: Architecture, constraints: ValidatedConstraints): ArchitectureEvaluation;
/**
 * Evaluate all architectures based on constraints
 * @param constraints - User constraints that affect weighting
 * @returns Array of ArchitectureEvaluation objects for all four architectures
 */
export declare function evaluateArchitectures(constraints: ValidatedConstraints): ArchitectureEvaluation[];
/**
 * Get architecture evaluation by name
 * @param evaluations - Array of architecture evaluations
 * @param architecture - Architecture name to find
 * @returns ArchitectureEvaluation or undefined if not found
 */
export declare function getArchitectureEvaluation(evaluations: ArchitectureEvaluation[], architecture: Architecture): ArchitectureEvaluation | undefined;
/**
 * Calculate score difference between two architectures
 * @param eval1 - First architecture evaluation
 * @param eval2 - Second architecture evaluation
 * @returns Score difference (eval1.totalScore - eval2.totalScore)
 */
export declare function calculateScoreDifference(eval1: ArchitectureEvaluation, eval2: ArchitectureEvaluation): number;
//# sourceMappingURL=evaluationEngine.d.ts.map