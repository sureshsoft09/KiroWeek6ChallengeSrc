/**
 * Language Validator
 * Ensures all generated text is neutral and non-prescriptive
 */
import { ValidationResult } from '../types';
/**
 * Detect forbidden patterns in text
 * @param text - Text to validate
 * @returns ValidationResult with any violations found
 */
export declare function validateLanguageNeutrality(text: string): ValidationResult;
/**
 * Validate conditional statements follow IF/THEN format
 * @param statement - Conditional statement to validate
 * @returns true if valid, false otherwise
 */
export declare function validateConditionalFormat(statement: string): boolean;
/**
 * Validate trade-off statements have both gains and sacrifices
 * @param gains - Array of gains
 * @param sacrifices - Array of sacrifices
 * @returns true if both are non-empty, false otherwise
 */
export declare function validateTradeoffBalance(gains: string[], sacrifices: string[]): boolean;
/**
 * Check if text contains allowed descriptive patterns
 * @param text - Text to check
 * @returns true if text uses allowed patterns
 */
export declare function containsAllowedPatterns(text: string): boolean;
/**
 * Validate entire explanation object
 * @param explanation - Explanation text or object to validate
 * @returns ValidationResult
 */
export declare function validateExplanation(explanation: string | object): ValidationResult;
//# sourceMappingURL=languageValidator.d.ts.map