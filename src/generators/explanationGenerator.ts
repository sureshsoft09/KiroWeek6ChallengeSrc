/**
 * Explanation Generator
 * Generates neutral explanations for architecture comparisons
 */

import {
  ValidatedConstraints,
  Explanation,
  DimensionComparison,
  TradeoffStatement,
  ConditionalStatement,
  ExplanationContext,
  Dimension,
  Architecture,
  ALL_DIMENSIONS
} from '../types';
import { SCORING_MATRIX } from '../data/scoringMatrix';
import { getDimensionWeights } from '../data/weightingConfig';

/**
 * Threshold for significant dimension differences
 */
const SIGNIFICANT_DELTA_THRESHOLD = 1.0;

/**
 * Generate dimension comparisons between two architectures
 * Identifies significant differences and generates neutral descriptions
 */
export function generateDimensionComparisons(
  context: ExplanationContext
): DimensionComparison[] {
  const { architecture1, architecture2, constraints } = context;
  
  const comparisons: DimensionComparison[] = [];
  
  // Get dimension weights for context
  const weights = getDimensionWeights(
    constraints.costSensitivity,
    constraints.accuracyRequirement,
    constraints.dataChangeFrequency
  );
  
  // Compare each dimension
  ALL_DIMENSIONS.forEach(dimension => {
    const score1 = architecture1.dimensionScores.find(ds => ds.dimension === dimension)!;
    const score2 = architecture2.dimensionScores.find(ds => ds.dimension === dimension)!;
    
    const delta = score1.weightedScore - score2.weightedScore;
    const rawDelta = score1.rawScore - score2.rawScore;
    
    // Only include significant differences
    if (Math.abs(delta) >= SIGNIFICANT_DELTA_THRESHOLD || Math.abs(rawDelta) >= 2) {
      const description = generateDimensionDescription(
        dimension,
        architecture1.architecture,
        architecture2.architecture,
        score1.rawScore,
        score2.rawScore,
        rawDelta,
        delta,
        weights[dimension],
        constraints
      );
      
      comparisons.push({
        dimension,
        weight: weights[dimension],
        architecture1Score: score1.rawScore,
        architecture2Score: score2.rawScore,
        delta: rawDelta,
        description
      });
    }
  });
  
  // Sort by absolute delta (largest differences first)
  comparisons.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  
  return comparisons;
}

/**
 * Generate neutral description for a dimension comparison
 */
function generateDimensionDescription(
  dimension: Dimension,
  arch1: string,
  arch2: string,
  score1: number,
  score2: number,
  rawDelta: number,
  weightedDelta: number,
  weight: number,
  constraints: ValidatedConstraints
): string {
  const higherArch = rawDelta > 0 ? arch1 : arch2;
  const lowerArch = rawDelta > 0 ? arch2 : arch1;
  const higherScore = Math.max(score1, score2);
  const lowerScore = Math.min(score1, score2);
  const absDelta = Math.abs(rawDelta);
  const absWeightedDelta = Math.abs(weightedDelta);
  
  // Get characteristics from scoring matrix
  const higherArchData = SCORING_MATRIX.architectures[higherArch as Architecture];
  const lowerArchData = SCORING_MATRIX.architectures[lowerArch as Architecture];
  const higherDimData = higherArchData.dimensions[dimension];
  const lowerDimData = lowerArchData.dimensions[dimension];
  
  let description = '';
  
  // Add constraint context if this dimension has increased weight
  const constraintContext = getConstraintContext(dimension, weight, constraints);
  if (constraintContext) {
    description += constraintContext + ' ';
  }
  
  // Main comparison statement
  description += `${higherArch} scores ${absDelta} point${absDelta !== 1 ? 's' : ''} higher in ${dimension} (${higherScore}/10 vs ${lowerScore}/10). `;
  
  // Add rationale for each architecture
  description += `${higherArch} ${extractKeyPhrase(higherDimData.rationale)}. `;
  description += `${lowerArch} ${extractKeyPhrase(lowerDimData.rationale)}. `;
  
  // Add weighted impact
  description += `This difference contributes ${absWeightedDelta.toFixed(2)} weighted points in ${higherArch}'s favor.`;
  
  return description;
}

