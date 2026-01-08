/**
 * Language Validator
 * Ensures all generated text is neutral and non-prescriptive
 */

import { ValidationResult, LanguageViolation } from '../types';

// Forbidden patterns by type
const RECOMMENDATION_PATTERNS = [
  'should',
  'must',
  'recommend',
  'suggest',
  'advise',
  'you should choose',
  'we recommend',
  "it's best to",
  'it is best to'
];

const SUPERLATIVE_PATTERNS = [
  'best',
  'worst',
  'optimal',
  'ideal',
  'perfect',
  'better than',
  'worse than',
  'superior',
  'inferior',
  'most effective',
  'least effective',
  'most efficient',
  'least efficient'
];

const PRESCRIPTIVE_PATTERNS = [
  'use this',
  'avoid this',
  'prefer',
  'select this',
  'go with',
  'pick this',
  'choose this'
];

const IMPLIED_PREFERENCE_PATTERNS = [
  'unfortunately',
  'fortunately',
  'luckily',
  'unluckily',
  'only',
  'merely',
  'just'
];

/**
 * Detect forbidden patterns in text
 * @param text - Text to validate
 * @returns ValidationResult with any violations found
 */
export function validateLanguageNeutrality(text: string): ValidationResult {
  const violations: LanguageViolation[] = [];
  const lowerText = text.toLowerCase();

  // Check recommendation patterns
  RECOMMENDATION_PATTERNS.forEach(pattern => {
    const index = lowerText.indexOf(pattern.toLowerCase());
    if (index !== -1) {
      violations.push({
        text: pattern,
        violationType: 'recommendation',
        position: index
      });
    }
  });

  // Check superlative patterns
  SUPERLATIVE_PATTERNS.forEach(pattern => {
    const index = lowerText.indexOf(pattern.toLowerCase());
    if (index !== -1) {
      violations.push({
        text: pattern,
        violationType: 'superlative',
        position: index
      });
    }
  });

  // Check prescriptive patterns
  PRESCRIPTIVE_PATTERNS.forEach(pattern => {
    const index = lowerText.indexOf(pattern.toLowerCase());
    if (index !== -1) {
      violations.push({
        text: pattern,
        violationType: 'prescriptive',
        position: index
      });
    }
  });

  // Check implied preference patterns
  IMPLIED_PREFERENCE_PATTERNS.forEach(pattern => {
    const index = lowerText.indexOf(pattern.toLowerCase());
    if (index !== -1) {
      violations.push({
        text: pattern,
        violationType: 'implied_preference',
        position: index
      });
    }
  });

  return {
    isValid: violations.length === 0,
    violations
  };
}

/**
 * Validate conditional statements follow IF/THEN format
 * @param statement - Conditional statement to validate
 * @returns true if valid, false otherwise
 */
export function validateConditionalFormat(statement: string): boolean {
  const lowerStatement = statement.toLowerCase();
  
  // Must contain IF and THEN
  const hasIf = lowerStatement.includes('if ');
  const hasThen = lowerStatement.includes('then ');
  
  if (!hasIf || !hasThen) {
    return false;
  }
  
  // IF must come before THEN
  const ifIndex = lowerStatement.indexOf('if ');
  const thenIndex = lowerStatement.indexOf('then ');
  
  if (ifIndex >= thenIndex) {
    return false;
  }
  
  // Must not contain recommendation language after THEN
  const afterThen = lowerStatement.substring(thenIndex);
  const recommendationCheck = validateLanguageNeutrality(afterThen);
  
  return recommendationCheck.isValid;
}

/**
 * Validate trade-off statements have both gains and sacrifices
 * @param gains - Array of gains
 * @param sacrifices - Array of sacrifices
 * @returns true if both are non-empty, false otherwise
 */
export function validateTradeoffBalance(gains: string[], sacrifices: string[]): boolean {
  return gains.length > 0 && sacrifices.length > 0;
}

/**
 * Check if text contains allowed descriptive patterns
 * @param text - Text to check
 * @returns true if text uses allowed patterns
 */
export function containsAllowedPatterns(text: string): boolean {
  const allowedPatterns = [
    'higher',
    'lower',
    'more',
    'less',
    'increased',
    'decreased',
    'exhibits',
    'demonstrates',
    'reflects',
    'indicates',
    'trades',
    'for',
    'gains',
    'sacrifices',
    'at the expense of',
    'in exchange for'
  ];
  
  const lowerText = text.toLowerCase();
  return allowedPatterns.some(pattern => lowerText.includes(pattern));
}

/**
 * Validate entire explanation object
 * @param explanation - Explanation text or object to validate
 * @returns ValidationResult
 */
export function validateExplanation(explanation: string | object): ValidationResult {
  let textToValidate = '';
  
  if (typeof explanation === 'string') {
    textToValidate = explanation;
  } else {
    // Convert object to JSON string for validation
    textToValidate = JSON.stringify(explanation);
  }
  
  return validateLanguageNeutrality(textToValidate);
}
