# Design Document: GenAI Architecture Referee

## Overview

The GenAI Architecture Referee is a decision-support system that generates neutral, structured comparison data for GenAI architectural patterns. The system evaluates four architectures (RAG, Fine-Tuned Models, Agentic AI, Hybrid) across seven dimensions, applies user-provided constraints, and produces explanations that articulate trade-offs without making recommendations.

The core design principle is **neutrality by construction**: the system enforces non-prescriptive language through validation rules, template constraints, and forbidden pattern detection.

## Architecture

The system follows a pipeline architecture with three main stages:

```
[Input] → [Evaluation Engine] → [Explanation Generator] → [Output Validator] → [Structured Output]
```

### High-Level Components

1. **Input Processor**: Accepts and validates user constraints
2. **Evaluation Engine**: Applies scoring matrix and constraint weighting
3. **Explanation Generator**: Creates neutral comparison text and trade-off descriptions
4. **Language Validator**: Ensures output contains no prescriptive or recommendation language
5. **Output Formatter**: Structures data as JSON with embedded explanations

## Components and Interfaces

### 1. Input Processor

**Purpose**: Parse and validate user constraints

**Interface**:
```typescript
interface UserConstraints {
  dataChangeFrequency: 'low' | 'medium' | 'high';
  accuracyRequirement: 'low' | 'medium' | 'high' | 'critical';
  costSensitivity: 'low' | 'medium' | 'high';
}

function processConstraints(input: UserConstraints): ValidatedConstraints;
```

**Behavior**:
- Validates constraint values against allowed enums
- Returns validated constraint object or throws validation error
- No default values - all constraints must be explicitly provided

### 2. Evaluation Engine

**Purpose**: Calculate weighted scores for each architecture based on constraints

**Interface**:
```typescript
interface DimensionScore {
  dimension: Dimension;
  rawScore: number;        // 0-10 scale
  weight: number;          // 0-1 scale based on constraints
  weightedScore: number;   // rawScore * weight
  rationale: string;       // Why this score for this architecture
}

interface ArchitectureEvaluation {
  architecture: Architecture;
  dimensionScores: DimensionScore[];
  totalScore: number;      // Sum of weighted scores
}

function evaluateArchitectures(
  constraints: ValidatedConstraints
): ArchitectureEvaluation[];
```

**Scoring Matrix** (assumed pre-defined):
- Each architecture has base scores (0-10) for each dimension
- Constraint levels modify dimension weights
- All base dimension scores are normalized on a 0–10 scale to improve resolution when applying weighted constraints.
- Example: High cost sensitivity increases cost dimension weight to 0.25, decreases others proportionally

**Weighting Rules**:
- High cost sensitivity: Cost Efficiency weight = 0.25, others = 0.125
- Critical accuracy: Accuracy weight = 0.30, others adjusted
- High data change frequency: Data Freshness weight = 0.25, others adjusted
- Weights always sum to 1.0
- Redistribution Rule: When a constraint increases a dimension’s weight, the remaining weight (1.0 − increased weight) is distributed proportionally across the other dimensions based on their default weights.


### 3. Explanation Generator

**Purpose**: Generate neutral explanations for score differences between architectures

This is the core component for the user's specific requirement: explaining why RAG and Hybrid score differently under high cost sensitivity.

**Interface**:
```typescript
interface ExplanationContext {
  architecture1: ArchitectureEvaluation;
  architecture2: ArchitectureEvaluation;
  constraints: ValidatedConstraints;
  scoreDifference: number;
}

interface Explanation {
  summary: string;                    // High-level difference statement
  dimensionComparisons: DimensionComparison[];
  tradeoffAnalysis: TradeoffStatement[];
  conditionalObservations: ConditionalStatement[];
}

function generatePairwiseExplanation(
  context: ExplanationContext
): Explanation;
```

#### Explanation Generation Rules

