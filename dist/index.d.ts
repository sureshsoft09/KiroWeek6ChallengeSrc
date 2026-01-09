/**
 * GenAI Architecture Referee - Main Entry Point
 * End-to-end orchestration function
 */
import { UserConstraints, ComparisonOutput } from './types';
/**
 * Main orchestration function
 * Accepts user constraints and returns complete comparison output
 *
 * @param constraints - User-provided constraints
 * @returns ComparisonOutput with all evaluations and explanations
 */
export declare function compareArchitectures(constraints: UserConstraints): ComparisonOutput;
/**
 * Main orchestration function that returns JSON string
 *
 * @param constraints - User-provided constraints
 * @returns JSON string of comparison output
 */
export declare function compareArchitecturesJSON(constraints: UserConstraints): string;
/**
 * Export all public APIs
 */
export * from './types';
export { processConstraints } from './validators/inputProcessor';
export { evaluateArchitectures, evaluateArchitecture } from './evaluators/evaluationEngine';
export { generatePairwiseExplanation } from './generators/explanationGenerator';
export { buildComparisonOutput, serializeToJSON } from './formatters/outputFormatter';
export { validateLanguageNeutrality } from './validators/languageValidator';
//# sourceMappingURL=index.d.ts.map