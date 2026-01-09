"use strict";
/**
 * Evaluation Engine
 * Calculates weighted scores for architectures based on constraints
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDimensionScore = calculateDimensionScore;
exports.evaluateArchitecture = evaluateArchitecture;
exports.evaluateArchitectures = evaluateArchitectures;
exports.getArchitectureEvaluation = getArchitectureEvaluation;
exports.calculateScoreDifference = calculateScoreDifference;
const types_1 = require("../types");
const scoringMatrix_1 = require("../data/scoringMatrix");
const weightingConfig_1 = require("../data/weightingConfig");
/**
 * Calculate dimension score for a specific architecture and dimension
 * @param architecture - The architecture to evaluate
 * @param dimension - The dimension to evaluate
 * @param constraints - User constraints that affect weighting
 * @returns DimensionScore object with all fields populated
 */
function calculateDimensionScore(architecture, dimension, constraints) {
    // Get base score and rationale from scoring matrix
    const architectureData = scoringMatrix_1.SCORING_MATRIX.architectures[architecture];
    const dimensionData = architectureData.dimensions[dimension];
    // Get dimension weights based on constraints
    const weights = (0, weightingConfig_1.getDimensionWeights)(constraints.costSensitivity, constraints.accuracyRequirement, constraints.dataChangeFrequency);
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
function evaluateArchitecture(architecture, constraints) {
    // Calculate dimension scores for all seven dimensions
    const dimensionScores = types_1.ALL_DIMENSIONS.map(dimension => calculateDimensionScore(architecture, dimension, constraints));
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
function evaluateArchitectures(constraints) {
    return types_1.ALL_ARCHITECTURES.map(architecture => evaluateArchitecture(architecture, constraints));
}
/**
 * Get architecture evaluation by name
 * @param evaluations - Array of architecture evaluations
 * @param architecture - Architecture name to find
 * @returns ArchitectureEvaluation or undefined if not found
 */
function getArchitectureEvaluation(evaluations, architecture) {
    return evaluations.find(evaluation => evaluation.architecture === architecture);
}
/**
 * Calculate score difference between two architectures
 * @param eval1 - First architecture evaluation
 * @param eval2 - Second architecture evaluation
 * @returns Score difference (eval1.totalScore - eval2.totalScore)
 */
function calculateScoreDifference(eval1, eval2) {
    return eval1.totalScore - eval2.totalScore;
}
//# sourceMappingURL=evaluationEngine.js.map