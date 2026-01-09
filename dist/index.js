"use strict";
/**
 * GenAI Architecture Referee - Main Entry Point
 * End-to-end orchestration function
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLanguageNeutrality = exports.serializeToJSON = exports.buildComparisonOutput = exports.generatePairwiseExplanation = exports.evaluateArchitecture = exports.evaluateArchitectures = exports.processConstraints = void 0;
exports.compareArchitectures = compareArchitectures;
exports.compareArchitecturesJSON = compareArchitecturesJSON;
const inputProcessor_1 = require("./validators/inputProcessor");
const evaluationEngine_1 = require("./evaluators/evaluationEngine");
const outputFormatter_1 = require("./formatters/outputFormatter");
const languageValidator_1 = require("./validators/languageValidator");
/**
 * Main orchestration function
 * Accepts user constraints and returns complete comparison output
 *
 * @param constraints - User-provided constraints
 * @returns ComparisonOutput with all evaluations and explanations
 */
function compareArchitectures(constraints) {
    console.log('=== GenAI Architecture Referee ===');
    console.log('Step 1: Processing constraints...');
    console.log('Input constraints:', JSON.stringify(constraints, null, 2));
    // Step 1: Validate constraints
    const validatedConstraints = (0, inputProcessor_1.processConstraints)(constraints);
    console.log('✓ Constraints validated');
    // Step 2: Evaluate all architectures
    console.log('\nStep 2: Evaluating architectures...');
    const evaluations = (0, evaluationEngine_1.evaluateArchitectures)(validatedConstraints);
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
    const output = (0, outputFormatter_1.buildComparisonOutput)(evaluations, validatedConstraints);
    console.log(`✓ Generated ${output.pairwiseExplanations.length} pairwise explanations`);
    // Step 4: Validate language neutrality
    console.log('\nStep 4: Validating language neutrality...');
    let violationCount = 0;
    output.pairwiseExplanations.forEach(pe => {
        const summaryValidation = (0, languageValidator_1.validateLanguageNeutrality)(pe.explanation.summary);
        if (!summaryValidation.isValid) {
            console.warn(`⚠ Language violations in summary for ${pe.architecturePair.join(' vs ')}:`, summaryValidation.violations);
            violationCount += summaryValidation.violations.length;
        }
        pe.explanation.dimensionComparisons.forEach(dc => {
            const validation = (0, languageValidator_1.validateLanguageNeutrality)(dc.description);
            if (!validation.isValid) {
                console.warn(`⚠ Language violations in ${dc.dimension} comparison:`, validation.violations);
                violationCount += validation.violations.length;
            }
        });
    });
    if (violationCount === 0) {
        console.log('✓ All explanations pass language neutrality validation');
    }
    else {
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
function compareArchitecturesJSON(constraints) {
    const output = compareArchitectures(constraints);
    return (0, outputFormatter_1.serializeToJSON)(output);
}
/**
 * Export all public APIs
 */
__exportStar(require("./types"), exports);
var inputProcessor_2 = require("./validators/inputProcessor");
Object.defineProperty(exports, "processConstraints", { enumerable: true, get: function () { return inputProcessor_2.processConstraints; } });
var evaluationEngine_2 = require("./evaluators/evaluationEngine");
Object.defineProperty(exports, "evaluateArchitectures", { enumerable: true, get: function () { return evaluationEngine_2.evaluateArchitectures; } });
Object.defineProperty(exports, "evaluateArchitecture", { enumerable: true, get: function () { return evaluationEngine_2.evaluateArchitecture; } });
var explanationGenerator_1 = require("./generators/explanationGenerator");
Object.defineProperty(exports, "generatePairwiseExplanation", { enumerable: true, get: function () { return explanationGenerator_1.generatePairwiseExplanation; } });
var outputFormatter_2 = require("./formatters/outputFormatter");
Object.defineProperty(exports, "buildComparisonOutput", { enumerable: true, get: function () { return outputFormatter_2.buildComparisonOutput; } });
Object.defineProperty(exports, "serializeToJSON", { enumerable: true, get: function () { return outputFormatter_2.serializeToJSON; } });
var languageValidator_2 = require("./validators/languageValidator");
Object.defineProperty(exports, "validateLanguageNeutrality", { enumerable: true, get: function () { return languageValidator_2.validateLanguageNeutrality; } });
//# sourceMappingURL=index.js.map