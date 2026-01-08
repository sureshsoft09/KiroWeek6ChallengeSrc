/**
 * Tests for Explanation Generator
 * Validates: Requirements 6.1, 6.2, 6.3, 7.1, 7.2, 7.4
 */

import {
  generatePairwiseExplanation,
  generateDimensionComparisons,
  generateTradeoffAnalysis,
  generateConditionalGuidance,
  generateSummary,
  generateWeightingContext
} from '../src/generators/explanationGenerator';
import { evaluateArchitectures } from '../src/evaluators/evaluationEngine';
import { ValidatedConstraints, ExplanationContext } from '../src/types';
import { validateLanguageNeutrality, validateTradeoffBalance } from '../src/validators/languageValidator';

describe('Explanation Generator', () => {
  const highCostConstraints: ValidatedConstraints = {
    dataChangeFrequency: 'high',
    accuracyRequirement: 'critical',
    costSensitivity: 'high'
  };

  describe('RAG vs Hybrid under high cost sensitivity', () => {
    let context: ExplanationContext;

    beforeEach(() => {
      const evaluations = evaluateArchitectures(highCostConstraints);
      const ragEval = evaluations.find(e => e.architecture === 'RAG')!;
      const hybridEval = evaluations.find(e => e.architecture === 'Hybrid')!;

      context = {
        architecture1: ragEval,
        architecture2: hybridEval,
        constraints: highCostConstraints,
        scoreDifference: ragEval.totalScore - hybridEval.totalScore
      };
    });

    it('should generate complete explanation with all components', () => {
      const explanation = generatePairwiseExplanation(context);

      expect(explanation.summary).toBeDefined();
      expect(explanation.dimensionComparisons).toBeDefined();
      expect(explanation.tradeoffAnalysis).toBeDefined();
      expect(explanation.conditionalGuidance).toBeDefined();

      expect(explanation.dimensionComparisons.length).toBeGreaterThan(0);
      expect(explanation.tradeoffAnalysis.length).toBe(2); // One for each architecture
      expect(explanation.conditionalGuidance.length).toBeGreaterThan(0);
    });

    it('should identify Cost Efficiency as primary driver', () => {
      const dimensionComparisons = generateDimensionComparisons(context);

      // Cost Efficiency should be in the comparisons
      const costComp = dimensionComparisons.find(dc => dc.dimension === 'Cost Efficiency');
      expect(costComp).toBeDefined();

      // Should have significant delta
      expect(Math.abs(costComp!.delta)).toBeGreaterThanOrEqual(2);

      // Should reference high cost sensitivity in description
      expect(costComp!.description).toContain('high cost sensitivity');
      expect(costComp!.description).toContain('Cost Efficiency');
    });

    it('should explain constraint weighting impact', () => {
      const dimensionComparisons = generateDimensionComparisons(context);
      const weightingContext = generateWeightingContext(context, dimensionComparisons);

      expect(weightingContext).toContain('high cost sensitivity');
      expect(weightingContext).toContain('0.25');
      expect(weightingContext).toContain('Cost Efficiency');
    });

    it('should use neutral language in all explanations', () => {
      const explanation = generatePairwiseExplanation(context);

      // Check summary
      const summaryValidation = validateLanguageNeutrality(explanation.summary);
      expect(summaryValidation.isValid).toBe(true);

      // Check dimension comparisons
      explanation.dimensionComparisons.forEach(dc => {
        const validation = validateLanguageNeutrality(dc.description);
        expect(validation.isValid).toBe(true);
      });

      // Check conditional guidance
      explanation.conditionalGuidance.forEach(cg => {
        const validation = validateLanguageNeutrality(cg.characteristic);
        expect(validation.isValid).toBe(true);
      });
    });

    it('should include trade-offs with both gains and sacrifices', () => {
      const tradeoffAnalysis = generateTradeoffAnalysis(context);

      expect(tradeoffAnalysis).toHaveLength(2);

      tradeoffAnalysis.forEach(statement => {
        expect(validateTradeoffBalance(statement.gains, statement.sacrifices)).toBe(true);
        expect(statement.gains.length).toBeGreaterThan(0);
        expect(statement.sacrifices.length).toBeGreaterThan(0);
      });
    });

    it('should generate valid conditional statements', () => {
      const conditionalGuidance = generateConditionalGuidance(context);

      expect(conditionalGuidance.length).toBeGreaterThan(0);

      conditionalGuidance.forEach(statement => {
        // Should start with IF
        expect(statement.condition.toLowerCase()).toContain('if');

        // Should not contain recommendation language
        const validation = validateLanguageNeutrality(statement.characteristic);
        expect(validation.isValid).toBe(true);
      });
    });

    it('should show RAG scoring higher than Hybrid', () => {
      expect(context.scoreDifference).toBeGreaterThan(0);
      expect(context.architecture1.totalScore).toBeGreaterThan(context.architecture2.totalScore);
    });

    it('should quantify score differences accurately', () => {
      const summary = generateSummary(context);

      // Should mention both architectures
      expect(summary).toContain('RAG');
      expect(summary).toContain('Hybrid');

      // Should quantify the difference
      const scoreDiff = context.scoreDifference.toFixed(2);
      expect(summary).toContain(scoreDiff);
    });
  });

  describe('Dimension Comparison Generation', () => {
    it('should only include significant differences', () => {
      const evaluations = evaluateArchitectures(highCostConstraints);
      const ragEval = evaluations.find(e => e.architecture === 'RAG')!;
      const hybridEval = evaluations.find(e => e.architecture === 'Hybrid')!;

      const context: ExplanationContext = {
        architecture1: ragEval,
        architecture2: hybridEval,
        constraints: highCostConstraints,
        scoreDifference: ragEval.totalScore - hybridEval.totalScore
      };

      const comparisons = generateDimensionComparisons(context);

      // All comparisons should have significant deltas
      comparisons.forEach(comp => {
        const hasSignificantWeightedDelta = Math.abs(comp.delta * comp.weight) >= 1.0;
        const hasSignificantRawDelta = Math.abs(comp.delta) >= 2;
        expect(hasSignificantWeightedDelta || hasSignificantRawDelta).toBe(true);
      });
    });

    it('should sort comparisons by delta magnitude', () => {
      const evaluations = evaluateArchitectures(highCostConstraints);
      const ragEval = evaluations.find(e => e.architecture === 'RAG')!;
      const hybridEval = evaluations.find(e => e.architecture === 'Hybrid')!;

      const context: ExplanationContext = {
        architecture1: ragEval,
        architecture2: hybridEval,
        constraints: highCostConstraints,
        scoreDifference: ragEval.totalScore - hybridEval.totalScore
      };

      const comparisons = generateDimensionComparisons(context);

      // Verify sorted by absolute delta (descending)
      for (let i = 0; i < comparisons.length - 1; i++) {
        const currentAbsDelta = Math.abs(comparisons[i].delta);
        const nextAbsDelta = Math.abs(comparisons[i + 1].delta);
        expect(currentAbsDelta).toBeGreaterThanOrEqual(nextAbsDelta);
      }
    });
  });

  describe('Constraint Reference', () => {
    it('should reference high cost sensitivity in Cost Efficiency descriptions', () => {
      const evaluations = evaluateArchitectures(highCostConstraints);
      const ragEval = evaluations.find(e => e.architecture === 'RAG')!;
      const hybridEval = evaluations.find(e => e.architecture === 'Hybrid')!;

      const context: ExplanationContext = {
        architecture1: ragEval,
        architecture2: hybridEval,
        constraints: highCostConstraints,
        scoreDifference: ragEval.totalScore - hybridEval.totalScore
      };

      const comparisons = generateDimensionComparisons(context);
      const costComp = comparisons.find(dc => dc.dimension === 'Cost Efficiency');

      if (costComp) {
        expect(costComp.description.toLowerCase()).toContain('high cost sensitivity');
        expect(costComp.description).toContain('0.25');
      }
    });
  });
});


