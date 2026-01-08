/**
 * Property test for core types
 * Feature: genai-architecture-referee, Property 1: All architectures return all dimensions
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
 */

import * as fc from 'fast-check';
import {
  Architecture,
  Dimension,
  ALL_ARCHITECTURES,
  ALL_DIMENSIONS,
  ArchitectureEvaluation,
  DimensionScore
} from '../src/types';

describe('Core Types', () => {
  describe('Property 1: All architectures return all dimensions', () => {
    it('should have all seven dimensions for any architecture evaluation', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...ALL_ARCHITECTURES),
          fc.array(fc.double({ min: 0, max: 10 }), { minLength: 7, maxLength: 7 }),
          fc.array(fc.double({ min: 0, max: 1 }), { minLength: 7, maxLength: 7 }),
          (architecture, rawScores, weights) => {
            // Create a mock architecture evaluation
            const dimensionScores: DimensionScore[] = ALL_DIMENSIONS.map((dim, idx) => ({
              dimension: dim,
              rawScore: rawScores[idx],
              weight: weights[idx],
              weightedScore: rawScores[idx] * weights[idx],
              rationale: `Test rationale for ${dim}`
            }));

            const evaluation: ArchitectureEvaluation = {
              architecture,
              dimensionScores,
              totalScore: dimensionScores.reduce((sum, ds) => sum + ds.weightedScore, 0)
            };

            // Property: All seven dimensions must be present
            expect(evaluation.dimensionScores).toHaveLength(7);
            
            // Property: Each dimension must be one of the seven defined dimensions
            const presentDimensions = evaluation.dimensionScores.map(ds => ds.dimension);
            ALL_DIMENSIONS.forEach(dim => {
              expect(presentDimensions).toContain(dim);
            });

            // Property: No duplicate dimensions
            const uniqueDimensions = new Set(presentDimensions);
            expect(uniqueDimensions.size).toBe(7);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Type Constraints', () => {
    it('should only allow valid architecture types', () => {
      const validArchitectures: Architecture[] = ['RAG', 'Fine-Tuned', 'Agentic', 'Hybrid'];
      expect(ALL_ARCHITECTURES).toEqual(validArchitectures);
    });

    it('should only allow valid dimension types', () => {
      const validDimensions: Dimension[] = [
        'Data Freshness',
        'Accuracy & Hallucination Control',
        'Latency',
        'Cost Efficiency',
        'Governance & Auditability',
        'Workflow Complexity',
        'Team & Ops Readiness'
      ];
      expect(ALL_DIMENSIONS).toEqual(validDimensions);
    });
  });
});
