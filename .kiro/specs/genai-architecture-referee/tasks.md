# Implementation Plan: GenAI Architecture Referee

## Overview

This implementation plan builds the GenAI Architecture Referee system in TypeScript. The system evaluates GenAI architectures (RAG, Fine-Tuned, Agentic, Hybrid) across seven dimensions, applies constraint-based weighting, and generates neutral explanations without recommendations.

Implementation follows a bottom-up approach: core data structures → validation → evaluation → explanation generation → integration.

## Tasks

- [ ] 1. Set up project structure and core types
  - Initialize TypeScript project with tsconfig.json
  - Install dependencies: testing framework, JSON schema validation
  - Create directory structure: src/, src/types/, src/validators/, src/evaluators/, src/generators/, tests/
  - Define core TypeScript types from design document (Architecture, Dimension, UserConstraints, etc.)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1-2.7_

- [ ] 1.1 Write property test for core types

  - **Property 1: All architectures return all dimensions**
  - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

- [ ] 2. Implement scoring matrix and weighting configuration
  - [ ] 2.1 Create scoring matrix data structure with all architecture evaluations
    - Define base scores (0-10) for each architecture-dimension pair
    - Include rationale strings for each score
    - Add cost characteristics for Cost Efficiency dimension
    - Define trade-offs (gains/sacrifices) for each architecture-dimension
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1-2.7_

  - [ ] 2.2 Create constraint weighting configuration
    - Define dimension weights for each constraint level
    - Ensure weights sum to 1.0 for each configuration
    - _Requirements: 3.2, 3.3, 3.4_

  - [ ]* 2.3 Write property test for weight sum invariant
    - **Property 10: Weight sum invariant**
    - **Validates: Requirements 2.1-2.7**

- [ ] 3. Implement Input Processor
  - [ ] 3.1 Create constraint validation logic
    - Validate enum values for dataChangeFrequency, accuracyRequirement, costSensitivity
    - Return validated constraint object or throw descriptive errors
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 3.2 Write property test for constraint input acceptance
    - **Property 2: Constraint input acceptance**
    - **Validates: Requirements 3.1**

  - [ ]* 3.3 Write unit tests for invalid constraint handling
    - Test invalid enum values throw appropriate errors
    - Test missing constraints throw appropriate errors
    - _Requirements: 3.1_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all unit and property tests defined up to this checkpoint pass.
    Verify:
    - Scoring calculations are correct
    - Output structure matches design
    - Language neutrality enforced


- [ ] 5. Implement Evaluation Engine
  - [ ] 5.1 Create dimension score calculator
    - Accept architecture, dimension, and constraints as input
    - Look up base score from scoring matrix
    - Look up weight from weighting configuration based on constraints
    - Calculate weighted score (baseScore * weight)
    - Return DimensionScore object with all fields
    - _Requirements: 2.1-2.7, 3.1_

  - [ ] 5.2 Create architecture evaluator
    - Calculate dimension scores for all seven dimensions
    - Sum weighted scores to get total score
    - Return ArchitectureEvaluation object
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1-2.7_

  - [ ]* 5.3 Write unit tests for evaluation engine
    - Test score calculation with known inputs
    - Test weight application
    - Test total score summation
    - _Requirements: 2.1-2.7_

- [ ] 6. Implement Language Validator
  - [ ] 6.1 Create forbidden pattern detector
    - Define arrays of forbidden patterns (recommendations, superlatives, prescriptive imperatives, implied preferences)
    - Implement case-insensitive pattern matching
    - Return violations with text, type, and position
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 6.2 Create allowed pattern validator
    - Validate conditional statements follow IF/THEN format
    - Ensure conditionals don't end with recommendation language
    - _Requirements: 7.1, 7.2_

  - [ ] 6.3 Create trade-off balance checker
    - Verify trade-off statements include both gains and sacrifices
    - Check that both arrays are non-empty
    - _Requirements: 4.5, 6.2_

  - [ ] 6.4 Write property test for language neutrality

    - **Property 3: Language neutrality**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 6.4**

  - [ ]* 6.5 Write unit tests for pattern detection
    - Test each forbidden pattern type is detected
    - Test allowed patterns pass validation
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all unit and property tests defined up to this checkpoint pass.
    Verify:
    - Scoring calculations are correct
    - Output structure matches design
    - Language neutrality enforced

