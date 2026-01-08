/**
 * Property test for weighting configuration
 * Feature: genai-architecture-referee, Property 10: Weight sum invariant
 * Validates: Requirements 2.1-2.7
 */

import * as fc from 'fast-check';
import { WEIGHTING_CONFIG, getDimensionWeights } from '../src/data/weightingConfig';
import { ALL_DIMENSIONS } from '../src/types';

describe('Weighting Configuration', () => {
  describe('Property 10: Weight sum invariant', () => {
    it('should have weights that sum to 1.0 for all constraint configurations', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('low', 'medium', 'high'),
          fc.constantFrom('low', 'medium', 'high', 'critical'),
          fc.constantFrom('low', 'medium', 'high'),
          (costSensitivity, accuracyRequirement, dataChangeFrequency) => {
            const weights = getDimensionWeights(
              costSensitivity as 'low' | 'medium' | 'high',
              accuracyRequirement as 'low' | 'medium' | 'high' | 'critical',
              dataChangeFrequency as 'low' | 'medium' | 'high'
            );

            // Calculate sum of all dimension weights
            const sum = ALL_DIMENSIONS.reduce((total, dim) => {
              return total + (weights[dim] || 0);
            }, 0);

            // Property: Weights must sum to 1.0 (within floating-point tolerance)
            expect(Math.abs(sum - 1.0)).toBeLessThan(0.001);

            // Property: All dimensions must have a weight
            ALL_DIMENSIONS.forEach(dim => {
              expect(weights[dim]).toBeDefined();
              expect(weights[dim]).toBeGreaterThan(0);
              expect(weights[dim]).toBeLessThanOrEqual(1);
            });

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have all individual constraint configurations sum to 1.0', () => {
      // Test cost sensitivity configurations
      ['low', 'medium', 'high'].forEach(level => {
        const weights = WEIGHTING_CONFIG.constraints.costSensitivity[level as 'low' | 'medium' | 'high'];
        const sum = Object.values(weights).reduce((a, b) => a + b, 0);
        expect(Math.abs(sum - 1.0)).toBeLessThan(0.001);
      });

      // Test accuracy requirement configurations
      ['low', 'medium', 'high', 'critical'].forEach(level => {
        const weights = WEIGHTING_CONFIG.constraints.accuracyRequirement[level as 'low' | 'medium' | 'high' | 'critical'];
        const sum = Object.values(weights).reduce((a, b) => a + b, 0);
        expect(Math.abs(sum - 1.0)).toBeLessThan(0.001);
      });

      // Test data change frequency configurations
      ['low', 'medium', 'high'].forEach(level => {
        const weights = WEIGHTING_CONFIG.constraints.dataChangeFrequency[level as 'low' | 'medium' | 'high'];
        const sum = Object.values(weights).reduce((a, b) => a + b, 0);
        expect(Math.abs(sum - 1.0)).toBeLessThan(0.001);
      });
    });
  });

  describe('Constraint Priority', () => {
    it('should prioritize high cost sensitivity', () => {
      const weights = getDimensionWeights('high', 'low', 'low');
      expect(weights['Cost Efficiency']).toBe(0.25);
    });

    it('should prioritize critical accuracy when cost is not high', () => {
      const weights = getDimensionWeights('low', 'critical', 'low');
      expect(weights['Accuracy & Hallucination Control']).toBe(0.30);
    });

    it('should prioritize high data freshness when others are not high/critical', () => {
      const weights = getDimensionWeights('low', 'low', 'high');
      expect(weights['Data Freshness']).toBe(0.25);
    });
  });
});
