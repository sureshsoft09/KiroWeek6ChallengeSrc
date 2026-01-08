/**
 * Evaluation Engine
 * Calculates weighted scores for architectures based on constraints
 */

import {
  Architecture,
  Dimension,
  ValidatedConstraints,
  DimensionScore,
  ArchitectureEvaluation,
  ALL_ARCHITECTURES,
  ALL_DIMENSIONS
} from '../types';
import { SCORING_MATRIX } from '../data/scoringMatrix';
import { getDimensionWeights } from '../data/weightingConfig';

/**
 * Calculate dimension score for a specific architecture and dimension
 * @param architecture - The architecture to evaluate
 * @param dimension - The dimension to evaluate
 * @param constraints - User constraints that affect weighting
 * @returns DimensionScore object with all fields populated
 */
export function calculateDimensionScore(
  architecture: Architecture,
  dimension: Dimension,
  constraints: ValidatedConstraints
): DimensionScore {
  // Get base score and rationale from scoring matrix
  const architectureData = SCORING_MATRIX.architectures[architecture];
  const dimensionData = architectureData.dimensions[dimension];
  
  // Get dimension weights based on constraints
  const weights = getDimensionWeights(
    constraints.costSensitivity,
    constraints.accuracyRequirement,
    constraints.dataChangeFrequency
  );
  
  const weight = weights[dimension];
  const rawScore = dimensionData.baseScore;
  const weightedScore = rawScore * weight;
  
  return {
    dimension,
    rawScore,
    weight,
    weightedScore,
    rationale: dimensionData.rationale
  };
}

/**
 * Evaluate a single architecture across all dimensions
 * @param architecture - The architecture to evaluate
 * @param constraints - User constraints that affect weighting
 * @returns ArchitectureEvaluation with all dimension scores and total
 */
export function evaluateArchitecture(
  architecture: Architecture,
  constraints: ValidatedConstraints
): ArchitectureEvaluation {
  // Calculate dimension scores for all seven dimensions
  const dimensionScores: DimensionScore[] = ALL_DIMENSIONS.map(dimension =>
    calculateDimensionScore(architecture, dimension, constraints)
  );
  
  // Calculate total score as sum of weighted scores
  const totalScore = dimensionScores.reduce((sum, ds) => sum + ds.weightedScore, 0);
  
  return {
    architecture,
    dimensionScores,
    totalScore
  };
}

/**
 * Evaluate all architectures based on constraints
 * @param constraints - User constraints that affect weighting
 * @returns Array of ArchitectureEvaluation objects for all four architectures
 */
export function evaluateArchitectures(
  constraints: ValidatedConstraints
): ArchitectureEvaluation[] {
  return ALL_ARCHITECTURES.map(architecture =>
    evaluateArchitecture(architecture, constraints)
  );
}

/**
 * Get architecture evaluation by name
 * @param evaluations - Array of architecture evaluations
 * @param architecture - Architecture name to find
 * @returns ArchitectureEvaluation or undefined if not found
 */
export function getArchitectureEvaluation(
  evaluations: ArchitectureEvaluation[],
  architecture: Architecture
): ArchitectureEvaluation | undefined {
  return evaluations.find(evaluation => evaluation.architecture === architecture);
}

/**
 * Calculate score difference between two architectures
 * @param eval1 - First architecture evaluation
 * @param eval2 - Second architecture evaluation
 * @returns Score difference (eval1.totalScore - eval2.totalScore)
 */
export function calculateScoreDifference(
  eval1: ArchitectureEvaluation,
  eval2: ArchitectureEvaluation
): number {
  return eval1.totalScore - eval2.totalScore;
}