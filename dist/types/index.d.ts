/**
 * Core type definitions for GenAI Architecture Referee
 * These types match the design document exactly
 */
export type Architecture = 'RAG' | 'Fine-Tuned' | 'Agentic' | 'Hybrid';
export type Dimension = 'Data Freshness' | 'Accuracy & Hallucination Control' | 'Latency' | 'Cost Efficiency' | 'Governance & Auditability' | 'Workflow Complexity' | 'Team & Ops Readiness';
export interface UserConstraints {
    dataChangeFrequency: 'low' | 'medium' | 'high';
    accuracyRequirement: 'low' | 'medium' | 'high' | 'critical';
    costSensitivity: 'low' | 'medium' | 'high';
}
export type ValidatedConstraints = UserConstraints;
export interface DimensionScore {
    dimension: Dimension;
    rawScore: number;
    weight: number;
    weightedScore: number;
    rationale: string;
}
export interface ArchitectureEvaluation {
    architecture: Architecture;
    dimensionScores: DimensionScore[];
    totalScore: number;
}
export interface DimensionComparison {
    dimension: Dimension;
    weight: number;
    architecture1Score: number;
    architecture2Score: number;
    delta: number;
    description: string;
}
export interface TradeoffStatement {
    architecture: Architecture;
    gains: string[];
    sacrifices: string[];
}
export interface ConditionalStatement {
    condition: string;
    architecture: Architecture;
    characteristic: string;
}
export interface Explanation {
    summary: string;
    dimensionComparisons: DimensionComparison[];
    tradeoffAnalysis: TradeoffStatement[];
    conditionalGuidance: ConditionalStatement[];
}
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
export interface DimensionData {
    baseScore: number;
    rationale: string;
    costCharacteristics?: string;
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
export interface DimensionWeights {
    [key: string]: number;
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
export interface ValidationResult {
    isValid: boolean;
    violations: LanguageViolation[];
}
export interface LanguageViolation {
    text: string;
    violationType: ViolationType;
    position: number;
}
export type ViolationType = 'recommendation' | 'superlative' | 'prescriptive' | 'implied_preference';
export interface ExplanationContext {
    architecture1: ArchitectureEvaluation;
    architecture2: ArchitectureEvaluation;
    constraints: ValidatedConstraints;
    scoreDifference: number;
}
export declare const ALL_ARCHITECTURES: Architecture[];
export declare const ALL_DIMENSIONS: Dimension[];
//# sourceMappingURL=index.d.ts.map