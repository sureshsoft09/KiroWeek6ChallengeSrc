/**
 * Constraint Weighting Configuration
 * Defines how user constraints modify dimension weights
 * All weights must sum to 1.0 for each configuration
 */
import { WeightingConfig } from '../types';
export declare const WEIGHTING_CONFIG: WeightingConfig;
/**
 * Helper function to get dimension weights based on constraints
 * When multiple constraints are provided, we use a priority system:
 * 1. Cost sensitivity (if high)
 * 2. Accuracy requirement (if critical or high)
 * 3. Data change frequency (if high)
 *
 * For MVP, we'll use the most restrictive constraint
 */
export declare function getDimensionWeights(costSensitivity: 'low' | 'medium' | 'high', accuracyRequirement: 'low' | 'medium' | 'high' | 'critical', dataChangeFrequency: 'low' | 'medium' | 'high'): {
    [dimension: string]: number;
};
//# sourceMappingURL=weightingConfig.d.ts.map