**Rule 1: Identify Significant Dimension Differences**
- Calculate delta between weighted scores for each dimension
- Threshold: |delta| > 1.0 is "significant"
- Significant dimensions are included in explanation
- Dimensions are ordered by absolute delta (largest first)

**Rule 2: Reference Constraint Impact**
- When a constraint increases a dimension's weight, explicitly state this
- Template: "Under [constraint level] [constraint type], the [dimension] dimension receives increased weight ([weight value])"
- Example: "Under high cost sensitivity, the Cost Efficiency dimension receives increased weight (0.25)"

**Rule 3: Articulate Architecture-Specific Characteristics**
- For each significant dimension, describe how each architecture performs
- Use factual, descriptive language
- Template: "[Architecture] exhibits [characteristic] in [dimension], resulting in [score description]"

**Rule 4: Explain Score Divergence**
- Explicitly connect dimension differences to total score differences
- Template: "The [X point] difference in total scores stems primarily from [dimension list]"
- Always quantify differences numerically

**Rule 5: Trade-off Balance**
- For each architecture, identify what is gained and what is sacrificed
- Present both sides neutrally
- Template: "[Architecture] trades [sacrifice] for [gain]"
- Never use "better" or "worse" - use "higher/lower", "more/less", "increased/decreased"

#### Specific Logic: RAG vs Hybrid Under High Cost Sensitivity

**Step 1: Identify Cost Structure Differences**
```
RAG Cost Profile:
- Per-query retrieval costs (vector DB queries)
- LLM inference costs (single model)
- No agent orchestration overhead

Hybrid Cost Profile:
- Per-query retrieval costs (vector DB queries)
- LLM inference costs (potentially multiple calls)
- Agent orchestration overhead
- Tool/function calling costs
```

**Step 2: Calculate Weighted Impact**
```
Under high cost sensitivity (weight = 0.25):
- RAG cost score: 7/10 → weighted: 1.75
- Hybrid cost score: 4/10 → weighted: 1.00
- Delta: 0.75 points (significant)
```

**Step 3: Generate Dimension Comparison**
```
Template:
"In the Cost Efficiency dimension (weight: 0.25 under high cost sensitivity):
- RAG scores [X]/10, reflecting [cost characteristics]
- Hybrid scores [Y]/10, reflecting [cost characteristics]
- This [Z]-point difference contributes [weighted delta] to the total score gap"
```

**Step 4: Identify Compensating Dimensions**
```
Check other dimensions where Hybrid outperforms RAG:
- Workflow Complexity: Hybrid may score higher (more complex)
- Accuracy: Hybrid may score higher (agent verification)
- Governance: Hybrid may score higher (audit trails)

Template:
"While Hybrid incurs higher costs, it exhibits [characteristics] in [dimensions], 
scoring [X] points higher in [dimension] (weighted: [Y])"
```

**Step 5: Synthesize Trade-off Statement**
```
Template:
"RAG and Hybrid differ by [X] total points under high cost sensitivity. 
This divergence reflects the trade-off between [RAG characteristic] and [Hybrid characteristic]. 
RAG achieves [benefit] through [mechanism], while Hybrid achieves [benefit] through [mechanism], 
at the expense of [cost]."
```

### 4. Language Validator

**Purpose**: Ensure all generated text is neutral and non-prescriptive

**Interface**:
```typescript
interface ValidationResult {
  isValid: boolean;
  violations: LanguageViolation[];
}

interface LanguageViolation {
  text: string;
  violationType: ViolationType;
  position: number;
}

function validateLanguageNeutrality(text: string): ValidationResult;
```

**Forbidden Patterns**:

1. **Recommendation Language**:
   - "should", "must", "recommend", "suggest", "advise"
   - "you should choose", "we recommend", "it's best to"
   
2. **Superlatives and Rankings**:
   - "best", "worst", "optimal", "ideal", "perfect"
   - "better than", "worse than", "superior", "inferior"
   - "most", "least" (when comparing architectures)