describe('Property Tests', () => {
  describe('Property 8: Constraint reference in explanations', () => {
    it('should reference constraints in explanations when constraints are provided', () => {
      const constraintCombinations = [
        { dataChangeFrequency: 'high' as const, accuracyRequirement: 'critical' as const, costSensitivity: 'high' as const, expectedKeyword: 'high cost sensitivity' },
        { dataChangeFrequency: 'low' as const, accuracyRequirement: 'critical' as const, costSensitivity: 'low' as const, expectedKeyword: 'critical accuracy' }
      ];

      constraintCombinations.forEach(({ dataChangeFrequency, accuracyRequirement, costSensitivity, expectedKeyword }) => {
        const constraints: ValidatedConstraints = {
          dataChangeFrequency,
          accuracyRequirement,
          costSensitivity
        };

        const evaluations = evaluateArchitectures(constraints);
        const ragEval = evaluations.find(e => e.architecture === 'RAG')!;
        const hybridEval = evaluations.find(e => e.architecture === 'Hybrid')!;

        const context: ExplanationContext = {
          architecture1: ragEval,
          architecture2: hybridEval,
          constraints,
          scoreDifference: ragEval.totalScore - hybridEval.totalScore
        };

        const explanation = generatePairwiseExplanation(context);
        const allText = JSON.stringify(explanation).toLowerCase();

        // Property: Explanation must reference the constraint
        expect(allText).toContain(expectedKeyword.toLowerCase());
      });
    });
  });
});
