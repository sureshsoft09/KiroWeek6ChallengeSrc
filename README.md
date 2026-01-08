# GenAI Architecture Referee

A decision-support system that produces structured, neutral comparison data for GenAI architectural patterns **without making recommendations**.

---

## Overview

The GenAI Architecture Referee evaluates four GenAI architectures across seven dimensions, applies constraint-based weighting, and generates **neutral explanations that articulate trade-offs** without prescriptive language.

The system is designed to help users **choose**, not simply consume answers.

---

## Why This Project

This project was built for **Kiro Heroes – Week 6: The Referee Challenge**.

The objective is not to answer *"Which architecture should I choose?"*, but to:

- Compare multiple GenAI architectural options under real-world constraints  
- Explain **why differences exist** using transparent scoring and weighting  
- Surface **trade-offs** without recommendations or rankings  
- Preserve neutrality through enforced language rules  

The system intentionally acts as a **referee**, not an advisor.

---

## Architectures Evaluated

- **RAG** (Retrieval-Augmented Generation)
- **Fine-Tuned Models**
- **Agentic AI**
- **Hybrid** (RAG + Agents)

---

## Evaluation Dimensions

1. **Data Freshness** – How current the information is  
2. **Accuracy & Hallucination Control** – Correctness and reliability  
3. **Latency** – Response time performance  
4. **Cost Efficiency** – Operational and infrastructure costs  
5. **Governance & Auditability** – Compliance and traceability  
6. **Workflow Complexity** – Implementation and maintenance effort  
7. **Team & Ops Readiness** – Required skills and operational maturity  

---

## User Constraints

The system accepts three constraint types that dynamically modify dimension weights:

- **Data Change Frequency**: `low` | `medium` | `high`  
- **Accuracy Requirement**: `low` | `medium` | `high` | `critical`  
- **Cost Sensitivity**: `low` | `medium` | `high`  

These constraints **steer evaluation behavior** without altering base architecture characteristics.

---

## Key Features

- **Neutrality by Construction**  
  Language validation enforces non-prescriptive output.

- **Constraint-Driven Weighting**  
  User constraints dynamically adjust dimension weights.

- **Agent Steering via Constraints**  
  Constraints act as steering signals influencing scoring, weighting, and explanations.

- **Type Safety**  
  Strict TypeScript typing across the entire system.

- **Structured Output**  
  JSON format with metadata, evaluations, and pairwise explanations.

- **Comprehensive Testing**  
  Property-based and unit tests validate correctness and neutrality.

---

## Non-Goals

This system intentionally does **not**:

- Recommend a "best" architecture  
- Rank architectures subjectively  
- Replace human architectural decision-making  
- Optimize for a single metric  

Its purpose is **transparent comparison and trade-off explanation**.

---

## Installation

```bash
npm install
```

---

## Build

```bash
npm run build
```

---

## Test

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

---

## Usage

### Basic Example

```typescript
import { compareArchitectures } from './src/index';

const constraints = {
  dataChangeFrequency: 'high',
  accuracyRequirement: 'critical',
  costSensitivity: 'high'
};

const result = compareArchitectures(constraints);
console.log(JSON.stringify(result, null, 2));
```

---

## Output Structure

```json
{
  "metadata": {
    "timestamp": "2026-01-08T...",
    "constraints": { ... },
    "architecturesEvaluated": ["RAG", "Fine-Tuned", "Agentic", "Hybrid"]
  },
  "evaluations": [
    {
      "architecture": "RAG",
      "totalScore": 6.80,
      "dimensionScores": [ ... ]
    }
  ],
  "pairwiseExplanations": {
    "RAG vs Hybrid": {
      "summary": "...",
      "dimensionComparisons": [ ... ],
      "tradeoffs": { ... },
      "conditionalStatements": [ ... ]
    }
  },
  "dimensionSummaries": [ ... ]
}
```

---

## Project Structure

