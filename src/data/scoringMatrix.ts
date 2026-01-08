/**
 * Scoring Matrix Data Structure
 * Contains base scores, rationales, and trade-offs for all architectures across all dimensions
 */

import { ScoringMatrix } from '../types';

export const SCORING_MATRIX: ScoringMatrix = {
  architectures: {
    'RAG': {
      dimensions: {
        'Data Freshness': {
          baseScore: 8,
          rationale: 'RAG queries updated vector stores at runtime, providing access to recently indexed information without model retraining',
          tradeoffs: {
            gains: ['Real-time access to updated knowledge bases', 'No retraining required for new information'],
            sacrifices: ['Dependent on vector store update frequency', 'Embedding generation latency for new documents']
          }
        },
        'Accuracy & Hallucination Control': {
          baseScore: 6,
          rationale: 'RAG grounds responses in retrieved documents, reducing hallucinations compared to pure generation, but lacks multi-stage verification',
          tradeoffs: {
            gains: ['Grounded in retrieved source documents', 'Reduces pure hallucination'],
            sacrifices: ['Single-pass generation without verification', 'Quality dependent on retrieval accuracy', 'No cross-checking mechanisms']
          }
        },
        'Latency': {
          baseScore: 7,
          rationale: 'RAG completes requests in a single retrieval-generation cycle with predictable latency',
          tradeoffs: {
            gains: ['Single-pass execution', 'Predictable response times'],
            sacrifices: ['Vector search adds overhead vs pure generation', 'Retrieval latency varies with index size']
          }
        },
        'Cost Efficiency': {
          baseScore: 7,
          rationale: 'Single LLM call per query with retrieval overhead',
          costCharacteristics: 'Per-query vector DB costs plus single LLM inference',
          tradeoffs: {
            gains: ['Predictable per-query costs', 'No agent orchestration overhead', 'Single LLM inference call'],
            sacrifices: ['Vector DB operational costs', 'Embedding generation costs', 'Storage costs for vector indices']
          }
        },
        'Governance & Auditability': {
          baseScore: 5,
          rationale: 'RAG provides retrieval logs and generation outputs but lacks intermediate reasoning visibility',
          tradeoffs: {
            gains: ['Source document traceability', 'Retrieval logs available'],
            sacrifices: ['Limited reasoning process visibility', 'No intermediate decision points to audit']
          }
        },
        'Workflow Complexity': {
          baseScore: 8,
          rationale: 'RAG follows a linear retrieve-then-generate pattern with established tooling',
          tradeoffs: {
            gains: ['Linear workflow pattern', 'Well-established tooling', 'Straightforward debugging'],
            sacrifices: ['Vector store management required', 'Embedding pipeline maintenance']
          }
        },
        'Team & Ops Readiness': {
          baseScore: 7,
          rationale: 'RAG aligns with familiar search-then-generate patterns and has established operational practices',
          tradeoffs: {
            gains: ['Familiar search paradigm', 'Established best practices', 'Lower learning curve'],
            sacrifices: ['Vector DB operational expertise needed', 'Embedding model management']
          }
        }
      }
    },
    'Hybrid': {
      dimensions: {
        'Data Freshness': {
          baseScore: 8,
          rationale: 'Hybrid architectures can query updated vector stores and knowledge bases at runtime, similar to RAG',
          tradeoffs: {
            gains: ['Real-time access to updated knowledge', 'Agent can verify information freshness'],
            sacrifices: ['Dependent on vector store update frequency', 'Additional complexity in agent tool integration']
          }
        },
        'Accuracy & Hallucination Control': {
          baseScore: 8,
          rationale: 'Hybrid architectures incorporate agent-based verification steps and multi-stage reasoning, reducing hallucinations through cross-checking',
          tradeoffs: {
            gains: ['Multi-stage verification', 'Agent can cross-check outputs', 'Self-correction capabilities'],
            sacrifices: ['Increased complexity in verification logic', 'Potential for agent reasoning errors']
          }
        },
        'Latency': {
          baseScore: 5,
          rationale: 'Hybrid architectures require multiple sequential LLM calls as agents reason through problems, increasing end-to-end latency',
          tradeoffs: {
            gains: ['Thorough reasoning process', 'Can optimize for accuracy over speed'],
            sacrifices: ['Multiple sequential LLM calls', 'Variable latency based on reasoning depth', 'Tool execution overhead']
          }
        },
        'Cost Efficiency': {
          baseScore: 4,
          rationale: 'Multiple LLM calls, agent orchestration, plus retrieval',
          costCharacteristics: 'Retrieval costs plus multi-step agent execution and tool calls',
          tradeoffs: {
            gains: ['Can optimize agent steps for complex workflows', 'Flexible cost-accuracy trade-offs'],
            sacrifices: ['Higher per-query costs', 'Multiple LLM inference calls', 'Agent orchestration overhead', 'Tool/function calling costs', 'Variable cost based on agent steps']
          }
        },
        'Governance & Auditability': {
          baseScore: 7,
          rationale: 'Agent-based architectures generate detailed execution traces showing reasoning steps, tool calls, and decision points',
          tradeoffs: {
            gains: ['Detailed execution traces', 'Reasoning step visibility', 'Tool invocation logs', 'Decision point tracking'],
            sacrifices: ['Trace volume can be overwhelming', 'Requires trace analysis tooling']
          }
        },
        'Workflow Complexity': {
          baseScore: 4,
          rationale: 'Hybrid architectures require orchestration logic, agent prompt engineering, tool integration, and multi-step coordination',
          tradeoffs: {
            gains: ['Support for complex workflows', 'Flexible tool integration', 'Adaptive reasoning'],
            sacrifices: ['Agent design expertise required', 'Complex debugging', 'Orchestration logic maintenance', 'Tool integration overhead']
          }
        },
        'Team & Ops Readiness': {
          baseScore: 5,
          rationale: 'Hybrid architectures require expertise in agent design, prompt engineering for reasoning, and debugging multi-step workflows',
          tradeoffs: {
            gains: ['Powerful capabilities for complex tasks', 'Growing ecosystem of agent frameworks'],
            sacrifices: ['Steeper learning curve', 'Agent debugging complexity', 'Specialized expertise required', 'Emerging best practices']
          }
        }
      }
    },
    'Fine-Tuned': {
      dimensions: {
        'Data Freshness': {
          baseScore: 3,
          rationale: 'Fine-tuned models require retraining to incorporate new information, limiting data freshness',
          tradeoffs: {
            gains: ['Knowledge baked into model weights', 'No runtime retrieval needed'],
            sacrifices: ['Retraining required for updates', 'Knowledge cutoff at training time', 'Expensive to keep current']
          }
        },
        'Accuracy & Hallucination Control': {
          baseScore: 7,
          rationale: 'Fine-tuning can improve accuracy for specific domains but may increase hallucination risk without grounding',
          tradeoffs: {
            gains: ['Domain-specific accuracy improvements', 'Consistent output style', 'Task-specific optimization'],
            sacrifices: ['No grounding in external sources', 'Potential for confident hallucinations', 'Difficult to update incorrect knowledge']
          }
        },
        'Latency': {
          baseScore: 9,
          rationale: 'Fine-tuned models provide fastest response times with no retrieval or agent overhead',
          tradeoffs: {
            gains: ['Lowest latency', 'No retrieval overhead', 'No multi-step reasoning delays'],
            sacrifices: ['Model size may impact inference speed']
          }
        },
        'Cost Efficiency': {
          baseScore: 6,
          rationale: 'No retrieval or agent costs, but training and hosting expenses',
          costCharacteristics: 'Training costs plus inference costs, no per-query retrieval overhead',
          tradeoffs: {
            gains: ['No retrieval infrastructure costs', 'No agent orchestration overhead', 'Predictable inference costs'],
            sacrifices: ['High upfront training costs', 'Retraining costs for updates', 'Model hosting costs']
          }
        },
        'Governance & Auditability': {
          baseScore: 3,
          rationale: 'Fine-tuned models provide minimal visibility into reasoning or knowledge sources',
          tradeoffs: {
            gains: ['Consistent behavior', 'Reproducible outputs'],
            sacrifices: ['Black box reasoning', 'No source traceability', 'Difficult to audit knowledge']
          }
        },
        'Workflow Complexity': {
          baseScore: 6,
          rationale: 'Fine-tuning requires training pipeline but simpler inference workflow',
          tradeoffs: {
            gains: ['Simple inference workflow', 'No runtime orchestration'],
            sacrifices: ['Training pipeline complexity', 'Data preparation overhead', 'Model versioning challenges']
          }
        },
        'Team & Ops Readiness': {
          baseScore: 5,
          rationale: 'Fine-tuning requires ML expertise for training but simpler deployment',
          tradeoffs: {
            gains: ['Standard ML deployment patterns', 'No agent expertise needed'],
            sacrifices: ['ML training expertise required', 'Data curation skills needed', 'Model evaluation complexity']
          }
        }
      }
    },
    'Agentic': {
      dimensions: {
        'Data Freshness': {
          baseScore: 9,
          rationale: 'Agentic systems can query live APIs and databases, providing real-time information access',
          tradeoffs: {
            gains: ['Real-time data access', 'Live API integration', 'Most current information available'],
            sacrifices: ['Dependent on external API availability', 'API rate limits and costs']
          }
        },
        'Accuracy & Hallucination Control': {
          baseScore: 7,
          rationale: 'Agents can verify information through multiple sources and self-correction, but complex reasoning may introduce errors',
          tradeoffs: {
            gains: ['Multi-source verification', 'Self-correction capabilities', 'Can validate outputs'],
            sacrifices: ['Agent reasoning errors possible', 'Complex workflows harder to validate', 'Tool selection errors']
          }
        },
        'Latency': {
          baseScore: 4,
          rationale: 'Agentic systems may require many sequential steps and tool calls, resulting in high latency',
          tradeoffs: {
            gains: ['Thorough problem-solving', 'Can optimize for correctness'],
            sacrifices: ['Multiple sequential LLM calls', 'Tool execution delays', 'Highly variable latency']
          }
        },
        'Cost Efficiency': {
          baseScore: 3,
          rationale: 'Highest costs due to multiple LLM calls, tool executions, and potential retry loops',
          costCharacteristics: 'Multiple LLM calls plus tool execution costs plus potential retry overhead',
          tradeoffs: {
            gains: ['Can optimize for complex tasks', 'Flexible cost-accuracy trade-offs'],
            sacrifices: ['Highest per-query costs', 'Many LLM inference calls', 'Tool API costs', 'Retry and error handling overhead']
          }
        },
        'Governance & Auditability': {
          baseScore: 8,
          rationale: 'Agentic systems provide comprehensive execution traces with all reasoning steps and tool calls',
          tradeoffs: {
            gains: ['Complete execution traces', 'Full reasoning visibility', 'Tool call logs', 'Decision audit trail'],
            sacrifices: ['Very large trace volumes', 'Complex trace analysis required']
          }
        },
        'Workflow Complexity': {
          baseScore: 3,
          rationale: 'Agentic systems are most complex, requiring agent design, tool integration, and orchestration logic',
          tradeoffs: {
            gains: ['Maximum flexibility', 'Can handle complex workflows', 'Adaptive behavior'],
            sacrifices: ['Highest complexity', 'Difficult debugging', 'Many integration points', 'Unpredictable behavior']
          }
        },
        'Team & Ops Readiness': {
          baseScore: 4,
          rationale: 'Agentic systems require specialized expertise in agent design, tool integration, and complex debugging',
          tradeoffs: {
            gains: ['Cutting-edge capabilities', 'Growing framework ecosystem'],
            sacrifices: ['Highest learning curve', 'Specialized skills required', 'Limited established patterns', 'Complex operational requirements']
          }
        }
      }
    }
  }
};
