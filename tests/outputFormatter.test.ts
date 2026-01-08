/**
 * Tests for Output Formatter
 * Feature: genai-architecture-referee, Property 5: Output structure completeness
 * Validates: Requirements 5.1, 5.2, 5.3, 5.5
 */

import * as fc from 'fast-check';
import {
  buildComparisonOutput,
  serializeToJSON,
  validateJSON
} from '../src/formatters/outputFormatter';
import { evaluateArchitectures } from '../src/evaluators/evaluationEngine';
import { ValidatedConstraints, ALL_ARCHITECTURES, ALL_DIMENSIONS } from '../src/types';

describe('Output Formatter', () => {
  const highCostConstraints: ValidatedConstraints = {
    dataChangeFrequency: 'high',
    accuracyRequirement: 'critical',
    costSensitivity: 'high'
  };

  describe('Property 5: Output structure completeness', () => {
    it('should have complete structure for any valid constraints', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('low', 'medium', 'high'),
          fc.constantFrom('low', 'medium', 'high', 'critical'),
          fc.constantFrom('low', 'medium', 'high'),
          (dataChangeFrequency, accuracyRequirement, costSensitivity) => {
            const constraints: ValidatedConstraints = {
              dataChangeFrequency: dataChangeFrequency as any,
              accuracyRequirement: accuracyRequirement as any,
              costSensitivity: costSensitivity as any
            };

            const evaluations = evaluateArchitectures(constraints);
            const output = buildComparisonOutput(evaluations, constraints);

            // Property: Output must have all required top-level fields
            expect(output.metadata).toBeDefined();
            expect(output.evaluations).toBeDefined();
            expect(output.pairwiseExplanations).toBeDefined();
            expect(output.dimensionSummaries).toBeDefined();

            // Property: Metadata must include timestamp, constraints, and architectures
            expect(output.metadata.timestamp).toBeDefined();
            expect(output.metadata.constraints).toEqual(constraints);
            expect(output.metadata.architecturesEvaluated).toEqual(ALL_ARCHITECTURES);

            // Property: Must have evaluations for all 4 architectures
            expect(output.evaluations).toHaveLength(4);
            ALL_ARCHITECTURES.forEach(arch => {
              expect(output.evaluations.some(e => e.architecture === arch)).toBe(true);
            });

            // Property: Each evaluation must have all 7 dimensions
            output.evaluations.forEach(evaluation => {
              expect(evaluation.dimensionScores).toHaveLength(7);
              ALL_DIMENSIONS.forEach(dim => {
                expect(evaluation.dimensionScores.some(ds => ds.dimension === dim)).toBe(true);
              });
            });

            // Property: Must have pairwise explanations for all pairs
            // 4 architectures = 6 pairs (4 choose 2)
            expect(output.pairwiseExplanations.length).toBe(6);

            // Property: Must have dimension summaries for all 7 dimensions
            expect(output.dimensionSummaries).toHaveLength(7);
            ALL_DIMENSIONS.forEach(dim => {
              expect(output.dimensionSummaries.some(ds => ds.dimension === dim)).toBe(true);
            });

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Comparison Output Builder', () => {
    it('should build complete output for RAG vs Hybrid scenario', () => {
      const evaluations = evaluateArchitectures(highCostConstraints);
      const output = buildComparisonOutput(evaluations, highCostConstraints);

      expect(output.metadata.timestamp).toBeDefined();
      expect(output.metadata.constraints).toEqual(highCostConstraints);
      expect(output.evaluations).toHaveLength(4);
      expect(output.pairwiseExplanations).toHaveLength(6);
      expect(output.dimensionSummaries).toHaveLength(7);
    });

    it('should include all architecture pairs in pairwise explanations', () => {
      const evaluations = evaluateArchitectures(highCostConstraints);
      const output = buildComparisonOutput(evaluations, highCostConstraints);

      // Check that RAG vs Hybrid pair exists
      const ragHybridPair = output.pairwiseExplanations.find(
        pe => (pe.architecturePair[0] === 'RAG' && pe.architecturePair[1] === 'Hybrid') ||
              (pe.architecturePair[0] === 'Hybrid' && pe.architecturePair[1] === 'RAG')
      );
      expect(ragHybridPair).toBeDefined();
      expect(ragHybridPair!.explanation).toBeDefined();
    });

    it('should generate dimension summaries for all dimensions', () => {
      const evaluations = evaluateArchitectures(highCostConstraints);
      const output = buildComparisonOutput(evaluations, highCostConstraints);

      ALL_DIMENSIONS.forEach(dimension => {
        const summary = output.dimensionSummaries.find(ds => ds.dimension === dimension);
        expect(summary).toBeDefined();
        expect(summary!.crossArchitectureComparison).toBeDefined();
        expect(summary!.crossArchitectureComparison.length).toBeGreaterThan(0);
      });
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize output to valid JSON', () => {
      const evaluations = evaluateArchitectures(highCostConstraints);
      const output = buildComparisonOutput(evaluations, highCostConstraints);
      const jsonString = serializeToJSON(output);

      expect(validateJSON(jsonString)).toBe(true);
    });

    it('should produce parseable JSON with all fields', () => {
      const evaluations = evaluateArchitectures(highCostConstraints);
      const output = buildComparisonOutput(evaluations, highCostConstraints);
      const jsonString = serializeToJSON(output);
      const parsed = JSON.parse(jsonString);

      expect(parsed.metadata).toBeDefined();
      expect(parsed.evaluations).toBeDefined();
      expect(parsed.pairwiseExplanations).toBeDefined();
      expect(parsed.dimensionSummaries).toBeDefined();
    });

    it('should include timestamp in ISO 8601 format', () => {
      const evaluations = evaluateArchitectures(highCostConstraints);
      const output = buildComparisonOutput(evaluations, highCostConstraints);

      // Check timestamp is valid ISO 8601
      const timestamp = new Date(output.metadata.timestamp);
      expect(timestamp.toISOString()).toBe(output.metadata.timestamp);
    });
  });

  describe('Metadata', () => {
    it('should include all required metadata fields', () => {
      const evaluations = evaluateArchitectures(highCostConstraints);
      const output = buildComparisonOutput(evaluations, highCostConstraints);

      expect(output.metadata.timestamp).toBeDefined();
      expect(output.metadata.constraints).toEqual(highCostConstraints);
      expect(output.metadata.architecturesEvaluated).toEqual(ALL_ARCHITECTURES);
    });
  });

  describe('Dimension Summaries', () => {
    it('should include context about what each dimension measures', () => {
      const evaluations = evaluateArchitectures(highCostConstraints);
      const output = buildComparisonOutput(evaluations, highCostConstraints);

      output.dimensionSummaries.forEach(summary => {
        expect(summary.crossArchitectureComparison).toContain(summary.dimension);
        expect(summary.crossArchitectureComparison.length).toBeGreaterThan(50); // Should have substantial content
      });
    });

    it('should identify highest and lowest scoring architectures for each dimension', () => {
      const evaluations = evaluateArchitectures(highCostConstraints);
      const output = buildComparisonOutput(evaluations, highCostConstraints);

      output.dimensionSummaries.forEach(summary => {
        expect(summary.crossArchitectureComparison.toLowerCase()).toContain('highest');
        expect(summary.crossArchitectureComparison.toLowerCase()).toContain('lowest');
      });
    });
  });
});