```
src/
  ├── index.ts               - Main orchestration function
  ├── types/                 - Core TypeScript type definitions
  │   └── index.ts
  ├── data/                  - Scoring matrix and weighting configuration
  │   ├── scoringMatrix.ts
  │   └── weightingConfig.ts
  ├── validators/            - Input validation and language neutrality
  │   ├── inputProcessor.ts
  │   └── languageValidator.ts
  ├── evaluators/            - Scoring and evaluation engine
  │   └── evaluationEngine.ts
  ├── generators/            - Explanation generation logic
  │   └── explanationGenerator.ts
  └── formatters/            - Output formatting
      └── outputFormatter.ts

tests/
  ├── types.test.ts
  ├── weightingConfig.test.ts
  ├── inputProcessor.test.ts
  ├── evaluationEngine.test.ts
  ├── languageValidator.test.ts
  ├── explanationGenerator.test.ts
  ├── outputFormatter.test.ts
  └── integration.test.ts

.kiro/specs/genai-architecture-referee/
  ├── requirements.md
  ├── design.md
  └── tasks.md
```

---

## Design Principles

### 1. Neutrality by Construction

Neutrality is enforced through:

- Template-based explanation generation
- Forbidden-pattern detection (recommend, should, best, etc.)
- Regeneration on validation failure
- Test coverage preventing prescriptive language leaks

Allowed language includes:

- "higher / lower"
- "exhibits / reflects"
- "trades X for Y"

### 2. Constraint-Driven Weighting

Constraints dynamically adjust dimension weights:

- High Cost Sensitivity → Cost Efficiency = 0.25
- Critical Accuracy → Accuracy = 0.30
- High Data Change Frequency → Data Freshness = 0.25

Weights always sum to 1.0 through proportional redistribution.

### 3. Property-Based Testing

Core correctness properties validated with 100+ iterations:

- Property 1: All architectures return all dimensions
- Property 3: Language neutrality
- Property 5: Output structure completeness
- Property 8: Constraint reference in explanations

### 4. Traceability

- Requirements follow EARS patterns
- Each correctness property maps to requirements
- Tasks reference requirements for full traceability
- Spec-driven development from requirements → design → implementation

---

## Example Scenario: RAG vs Hybrid (High Cost Sensitivity)

### Scores

- **RAG**: 6.80 total
  - Cost Efficiency: 7/10 × 0.25 = 1.75
- **Hybrid**: 5.65 total
  - Cost Efficiency: 4/10 × 0.25 = 1.00

### Explanation (example output produced by the explanation generator)

> "RAG exhibits a 1.15 point higher total score than Hybrid. Under high cost sensitivity, the Cost Efficiency dimension receives increased weight (0.25). RAG scores 7/10 on Cost Efficiency (1.75 weighted) while Hybrid scores 4/10 (1.00 weighted), contributing a 0.75 point difference. RAG trades lower accuracy for higher cost efficiency, while Hybrid gains improved accuracy but sacrifices cost efficiency."

This text is not manually written and follows the templates and language validation rules defined in design.md.

---

## Testing

- 96 total tests (all passing)
- Property-based tests with 100+ iterations
- Unit tests for edge cases and known scenarios
- Integration tests validating the full pipeline

Test categories include:

- Constraint processing
- Score calculation
- Language neutrality
- Explanation generation
- JSON output structure
- End-to-end execution

---

## Development Methodology

### Spec-Driven Development

1. **Requirements** – EARS-formatted specifications
2. **Design** – Architecture, correctness properties
3. **Tasks** – Incremental implementation plan
4. **Implementation** – Strict TypeScript
5. **Testing** – Property-based + unit tests

---

## Extensibility

### Adding New Architectures

1. Add to Architecture type
2. Add scores to scoringMatrix
3. Update tests

### Adding New Dimensions

1. Add to Dimension type
2. Update scoring matrix
3. Update weighting config
4. Update tests

---

## Contributing

This is a demonstration project built using spec-driven development for an architectural decision-support use case.

Questions or suggestions are welcome via issues.

---
