/**
 * GenAI Architecture Referee - Main Entry Point
 * End-to-end orchestration function
 */

import { UserConstraints, ComparisonOutput } from './types';
import { processConstraints } from './validators/inputProcessor';
import { evaluateArchitectures } from './evaluators/evaluationEngine';
import { buildComparisonOutput, serializeToJSON } from './formatters/outputFormatter';
import { validateLanguageNeutrality } from './validators/languageValidator';

/**
 * Main orchestration function
 * Accepts user constraints and returns complete comparison output
 * 
 * @param constraints - User-provided constraints
 * @returns ComparisonOutput with all evaluations and explanations
 */
export function compareArchitectures(constraints: UserConstraints): ComparisonOutput {
  console.log('=== GenAI Architecture Referee ===');
  console.log('Step 1: Processing constraints...');
  console.log('Input constraints:', JSON.stringify(constraints, null, 2));
  
  // Step 1: Validate constraints
  const validatedConstraints = processConstraints(constraints);
  console.log('✓ Constraints validated');
  
  // Step 2: Evaluate all architectures
  console.log('\nStep 2: Evaluating architectures...');
  const evaluations = evaluateArchitectures(validatedConstraints);
  
  evaluations.forEach(evaluation => {
    console.log(`\n${evaluation.architecture}:`);
    console.log(`  Total Score: ${evaluation.totalScore.toFixed(2)}`);
    console.log('  Dimension Scores:');
    evaluation.dimensionScores.forEach(ds => {
      console.log(`    ${ds.dimension}: ${ds.rawScore}/10 (weight: ${ds.weight}, weighted: ${ds.weightedScore.toFixed(2)})`);
    });
  });
  console.log('\n✓ All architectures evaluated');
  
  // Step 3: Build comparison output with explanations
  console.log('\nStep 3: Generating explanations...');
  const output = buildComparisonOutput(evaluations, validatedConstraints);
  console.log(`✓ Generated ${output.pairwiseExplanations.length} pairwise explanations`);
  
  // Step 4: Validate language neutrality
  console.log('\nStep 4: Validating language neutrality...');
  let violationCount = 0;
  
  output.pairwiseExplanations.forEach(pe => {
    const summaryValidation = validateLanguageNeutrality(pe.explanation.summary);
    if (!summaryValidation.isValid) {
      console.warn(`⚠ Language violations in summary for ${pe.architecturePair.join(' vs ')}:`, summaryValidation.violations);
      violationCount += summaryValidation.violations.length;
    }
    
    pe.explanation.dimensionComparisons.forEach(dc => {
      const validation = validateLanguageNeutrality(dc.description);
      if (!validation.isValid) {
        console.warn(`⚠ Language violations in ${dc.dimension} comparison:`, validation.violations);
        violationCount += validation.violations.length;
      }
    });
  });
  
  if (violationCount === 0) {
    console.log('✓ All explanations pass language neutrality validation');
  } else {
    console.warn(`⚠ Found ${violationCount} language violations`);
  }
  
  console.log('\n=== Comparison Complete ===\n');
  
  return output;
}

/**
 * Main orchestration function that returns JSON string
 * 
 * @param constraints - User-provided constraints
 * @returns JSON string of comparison output
 */
export function compareArchitecturesJSON(constraints: UserConstraints): string {
  const output = compareArchitectures(constraints);
  return serializeToJSON(output);
}

/**
 * Export all public APIs
 */
export * from './types';
export { processConstraints } from './validators/inputProcessor';
export { evaluateArchitectures, evaluateArchitecture } from './evaluators/evaluationEngine';
export { generatePairwiseExplanation } from './generators/explanationGenerator';
export { buildComparisonOutput, serializeToJSON } from './formatters/outputFormatter';
export { validateLanguageNeutrality } from './validators/languageValidator';