/**
 * Extract key phrase from rationale (lowercase first word)
 */
function extractKeyPhrase(rationale: string): string {
  // Make first character lowercase for better flow
  return rationale.charAt(0).toLowerCase() + rationale.slice(1);
}

/**
 * Get constraint context explanation if dimension weight is increased
 */
function getConstraintContext(
  dimension: Dimension,
  weight: number,
  constraints: ValidatedConstraints
): string | null {
  // Check if this dimension has increased weight due to constraints
  if (dimension === 'Cost Efficiency' && constraints.costSensitivity === 'high' && weight === 0.25) {
    return `Under high cost sensitivity, the Cost Efficiency dimension receives increased weight (${weight}).`;
  }
  
  if (dimension === 'Accuracy & Hallucination Control' && constraints.accuracyRequirement === 'critical' && weight === 0.30) {
    return `Under critical accuracy requirements, the Accuracy & Hallucination Control dimension receives increased weight (${weight}).`;
  }
  
  if (dimension === 'Data Freshness' && constraints.dataChangeFrequency === 'high' && weight === 0.25) {
    return `Under high data change frequency, the Data Freshness dimension receives increased weight (${weight}).`;
  }
  
  return null;
}

/**
 * Generate trade-off analysis for architectures
 */
export function generateTradeoffAnalysis(
  context: ExplanationContext
): TradeoffStatement[] {
  const { architecture1, architecture2 } = context;
  
  const statements: TradeoffStatement[] = [];
  
  // Get trade-offs from scoring matrix
  [architecture1, architecture2].forEach(archEval => {
    const archData = SCORING_MATRIX.architectures[archEval.architecture];
    
    // Aggregate gains and sacrifices across all dimensions
    const allGains: string[] = [];
    const allSacrifices: string[] = [];
    
    ALL_DIMENSIONS.forEach(dimension => {
      const dimData = archData.dimensions[dimension];
      allGains.push(...dimData.tradeoffs.gains);
      allSacrifices.push(...dimData.tradeoffs.sacrifices);
    });
    
    // Deduplicate
    const uniqueGains = Array.from(new Set(allGains));
    const uniqueSacrifices = Array.from(new Set(allSacrifices));
    
    statements.push({
      architecture: archEval.architecture,
      gains: uniqueGains,
      sacrifices: uniqueSacrifices
    });
  });
  
  return statements;
}

/**
 * Generate conditional guidance statements
 */
export function generateConditionalGuidance(
  context: ExplanationContext
): ConditionalStatement[] {
  const { architecture1, architecture2, constraints } = context;
  const statements: ConditionalStatement[] = [];
  
  // Generate conditionals based on constraints and architecture characteristics
  [architecture1, architecture2].forEach(archEval => {
    const archData = SCORING_MATRIX.architectures[archEval.architecture];
    
    // Cost-related conditionals
    if (constraints.costSensitivity === 'high') {
      const costData = archData.dimensions['Cost Efficiency'];
      statements.push({
        condition: 'IF cost per query is a primary constraint',
        architecture: archEval.architecture,
        characteristic: `${archEval.architecture} ${extractKeyPhrase(costData.rationale)}`
      });
    }
    
    // Accuracy-related conditionals
    if (constraints.accuracyRequirement === 'critical' || constraints.accuracyRequirement === 'high') {
      const accuracyData = archData.dimensions['Accuracy & Hallucination Control'];
      statements.push({
        condition: 'IF accuracy and hallucination control are critical',
        architecture: archEval.architecture,
        characteristic: `${archEval.architecture} ${extractKeyPhrase(accuracyData.rationale)}`
      });
    }
    
    // Complexity-related conditionals
    const complexityData = archData.dimensions['Workflow Complexity'];
    if (complexityData.baseScore >= 7) {
      statements.push({
        condition: 'IF operational simplicity is valued',
        architecture: archEval.architecture,
        characteristic: `${archEval.architecture} ${extractKeyPhrase(complexityData.rationale)}`
      });
    }
    
    // Governance-related conditionals
    const governanceData = archData.dimensions['Governance & Auditability'];
    if (governanceData.baseScore >= 7) {
      statements.push({
        condition: 'IF governance and auditability are required',
        architecture: archEval.architecture,
        characteristic: `${archEval.architecture} ${extractKeyPhrase(governanceData.rationale)}`
      });
    }
    
    // Latency-related conditionals
    const latencyData = archData.dimensions['Latency'];
    if (latencyData.baseScore >= 7) {
      statements.push({
        condition: 'IF response time is latency-sensitive',
        architecture: archEval.architecture,
        characteristic: `${archEval.architecture} ${extractKeyPhrase(latencyData.rationale)}`
      });
    }
  });
  
  return statements;
}

