/**
 * Integration Tests for Complete Pipeline
 * Validates: All requirements
 */

import { compareArchitectures, compareArchitecturesJSON } from '../src/index';
import { UserConstraints } from '../src/types';
import { validateLanguageNeutrality } from '../src/validators/languageValidator';

describe('End-to-End Integration', () => {
  describe('RAG vs Hybrid - High Cost Sensitivity Scenario', () => {
    const constraints: UserConstraints = {
      dataChangeFrequency: 'high',
      accuracyRequirement: 'critical',
      costSensitivity: 'high'
    };

    it('should complete full pipeline without errors', () => {
      expect(() => compareArchitectures(constraints)).not.toThrow();
    });

    it('should produce valid output structure', () => {
      const output = compareArchitectures(constraints);

      expect(output.metadata).toBeDefined();
      expect(output.evaluations).toHaveLength(4);
      expect(output.pairwiseExplanations).toHaveLength(6);
      expect(output.dimensionSummaries).toHaveLength(7);
    });

    it('should show RAG scoring higher than Hybrid', () => {
      const output = compareArchitectures(constraints);

      const ragEval = output.evaluations.find(e => e.architecture === 'RAG')!;
      const hybridEval = output.evaluations.find(e => e.architecture === 'Hybrid')!;

      expect(ragEval.totalScore).toBeGreaterThan(hybridEval.totalScore);
    });

    it('should identify Cost Efficiency as primary driver', () => {
      const output = compareArchitectures(constraints);

      const ragHybridExplanation = output.pairwiseExplanations.find(
        pe => (pe.architecturePair[0] === 'RAG' && pe.architecturePair[1] === 'Hybrid') ||
              (pe.architecturePair[0] === 'Hybrid' && pe.architecturePair[1] === 'RAG')
      )!;

      const costComp = ragHybridExplanation.explanation.dimensionComparisons.find(
        dc => dc.dimension === 'Cost Efficiency'
      );

      expect(costComp).toBeDefined();
      expect(costComp!.description.toLowerCase()).toContain('high cost sensitivity');
    });

    it('should have no language violations in final output', () => {
      const output = compareArchitectures(constraints);

      let hasViolations = false;

      output.pairwiseExplanations.forEach(pe => {
        const summaryValidation = validateLanguageNeutrality(pe.explanation.summary);
        if (!summaryValidation.isValid) {
          hasViolations = true;
        }

        pe.explanation.dimensionComparisons.forEach(dc => {
          const validation = validateLanguageNeutrality(dc.description);
          if (!validation.isValid) {
            hasViolations = true;
          }
        });

        pe.explanation.conditionalGuidance.forEach(cg => {
          const validation = validateLanguageNeutrality(cg.characteristic);
          if (!validation.isValid) {
            hasViolations = true;
          }
        });
      });

      expect(hasViolations).toBe(false);
    });

    it('should produce valid JSON output', () => {
      const jsonString = compareArchitecturesJSON(constraints);

      expect(() => JSON.parse(jsonString)).not.toThrow();

      const parsed = JSON.parse(jsonString);
      expect(parsed.metadata).toBeDefined();
      expect(parsed.evaluations).toBeDefined();
      expect(parsed.pairwiseExplanations).toBeDefined();
      expect(parsed.dimensionSummaries).toBeDefined();
    });

    it('should match sample output structure', () => {
      const output = compareArchitectures(constraints);

      // Verify structure matches sample output
      expect(output.metadata.timestamp).toBeDefined();
      expect(output.metadata.constraints).toEqual(constraints);
      expect(output.metadata.architecturesEvaluated).toHaveLength(4);

      // Verify evaluations have correct structure
      output.evaluations.forEach(evaluation => {
        expect(evaluation.architecture).toBeDefined();
        expect(evaluation.totalScore).toBeDefined();
        expect(evaluation.dimensionScores).toHaveLength(7);

        evaluation.dimensionScores.forEach(ds => {
          expect(ds.dimension).toBeDefined();
          expect(ds.rawScore).toBeGreaterThanOrEqual(0);
          expect(ds.rawScore).toBeLessThanOrEqual(10);
          expect(ds.weight).toBeGreaterThan(0);
          expect(ds.weight).toBeLessThanOrEqual(1);
          expect(ds.weightedScore).toBeDefined();
          expect(ds.rationale).toBeDefined();
        });
      });

      // Verify pairwise explanations have correct structure
      output.pairwiseExplanations.forEach(pe => {
        expect(pe.architecturePair).toHaveLength(2);
        expect(pe.explanation.summary).toBeDefined();
        expect(pe.explanation.dimensionComparisons).toBeDefined();
        expect(pe.explanation.tradeoffAnalysis).toHaveLength(2);
        expect(pe.explanation.conditionalGuidance).toBeDefined();
      });
    });

    it('should explain constraint weighting impact', () => {
      const output = compareArchitectures(constraints);

      const ragHybridExplanation = output.pairwiseExplanations.find(
        pe => (pe.architecturePair[0] === 'RAG' && pe.architecturePair[1] === 'Hybrid') ||
              (pe.architecturePair[0] === 'Hybrid' && pe.architecturePair[1] === 'RAG')
      )!;

      const allText = JSON.stringify(ragHybridExplanation.explanation).toLowerCase();
      expect(allText).toContain('high cost sensitivity');
      expect(allText).toContain('0.25');
    });
  });

  describe('Multiple Constraint Scenarios', () => {
    it('should handle low cost sensitivity', () => {
      const constraints: UserConstraints = {
        dataChangeFrequency: 'low',
        accuracyRequirement: 'low',
        costSensitivity: 'low'
      };

      expect(() => compareArchitectures(constraints)).not.toThrow();
      const output = compareArchitectures(constraints);
      expect(output.evaluations).toHaveLength(4);
    });

    it('should handle critical accuracy requirement', () => {
      const constraints: UserConstraints = {
        dataChangeFrequency: 'low',
        accuracyRequirement: 'critical',
        costSensitivity: 'low'
      };

      expect(() => compareArchitectures(constraints)).not.toThrow();
      const output = compareArchitectures(constraints);
      expect(output.evaluations).toHaveLength(4);
    });

    it('should handle high data change frequency', () => {
      const constraints: UserConstraints = {
        dataChangeFrequency: 'high',
        accuracyRequirement: 'low',
        costSensitivity: 'low'
      };

      expect(() => compareArchitectures(constraints)).not.toThrow();
      const output = compareArchitectures(constraints);
      expect(output.evaluations).toHaveLength(4);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid constraints', () => {
      const invalidConstraints = {
        dataChangeFrequency: 'invalid',
        accuracyRequirement: 'critical',
        costSensitivity: 'high'
      };

      expect(() => compareArchitectures(invalidConstraints as any)).toThrow();
    });

    it('should throw error for missing constraints', () => {
      const incompleteConstraints = {
        dataChangeFrequency: 'high',
        accuracyRequirement: 'critical'
        // missing costSensitivity
      };

      expect(() => compareArchitectures(incompleteConstraints as any)).toThrow();
    });
  });
});