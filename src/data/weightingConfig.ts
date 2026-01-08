/**
 * Constraint Weighting Configuration
 * Defines how user constraints modify dimension weights
 * All weights must sum to 1.0 for each configuration
 */

import { WeightingConfig } from '../types';

export const WEIGHTING_CONFIG: WeightingConfig = {
  constraints: {
    costSensitivity: {
      low: {
        'Data Freshness': 0.15,
        'Accuracy & Hallucination Control': 0.15,
        'Latency': 0.15,
        'Cost Efficiency': 0.10,  // Reduced weight when cost is not a concern
        'Governance & Auditability': 0.15,
        'Workflow Complexity': 0.15,
        'Team & Ops Readiness': 0.15
      },
      medium: {
        'Data Freshness': 0.14,
        'Accuracy & Hallucination Control': 0.14,
        'Latency': 0.14,
        'Cost Efficiency': 0.16,  // Moderate weight
        'Governance & Auditability': 0.14,
        'Workflow Complexity': 0.14,
        'Team & Ops Readiness': 0.14
      },
      high: {
        'Data Freshness': 0.10,
        'Accuracy & Hallucination Control': 0.15,
        'Latency': 0.10,
        'Cost Efficiency': 0.25,  // Increased weight - doubles from balanced
        'Governance & Auditability': 0.15,
        'Workflow Complexity': 0.15,
        'Team & Ops Readiness': 0.10
      }
    },
    accuracyRequirement: {
      low: {
        'Data Freshness': 0.15,
        'Accuracy & Hallucination Control': 0.10,  // Reduced weight
        'Latency': 0.15,
        'Cost Efficiency': 0.15,
        'Governance & Auditability': 0.10,
        'Workflow Complexity': 0.20,
        'Team & Ops Readiness': 0.15
      },
      medium: {
        'Data Freshness': 0.14,
        'Accuracy & Hallucination Control': 0.16,  // Moderate weight
        'Latency': 0.14,
        'Cost Efficiency': 0.14,
        'Governance & Auditability': 0.14,
        'Workflow Complexity': 0.14,
        'Team & Ops Readiness': 0.14
      },
      high: {
        'Data Freshness': 0.12,
        'Accuracy & Hallucination Control': 0.25,  // Increased weight
        'Latency': 0.12,
        'Cost Efficiency': 0.12,
        'Governance & Auditability': 0.15,
        'Workflow Complexity': 0.12,
        'Team & Ops Readiness': 0.12
      },
      critical: {
        'Data Freshness': 0.10,
        'Accuracy & Hallucination Control': 0.30,  // Maximum weight
        'Latency': 0.10,
        'Cost Efficiency': 0.10,
        'Governance & Auditability': 0.15,
        'Workflow Complexity': 0.15,
        'Team & Ops Readiness': 0.10
      }
    },
    dataChangeFrequency: {
      low: {
        'Data Freshness': 0.10,  // Reduced weight
        'Accuracy & Hallucination Control': 0.15,
        'Latency': 0.15,
        'Cost Efficiency': 0.15,
        'Governance & Auditability': 0.15,
        'Workflow Complexity': 0.15,
        'Team & Ops Readiness': 0.15
      },
      medium: {
        'Data Freshness': 0.16,  // Moderate weight
        'Accuracy & Hallucination Control': 0.14,
        'Latency': 0.14,
        'Cost Efficiency': 0.14,
        'Governance & Auditability': 0.14,
        'Workflow Complexity': 0.14,
        'Team & Ops Readiness': 0.14
      },
      high: {
        'Data Freshness': 0.25,  // Increased weight
        'Accuracy & Hallucination Control': 0.15,
        'Latency': 0.10,
        'Cost Efficiency': 0.15,
        'Governance & Auditability': 0.10,
        'Workflow Complexity': 0.15,
        'Team & Ops Readiness': 0.10
      }
    }
  }
};

/**
 * Helper function to get dimension weights based on constraints
 * When multiple constraints are provided, we use a priority system:
 * 1. Cost sensitivity (if high)
 * 2. Accuracy requirement (if critical or high)
 * 3. Data change frequency (if high)
 * 
 * For MVP, we'll use the most restrictive constraint
 */
export function getDimensionWeights(
  costSensitivity: 'low' | 'medium' | 'high',
  accuracyRequirement: 'low' | 'medium' | 'high' | 'critical',
  dataChangeFrequency: 'low' | 'medium' | 'high'
): { [dimension: string]: number } {
  // Priority: cost sensitivity > accuracy requirement > data change frequency
  // This matches the design document's focus on cost sensitivity for the RAG vs Hybrid scenario
  
  if (costSensitivity === 'high') {
    return WEIGHTING_CONFIG.constraints.costSensitivity.high;
  }
  
  if (accuracyRequirement === 'critical') {
    return WEIGHTING_CONFIG.constraints.accuracyRequirement.critical;
  }
  
  if (accuracyRequirement === 'high') {
    return WEIGHTING_CONFIG.constraints.accuracyRequirement.high;
  }
  
  if (dataChangeFrequency === 'high') {
    return WEIGHTING_CONFIG.constraints.dataChangeFrequency.high;
  }
  
  if (costSensitivity === 'medium') {
    return WEIGHTING_CONFIG.constraints.costSensitivity.medium;
  }
  
  if (accuracyRequirement === 'medium') {
    return WEIGHTING_CONFIG.constraints.accuracyRequirement.medium;
  }
  
  if (dataChangeFrequency === 'medium') {
    return WEIGHTING_CONFIG.constraints.dataChangeFrequency.medium;
  }
  
  // Default to balanced weights (using low cost sensitivity as baseline)
  return WEIGHTING_CONFIG.constraints.costSensitivity.low;
}