3. **Prescriptive Imperatives**:
   - "use", "avoid", "prefer", "select" (when directed at user)
   - "go with", "pick", "choose" (as commands)

4. **Implied Preferences**:
   - "unfortunately", "fortunately", "luckily"
   - "only", "merely", "just" (when minimizing trade-offs)

**Allowed Patterns**:

1. **Descriptive Comparisons**:
   - "higher", "lower", "more", "less", "increased", "decreased"
   - "exhibits", "demonstrates", "reflects", "indicates"

2. **Conditional Statements**:
   - "IF [condition] THEN [characteristic]"
   - "WHEN [scenario], [architecture] performs [description]"
   - "WHERE [context], [architecture] exhibits [trait]"

3. **Factual Quantification**:
   - Specific numbers, percentages, scores
   - "X points higher", "Y% more expensive", "Z ms faster"

4. **Trade-off Language**:
   - "trades X for Y", "sacrifices X to gain Y"
   - "at the expense of", "in exchange for"

**Validation Algorithm**:
```
1. Tokenize input text
2. For each forbidden pattern:
   a. Search for pattern in text (case-insensitive)
   b. If found, record violation with position
3. Check for conditional statements:
   a. Verify they don't end with recommendation language
4. Check for trade-off statements:
   a. Verify both positive and negative aspects present
5. If comparative adjectives (higher/lower) are used, they must be accompanied by a numeric reference (e.g., “2.1 points higher”).
6. Return validation result
```

### 5. Output Formatter

**Purpose**: Structure all data and explanations into JSON format

Pairwise explanations are generated only for architecture pairs where the absolute total score difference exceeds a configurable threshold (default: 1.5).

**Interface**:
```typescript
interface ComparisonOutput {
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

function formatOutput(
  evaluations: ArchitectureEvaluation[],
  explanations: Explanation[],
  constraints: ValidatedConstraints
): ComparisonOutput;
```

## Data Models

### Core Types

```typescript
type Architecture = 'RAG' | 'Fine-Tuned' | 'Agentic' | 'Hybrid';

type Dimension = 
  | 'Data Freshness'
  | 'Accuracy & Hallucination Control'
  | 'Latency'
  | 'Cost Efficiency'
  | 'Governance & Auditability'
  | 'Workflow Complexity'
  | 'Team & Ops Readiness';

interface DimensionComparison {
  dimension: Dimension;
  weight: number;
  architecture1Score: number;
  architecture2Score: number;
  delta: number;
  description: string;  // Neutral explanation of difference
}

interface TradeoffStatement {
  architecture: Architecture;
  gains: string[];      // What this architecture provides
  sacrifices: string[]; // What this architecture gives up
}

interface ConditionalStatement {
  condition: string;    // "IF high cost sensitivity"
  architecture: Architecture;
  characteristic: string; // "THEN RAG exhibits lower per-query costs"
}
```

### Scoring Matrix Data Structure

```typescript
interface ScoringMatrix {
  architectures: {
    [key in Architecture]: {
      dimensions: {
        [key in Dimension]: {
          baseScore: number;        // 0-10
          rationale: string;        // Why this score
          costCharacteristics?: string;  // For Cost Efficiency dimension
          tradeoffs: {
            gains: string[];
            sacrifices: string[];
          };
        };
      };
    };
  };
}
```

### Constraint Weighting Configuration

