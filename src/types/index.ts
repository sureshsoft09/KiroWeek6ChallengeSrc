/**
 * Core type definitions for GenAI Architecture Referee
 * These types match the design document exactly
 */

// Architecture types
export type Architecture = 'RAG' | 'Fine-Tuned' | 'Agentic' | 'Hybrid';

// Dimension types
export type Dimension =
  | 'Data Freshness'
  | 'Accuracy & Hallucination Control'
  | 'Latency'
  | 'Cost Efficiency'
  | 'Governance & Auditability'
  | 'Workflow Complexity'
  | 'Team & Ops Readiness';

// User constraint types
export interface UserConstraints {
  dataChangeFrequency: 'low' | 'medium' | 'high';
  accuracyRequirement: 'low' | 'medium' | 'high' | 'critical';
  costSensitivity: 'low' | 'medium' | 'high';
}

export type ValidatedConstraints = UserConstraints;

// Dimension score types
export interface DimensionScore {
  dimension: Dimension;
  rawScore: number;        // 0-10 scale
  weight: number;          // 0-1 scale based on constraints
  weightedScore: number;   // rawScore * weight
  rationale: string;       // Why this score for this architecture
}

// Architecture evaluation types
export interface ArchitectureEvaluation {
  architecture: Architecture;
  dimensionScores: DimensionScore[];
  totalScore: number;      // Sum of weighted scores
}

// Explanation types
export interface DimensionComparison {
  dimension: Dimension;
  weight: number;
  architecture1Score: number;
  architecture2Score: number;
  delta: number;
  description: string;  // Neutral explanation of difference
}

export interface TradeoffStatement {
  architecture: Architecture;
  gains: string[];      // What this architecture provides
  sacrifices: string[]; // What this architecture gives up
}

export interface ConditionalStatement {
  condition: string;    // "IF high cost sensitivity"
  architecture: Architecture;
  characteristic: string; // "THEN RAG exhibits lower per-query costs"
}

export interface Explanation {
  summary: string;
  dimensionComparisons: DimensionComparison[];
  tradeoffAnalysis: TradeoffStatement[];
  conditionalGuidance: ConditionalStatement[];
}

// Output types
export interface ComparisonOutput {
  metadata: {
    timestamp: string;
    constraints: UserConstraints;
    architecturesEvaluated: Architecture[];
  };
  evaluations: ArchitectureEvaluation[];
  pairwiseExplanations: {
    architecturePair: [Architecture, Architecture];
    explanation: Explanation;
  }[];
  dimensionSummaries: {
    dimension: Dimension;
    crossArchitectureComparison: string;
  }[];
}

// Scoring matrix types
export interface DimensionData {
  baseScore: number;        // 0-10
  rationale: string;        // Why this score
  costCharacteristics?: string;  // For Cost Efficiency dimension
  tradeoffs: {
    gains: string[];
    sacrifices: string[];
  };
}

export interface ArchitectureData {
  dimensions: {
    [key in Dimension]: DimensionData;
  };
}

export interface ScoringMatrix {
  architectures: {
    [key in Architecture]: ArchitectureData;
  };
}

// Weighting configuration types
export interface DimensionWeights {
  [key: string]: number;  // Dimension name -> weight (sum to 1.0)
}

export interface WeightingConfig {
  constraints: {
    costSensitivity: {
      low: DimensionWeights;
      medium: DimensionWeights;
      high: DimensionWeights;
    };
    accuracyRequirement: {
      low: DimensionWeights;
      medium: DimensionWeights;
      high: DimensionWeights;
      critical: DimensionWeights;
    };
    dataChangeFrequency: {
      low: DimensionWeights;
      medium: DimensionWeights;
      high: DimensionWeights;
    };
  };
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  violations: LanguageViolation[];
}

export interface LanguageViolation {
  text: string;
  violationType: ViolationType;
  position: number;
}

export type ViolationType =
  | 'recommendation'
  | 'superlative'
  | 'prescriptive'
  | 'implied_preference';

// Context types for explanation generation
export interface ExplanationContext {
  architecture1: ArchitectureEvaluation;
  architecture2: ArchitectureEvaluation;
  constraints: ValidatedConstraints;
  scoreDifference: number;
}

// Constants
export const ALL_ARCHITECTURES: Architecture[] = ['RAG', 'Fine-Tuned', 'Agentic', 'Hybrid'];

export const ALL_DIMENSIONS: Dimension[] = [
  'Data Freshness',
  'Accuracy & Hallucination Control',
  'Latency',
  'Cost Efficiency',
  'Governance & Auditability',
  'Workflow Complexity',
  'Team & Ops Readiness'
];
