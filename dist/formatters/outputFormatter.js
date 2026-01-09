"use strict";
/**
 * Output Formatter
 * Structures evaluation results and explanations into final JSON output
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildComparisonOutput = buildComparisonOutput;
exports.serializeToJSON = serializeToJSON;
exports.validateJSON = validateJSON;
const types_1 = require("../types");
const explanationGenerator_1 = require("../generators/explanationGenerator");
/**
 * Build comparison output with all evaluations and explanations
 */
function buildComparisonOutput(evaluations, constraints) {
    // Generate pairwise explanations for all architecture pairs
    const pairwiseExplanations = [];
    for (let i = 0; i < evaluations.length; i++) {
        for (let j = i + 1; j < evaluations.length; j++) {
            const arch1 = evaluations[i];
            const arch2 = evaluations[j];
            const explanation = (0, explanationGenerator_1.generatePairwiseExplanation)({
                architecture1: arch1,
                architecture2: arch2,
                constraints,
                scoreDifference: arch1.totalScore - arch2.totalScore
            });
            pairwiseExplanations.push({
                architecturePair: [arch1.architecture, arch2.architecture],
                explanation
            });
        }
    }
    // Generate dimension summaries
    const dimensionSummaries = generateDimensionSummaries(evaluations);
    return {
        metadata: {
            timestamp: new Date().toISOString(),
            constraints,
            architecturesEvaluated: types_1.ALL_ARCHITECTURES
        },
        evaluations,
        pairwiseExplanations,
        dimensionSummaries
    };
}
/**
 * Generate cross-architecture comparison summaries for each dimension
 */
function generateDimensionSummaries(evaluations) {
    const summaries = [];
    types_1.ALL_DIMENSIONS.forEach(dimension => {
        // Get scores for this dimension across all architectures
        const scores = evaluations.map(evaluation => {
            const dimScore = evaluation.dimensionScores.find(ds => ds.dimension === dimension);
            return {
                architecture: evaluation.architecture,
                rawScore: dimScore.rawScore,
                weightedScore: dimScore.weightedScore
            };
        });
        // Sort by raw score (descending)
        scores.sort((a, b) => b.rawScore - a.rawScore);
        // Generate comparison text
        const comparison = generateDimensionSummaryText(dimension, scores);
        summaries.push({
            dimension,
            crossArchitectureComparison: comparison
        });
    });
    return summaries;
}
/**
 * Generate summary text for a dimension across architectures
 */
function generateDimensionSummaryText(dimension, scores) {
    const highest = scores[0];
    const lowest = scores[scores.length - 1];
    let summary = `In ${dimension}, `;
    summary += `${highest.architecture} scores highest (${highest.rawScore}/10), `;
    summary += `while ${lowest.architecture} scores lowest (${lowest.rawScore}/10). `;
    // Add context about what this dimension measures
    const dimensionContext = getDimensionContext(dimension);
    if (dimensionContext) {
        summary += dimensionContext;
    }
    return summary;
}
/**
 * Get context about what a dimension measures
 */
function getDimensionContext(dimension) {
    const contexts = {
        'Data Freshness': 'This dimension reflects the ability to access and incorporate recently updated information.',
        'Accuracy & Hallucination Control': 'This dimension reflects the ability to produce accurate outputs and minimize hallucinations.',
        'Latency': 'This dimension reflects response time and processing speed.',
        'Cost Efficiency': 'This dimension reflects per-query operational costs.',
        'Governance & Auditability': 'This dimension reflects visibility into decision-making processes and audit trail quality.',
        'Workflow Complexity': 'This dimension reflects implementation and operational complexity (higher scores indicate lower complexity).',
        'Team & Ops Readiness': 'This dimension reflects the learning curve and operational expertise required.'
    };
    return contexts[dimension] || '';
}
/**
 * Serialize comparison output to JSON string
 */
function serializeToJSON(output) {
    return JSON.stringify(output, null, 2);
}
/**
 * Validate that output is valid JSON
 */
function validateJSON(jsonString) {
    try {
        JSON.parse(jsonString);
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=outputFormatter.js.map