```typescript
interface WeightingConfig {
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

interface DimensionWeights {
  [key: Dimension]: number;  // Weights sum to 1.0
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: All architectures return all dimensions

*For any* architecture evaluation, all seven dimensions (Data Freshness, Accuracy & Hallucination Control, Latency, Cost Efficiency, Governance & Auditability, Workflow Complexity, Team & Ops Readiness) must be present with valid scores.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

### Property 2: Constraint input acceptance

*For any* valid constraint object with allowed enum values, the system must accept it without error and use it in evaluation.

**Validates: Requirements 3.1**

### Property 3: Language neutrality

*For any* generated explanation text, it must not contain forbidden patterns (recommendation language, superlatives, prescriptive imperatives, or implied preferences).

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 6.4**

### Property 4: Trade-off balance

*For any* architecture evaluation, trade-off statements must include both gains and sacrifices (non-empty arrays for both).

**Validates: Requirements 4.5, 6.2**

### Property 5: Output structure completeness

*For any* system output, the comparison object must contain evaluations for all four architectures, and each evaluation must contain all seven dimensions.

**Validates: Requirements 5.1, 5.2, 5.3, 5.5**

### Property 6: Constraint context inclusion

*For any* system output, the metadata must include the user-provided constraints that were used for weighting.

**Validates: Requirements 5.4**

### Property 7: Dimension trade-off identification

*For any* dimension in any architecture evaluation, the output must include trade-off information (what is gained and what is sacrificed).

**Validates: Requirements 6.1**

### Property 8: Constraint reference in explanations

*For any* explanation generated when constraints are provided, the explanation text must reference the constraint values (e.g., "high cost sensitivity" must appear when costSensitivity='high').

**Validates: Requirements 6.3, 7.4**

### Property 9: Conditional statement format

*For any* conditional statement in the output, it must follow the IF/THEN pattern and must not contain recommendation language.

**Validates: Requirements 7.1, 7.2**

### Property 10: Weight sum invariant

*For any* constraint configuration, the dimension weights must sum to exactly 1.0 (within floating-point tolerance of 0.001).

**Validates: Requirements 2.1-2.7** (ensures fair weighting across all dimensions)

### Property 11: Score difference explanation

*For any* pairwise explanation between two architectures, if the total score difference is greater than 2.0 points, the explanation must identify at least one dimension with a significant difference (|delta| > 1.0).

**Validates: Requirements 6.1, 6.2**

## Error Handling

### Input Validation Errors

**Invalid Constraint Values**:
- Error: `InvalidConstraintError`
- Message: "Constraint '[name]' has invalid value '[value]'. Allowed values: [list]"
- HTTP Status: 400

**Missing Required Constraints**:
- Error: `MissingConstraintError`
- Message: "Required constraint '[name]' not provided"
- HTTP Status: 400

### Language Validation Errors

**Prescriptive Language Detected**:
- Error: `LanguageViolationError`
- Message: "Generated text contains forbidden pattern '[pattern]' at position [pos]"
- Action: Regenerate explanation with stricter template
- If regeneration fails 3 times, return error to caller

### Data Integrity Errors

**Missing Dimension Data**:
- Error: `IncompleteScoringMatrixError`
- Message: "Architecture '[name]' missing dimension '[dimension]'"
- This indicates a configuration error, not user error

**Weight Sum Mismatch**:
- Error: `InvalidWeightConfigError`
- Message: "Dimension weights sum to [sum], expected 1.0"
- This indicates a configuration error

## Testing Strategy

### Unit Testing

**Input Processor**:
- Test valid constraint combinations
- Test invalid constraint values (expect errors)
- Test missing constraints (expect errors)

**Evaluation Engine**:
- Test score calculation with known inputs
- Test weight application
- Test that weights sum to 1.0

**Explanation Generator**:
- Test RAG vs Hybrid explanation under high cost sensitivity
- Test explanation generation for each architecture pair
- Test dimension comparison ordering (by delta)
- Test trade-off statement generation

**Language Validator**:
- Test detection of each forbidden pattern type
- Test that allowed patterns pass validation
- Test conditional statement validation
- Test trade-off balance checking

**Output Formatter**:
- Test JSON structure conformance
- Test metadata inclusion
- Test completeness of output

### Property-Based Testing

All property-based tests should run a minimum of 100 iterations.

**Property 1 Test**: Generate random architecture names, verify all dimensions present
- **Feature: genai-architecture-referee, Property 1: All architectures return all dimensions**

**Property 2 Test**: Generate random valid constraint objects, verify acceptance
- **Feature: genai-architecture-referee, Property 2: Constraint input acceptance**

**Property 3 Test**: Generate explanations, scan for forbidden patterns
- **Feature: genai-architecture-referee, Property 3: Language neutrality**

**Property 4 Test**: Generate evaluations, verify gains and sacrifices non-empty
- **Feature: genai-architecture-referee, Property 4: Trade-off balance**

**Property 5 Test**: Generate outputs, verify structure completeness
- **Feature: genai-architecture-referee, Property 5: Output structure completeness**

**Property 6 Test**: Generate outputs with constraints, verify constraints in metadata
- **Feature: genai-architecture-referee, Property 6: Constraint context inclusion**

**Property 7 Test**: Generate evaluations, verify trade-off info present for all dimensions
- **Feature: genai-architecture-referee, Property 7: Dimension trade-off identification**

**Property 8 Test**: Generate explanations with constraints, verify constraint keywords present
- **Feature: genai-architecture-referee, Property 8: Constraint reference in explanations**

**Property 9 Test**: Generate conditional statements, verify IF/THEN format and no recommendations
- **Feature: genai-architecture-referee, Property 9: Conditional statement format**

**Property 10 Test**: Generate weight configurations, verify sum equals 1.0
- **Feature: genai-architecture-referee, Property 10: Weight sum invariant**

**Property 11 Test**: Generate pairwise explanations with large score differences, verify significant dimension identified
- **Feature: genai-architecture-referee, Property 11: Score difference explanation**

### Integration Testing

**End-to-End Flow**:
- Input constraints → Evaluation → Explanation → Validation → Output
- Verify complete pipeline produces valid JSON
- Verify no language violations in final output

**RAG vs Hybrid Scenario**:
- Specific test: High cost sensitivity constraint
- Verify explanation references Cost Efficiency dimension
- Verify explanation quantifies score difference
- Verify explanation describes cost characteristics of both architectures
- Verify no recommendation language present

### Test Data

**Scoring Matrix Fixture**:
```typescript
const testScoringMatrix: ScoringMatrix = {
  architectures: {
    'RAG': {
      dimensions: {
        'Cost Efficiency': {
          baseScore: 7,
          rationale: 'Single LLM call per query with retrieval overhead',
          costCharacteristics: 'Per-query vector DB costs plus single LLM inference',
          tradeoffs: {
            gains: ['Predictable per-query costs', 'No agent orchestration overhead'],
            sacrifices: ['Vector DB operational costs', 'Embedding generation costs']
          }
        },
        // ... other dimensions
      }
    },
    'Hybrid': {
      dimensions: {
        'Cost Efficiency': {
          baseScore: 4,
          rationale: 'Multiple LLM calls, agent orchestration, plus retrieval',
          costCharacteristics: 'Retrieval costs plus multi-step agent execution and tool calls',
          tradeoffs: {
            gains: ['Enhanced accuracy through verification', 'Complex workflow support'],
            sacrifices: ['Higher per-query costs', 'Variable cost based on agent steps']
          }
        },
        // ... other dimensions
      }
    },
    // ... other architectures
  }
};
```

**Constraint Weighting Fixture**:
```typescript
const testWeightingConfig: WeightingConfig = {
  constraints: {
    costSensitivity: {
      high: {
        'Data Freshness': 0.10,
        'Accuracy & Hallucination Control': 0.15,
        'Latency': 0.10,
        'Cost Efficiency': 0.25,  // Increased weight
        'Governance & Auditability': 0.15,
        'Workflow Complexity': 0.15,
        'Team & Ops Readiness': 0.10
      },
      // ... other levels
    },
    // ... other constraints
  }
};
```