/**
 * Generate summary statement
 */
export function generateSummary(context: ExplanationContext): string {
  const { architecture1, architecture2, scoreDifference } = context;
  
  const higherArch = scoreDifference > 0 ? architecture1.architecture : architecture2.architecture;
  const lowerArch = scoreDifference > 0 ? architecture2.architecture : architecture1.architecture;
  const absDiff = Math.abs(scoreDifference);
  
  return `${higherArch} and ${lowerArch} differ by ${absDiff.toFixed(2)} total points under the provided constraints. This divergence stems primarily from differences in dimension scores where constraint weighting amplifies the impact of architectural characteristics.`;
}

/**
 * Generate weighting context explanation
 */
export function generateWeightingContext(
  context: ExplanationContext,
  dimensionComparisons: DimensionComparison[]
): string {
  const { constraints, scoreDifference } = context;
  
  let explanation = '';
  
  // Identify primary constraint
  if (constraints.costSensitivity === 'high') {
    explanation += 'Under high cost sensitivity, the Cost Efficiency dimension weight increases from 0.125 (balanced) to 0.25, doubling its influence on total scores. ';
    
    // Find cost efficiency comparison
    const costComp = dimensionComparisons.find(dc => dc.dimension === 'Cost Efficiency');
    if (costComp) {
      const weightedContribution = Math.abs(costComp.delta * costComp.weight);
      explanation += `The ${Math.abs(costComp.delta)}-point difference in Cost Efficiency translates to ${weightedContribution.toFixed(2)} weighted points, `;
      
      const percentageOfGap = (weightedContribution / Math.abs(scoreDifference)) * 100;
      if (percentageOfGap > 50) {
        explanation += `accounting for ${percentageOfGap.toFixed(0)}% of the total score gap. `;
      } else {
        explanation += `contributing significantly to the score difference. `;
      }
    }
  } else if (constraints.accuracyRequirement === 'critical') {
    explanation += 'Under critical accuracy requirements, the Accuracy & Hallucination Control dimension weight increases to 0.30, significantly amplifying accuracy-related differences. ';
  } else if (constraints.dataChangeFrequency === 'high') {
    explanation += 'Under high data change frequency, the Data Freshness dimension weight increases to 0.25, emphasizing the importance of real-time data access. ';
  }
  
  explanation += 'Without this weighting adjustment, the architectures would score more similarly, with other dimensional advantages offsetting the differences.';
  
  return explanation;
}

/**
 * Generate complete pairwise explanation
 */
export function generatePairwiseExplanation(
  context: ExplanationContext
): Explanation {
  const dimensionComparisons = generateDimensionComparisons(context);
  const tradeoffAnalysis = generateTradeoffAnalysis(context);
  const conditionalGuidance = generateConditionalGuidance(context);
  const summary = generateSummary(context);
  
  return {
    summary,
    dimensionComparisons,
    tradeoffAnalysis,
    conditionalGuidance
  };
}