- [ ] 8. Implement Explanation Generator
  - [ ] 8.1 Create dimension comparison generator
    - Calculate delta between architecture scores for each dimension
    - Identify significant dimensions (|delta| > 1.0)
    - Sort dimensions by absolute delta (largest first)
    - Generate description text following design templates
    - _Requirements: 6.1, 6.2_

  - [ ] 8.2 Create constraint reference logic
    - When constraint increases dimension weight, include this in description
    - Use template: "Under [constraint level] [constraint type], the [dimension] dimension receives increased weight ([weight value])"
    - _Requirements: 6.3, 7.4_

  - [ ] 8.3 Create trade-off statement generator
    - Extract gains and sacrifices from scoring matrix for each architecture
    - Format as TradeoffStatement objects
    - Ensure both gains and sacrifices are non-empty
    - _Requirements: 4.5, 6.1, 6.2_

  - [ ] 8.4 Create conditional observation generator
    - Generate IF/THEN statements based on constraint values
    - Reference architecture characteristics from scoring matrix
    - Ensure no recommendation language in conditionals
    - _Requirements: 7.1, 7.2, 7.4_

  - [ ] 8.5 Create summary and weighting context generator
    - Generate high-level summary of score difference
    - Explain how constraint weighting affects the comparison
    - Quantify the impact of weighting on dimension contributions
    - _Requirements: 6.1, 6.3_

  - [ ] 8.6 Integrate all explanation components
    - Combine dimension comparisons, trade-offs, conditionals, and context
    - Return complete Explanation object
    - _Requirements: 4.1-4.5, 6.1-6.4, 7.1-7.4_

  - [ ] 8.7 Write property test for constraint reference in explanations

    - **Property 8: Constraint reference in explanations**
    - **Validates: Requirements 6.3, 7.4**

  - [ ]* 8.8 Write property test for conditional statement format
    - **Property 9: Conditional statement format**
    - **Validates: Requirements 7.1, 7.2**

  - [ ]* 8.9 Write property test for trade-off balance
    - **Property 4: Trade-off balance**
    - **Validates: Requirements 4.5, 6.2**

  - [ ]* 8.10 Write property test for score difference explanation
    - **Property 11: Score difference explanation**
    - **Validates: Requirements 6.1, 6.2**

    - [ ] 8.11 Write unit test for RAG vs Hybrid under high cost sensitivity

    - Verify explanation matches sample output structure
    - Verify Cost Efficiency dimension is identified as primary driver
    - Verify constraint weighting is explained
    - Test components:
        - Score computation:
            - Verify RAG vs Hybrid weighted scores and deltas
        - Explanation text:
            - Verify text uses neutral language
            - Verify all significant dimensions are referenced
            - Verify trade-offs (gains and sacrifices) are correctly described
        - _Requirements: 3.4, 6.1, 6.3_

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all unit and property tests defined up to this checkpoint pass.
    Verify:
    - Scoring calculations are correct
    - Output structure matches design
    - Language neutrality enforced

- [ ] 10. Implement Output Formatter
  - [ ] 10.1 Create comparison output builder
    - Accept evaluations, explanations, and constraints
    - Build metadata object with timestamp and constraints
    - Structure pairwise explanations
    - Format as ComparisonOutput object
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 10.2 Add JSON serialization
    - Serialize ComparisonOutput to JSON string
    - Ensure valid JSON format
    - Ensure timestamps are ISO 8601 format
    - Include metadata fields: constraints used, architectures evaluated
    - Pairwise explanations should be keyed consistently by architecture names

    - _Requirements: 5.5_

  - [ ] 10.3 Write property test for output structure completeness

    - **Property 5: Output structure completeness**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.5**

  - [ ]* 10.4 Write property test for constraint context inclusion
    - **Property 6: Constraint context inclusion**
    - **Validates: Requirements 5.4**

  - [ ]* 10.5 Write unit tests for JSON output
    - Test JSON is valid and parseable
    - Test all required fields are present
    - _Requirements: 5.5_

- [ ] 11. Implement end-to-end pipeline
  - [ ] 11.1 Create main orchestration function
    - Accept user constraints as input
    - Call Input Processor to validate constraints
    - Call Evaluation Engine for all four architectures
    - Generate pairwise explanations for all architecture pairs (e.g., RAG vs Hybrid, RAG vs Agentic, etc.)
    - Validate all explanation text with Language Validator
    - Format output with Output Formatter
    - Return final JSON output
    - Add logging / debug outputs to capture:
        - Constraint processing
        - Weighted scores for each architecture/dimension
        - Delta computations between architectures
        - Generated explanations
    - _Requirements: 1.1-1.4, 2.1-2.7, 3.1-3.4, 4.1-4.5, 5.1-5.5, 6.1-6.4, 7.1-7.4_

  - [ ]* 11.2 Write property test for dimension trade-off identification
    - **Property 7: Dimension trade-off identification**
    - **Validates: Requirements 6.1**

  - [ ]* 11.3 Write integration test for complete pipeline
    - Test with high cost sensitivity constraint (RAG vs Hybrid scenario)
    - Verify output matches sample output structure
    - Verify no language violations in final output
    - _Requirements: All_

- [ ] 12. Final checkpoint - Ensure all tests pass
  - Ensure all unit and property tests defined up to this checkpoint pass.
    Verify:
    - Scoring calculations are correct
    - Output structure matches design
    - Language neutrality enforced

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples and edge cases
- The RAG vs Hybrid scenario is explicitly tested to validate the core use case
- Language validation is critical - all generated text must pass neutrality checks
