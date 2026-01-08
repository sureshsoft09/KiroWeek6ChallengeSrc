/**
 * Tests for Evaluation Engine
 * Validates: Requirements 2.1-2.7
 */

import {
  calculateDimensionScore,
  evaluateArchitecture,
  evaluateArchitectures,
  calculateScoreDifference
} from '../src/evaluators/evaluationEngine';
import { ValidatedConstraints } from '../src/types';

describe('Evaluation Engine', () => {
  const highCostConstraints: ValidatedConstraints = {
    dataChangeFrequency: 'high',
    accuracyRequirement: 'critical',
    costSensitivity: 'high'
  };

  const balancedConstraints: ValidatedConstraints = {
    dataChangeFrequency: 'medium',
    accuracyRequirement: 'medium',
    costSensitivity: 'medium'
  };

  describe('Dimension Score Calculator', () => {
    it('should calculate correct dimension score for RAG Cost Efficiency under high cost sensitivity', () => {
      const score = calculateDimensionScore('RAG', 'Cost Efficiency', highCostConstraints);

      expect(score.dimension).toBe('Cost Efficiency');
      expect(score.rawScore).toBe(7); // From scoring matrix
      expect(score.weight).toBe(0.25); // High cost sensitivity weight
      expect(score.weightedScore).toBe(1.75); // 7 * 0.25
      expect(score.rationale).toContain('Single LLM call per query');
    });

    it('should calculate correct dimension score for Hybrid Cost Efficiency under high cost sensitivity', () => {
      const score = calculateDimensionScore('Hybrid', 'Cost Efficiency', highCostConstraints);

      expect(score.dimension).toBe('Cost Efficiency');
      expect(score.rawScore).toBe(4); // From scoring matrix
      expect(score.weight).toBe(0.25); // High cost sensitivity weight
      expect(score.weightedScore).toBe(1.0); // 4 * 0.25
      expect(score.rationale).toContain('Multiple LLM calls, agent orchestration');
    });

    it('should use different weights for balanced constraints', () => {
      const ragScore = calculateDimensionScore('RAG', 'Cost Efficiency', balancedConstraints);
      const hybridScore = calculateDimensionScore('Hybrid', 'Cost Efficiency', balancedConstraints);

      // Under balanced constraints, cost efficiency has lower weight (0.16)
      expect(ragScore.weight).toBe(0.16);
      expect(hybridScore.weight).toBe(0.16);
      expect(ragScore.weightedScore).toBe(7 * 0.16); // 1.12
      expect(hybridScore.weightedScore).toBe(4 * 0.16); // 0.64
    });
  });

  describe('Architecture Evaluator', () => {
    it('should evaluate RAG architecture with all seven dimensions', () => {
      const evaluation = evaluateArchitecture('RAG', highCostConstraints);

      expect(evaluation.architecture).toBe('RAG');
      expect(evaluation.dimensionScores).toHaveLength(7);
      
      // Check all dimensions are present
      const dimensions = evaluation.dimensionScores.map(ds => ds.dimension);
      expect(dimensions).toContain('Data Freshness');
      expect(dimensions).toContain('Accuracy & Hallucination Control');
      expect(dimensions).toContain('Latency');
      expect(dimensions).toContain('Cost Efficiency');
      expect(dimensions).toContain('Governance & Auditability');
      expect(dimensions).toContain('Workflow Complexity');
      expect(dimensions).toContain('Team & Ops Readiness');

      // Total score should be sum of weighted scores
      const expectedTotal = evaluation.dimensionScores.reduce((sum, ds) => sum + ds.weightedScore, 0);
      expect(evaluation.totalScore).toBeCloseTo(expectedTotal, 3);
    });

    it('should calculate correct total score for RAG under high cost sensitivity', () => {
      const evaluation = evaluateArchitecture('RAG', highCostConstraints);
      
      // Expected scores based on scoring matrix and high cost sensitivity weights:
      // Data Freshness: 8 * 0.10 = 0.80
      // Accuracy: 6 * 0.15 = 0.90
      // Latency: 7 * 0.10 = 0.70
      // Cost Efficiency: 7 * 0.25 = 1.75
      // Governance: 5 * 0.15 = 0.75
      // Workflow Complexity: 8 * 0.15 = 1.20
      // Team Readiness: 7 * 0.10 = 0.70
      // Total: 6.80
      
      expect(evaluation.totalScore).toBeCloseTo(6.80, 2);
    });

    it('should calculate correct total score for Hybrid under high cost sensitivity', () => {
      const evaluation = evaluateArchitecture('Hybrid', highCostConstraints);
      
      // Expected scores based on scoring matrix and high cost sensitivity weights:
      // Data Freshness: 8 * 0.10 = 0.80
      // Accuracy: 8 * 0.15 = 1.20
      // Latency: 5 * 0.10 = 0.50
      // Cost Efficiency: 4 * 0.25 = 1.00
      // Governance: 7 * 0.15 = 1.05
      // Workflow Complexity: 4 * 0.15 = 0.60
      // Team Readiness: 5 * 0.10 = 0.50
      // Total: 5.65
      
      expect(evaluation.totalScore).toBeCloseTo(5.65, 2);
    });
  });

  describe('All Architectures Evaluator', () => {
    it('should evaluate all four architectures', () => {
      const evaluations = evaluateArchitectures(highCostConstraints);

      expect(evaluations).toHaveLength(4);
      
      const architectures = evaluations.map(evaluation => evaluation.architecture);
      expect(architectures).toContain('RAG');
      expect(architectures).toContain('Fine-Tuned');
      expect(architectures).toContain('Agentic');
      expect(architectures).toContain('Hybrid');
    });

    it('should show RAG scoring higher than Hybrid under high cost sensitivity', () => {
      const evaluations = evaluateArchitectures(highCostConstraints);
      
      const ragEvaluation = evaluations.find(evaluation => evaluation.architecture === 'RAG')!;
      const hybridEvaluation = evaluations.find(evaluation => evaluation.architecture === 'Hybrid')!;
      
      expect(ragEvaluation.totalScore).toBeGreaterThan(hybridEvaluation.totalScore);
      
      // The difference should be approximately 1.15 (6.80 - 5.65)
      const difference = ragEvaluation.totalScore - hybridEvaluation.totalScore;
      expect(difference).toBeCloseTo(1.15, 1);
    });
  });

  describe('Score Difference Calculator', () => {
    it('should calculate correct score difference between RAG and Hybrid', () => {
      const evaluations = evaluateArchitectures(highCostConstraints);
      
      const ragEvaluation = evaluations.find(evaluation => evaluation.architecture === 'RAG')!;
      const hybridEvaluation = evaluations.find(evaluation => evaluation.architecture === 'Hybrid')!;
      
      const difference = calculateScoreDifference(ragEvaluation, hybridEvaluation);
      
      // RAG should score higher than Hybrid under high cost sensitivity
      expect(difference).toBeGreaterThan(0);
      expect(difference).toBeCloseTo(1.15, 1);
    });

    it('should return negative difference when second architecture scores higher', () => {
      const evaluations = evaluateArchitectures(highCostConstraints);
      
      const ragEvaluation = evaluations.find(evaluation => evaluation.architecture === 'RAG')!;
      const hybridEvaluation = evaluations.find(evaluation => evaluation.architecture === 'Hybrid')!;
      
      const difference = calculateScoreDifference(hybridEvaluation, ragEvaluation);
      
      // Hybrid - RAG should be negative
      expect(difference).toBeLessThan(0);
      expect(difference).toBeCloseTo(-1.15, 1);
    });
  });

  describe('Weight Application', () => {
    it('should apply weights correctly across all dimensions', () => {
      const evaluation = evaluateArchitecture('RAG', highCostConstraints);
      
      // Verify weights sum to 1.0
      const totalWeight = evaluation.dimensionScores.reduce((sum, ds) => sum + ds.weight, 0);
      expect(totalWeight).toBeCloseTo(1.0, 3);
      
      // Verify weighted scores are calculated correctly
      evaluation.dimensionScores.forEach(ds => {
        expect(ds.weightedScore).toBeCloseTo(ds.rawScore * ds.weight, 3);
      });
    });

    it('should show Cost Efficiency has highest weight under high cost sensitivity', () => {
      const evaluation = evaluateArchitecture('RAG', highCostConstraints);
      
      const costEfficiencyScore = evaluation.dimensionScores.find(ds => ds.dimension === 'Cost Efficiency')!;
      
      // Cost Efficiency should have weight of 0.25 under high cost sensitivity
      expect(costEfficiencyScore.weight).toBe(0.25);
      
      // It should be the highest weight among all dimensions
      const maxWeight = Math.max(...evaluation.dimensionScores.map(ds => ds.weight));
      expect(costEfficiencyScore.weight).toBe(maxWeight);
    });
  });
});