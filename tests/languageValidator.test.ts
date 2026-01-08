/**
 * Tests for Language Validator
 * Feature: genai-architecture-referee, Property 3: Language neutrality
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 6.4
 */

import * as fc from 'fast-check';
import {
  validateLanguageNeutrality,
  validateConditionalFormat,
  validateTradeoffBalance,
  containsAllowedPatterns
} from '../src/validators/languageValidator';

describe('Language Validator', () => {
  describe('Property 3: Language neutrality', () => {
    it('should reject any text containing forbidden patterns', () => {
      const forbiddenPatterns = [
        'should',
        'must',
        'recommend',
        'best',
        'worst',
        'optimal',
        'better than',
        'you should choose'
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...forbiddenPatterns),
          fc.string(),
          (pattern, randomText) => {
            const textWithPattern = `${randomText} ${pattern} ${randomText}`;
            const result = validateLanguageNeutrality(textWithPattern);
            
            // Property: Text with forbidden patterns must be invalid
            expect(result.isValid).toBe(false);
            expect(result.violations.length).toBeGreaterThan(0);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept text with only allowed patterns', () => {
      const allowedPhrases = [
        'RAG exhibits higher cost efficiency',
        'Hybrid demonstrates lower latency',
        'The system reflects increased complexity',
        'This architecture trades cost for accuracy',
        'RAG gains simplicity at the expense of accuracy'
      ];

      allowedPhrases.forEach(phrase => {
        const result = validateLanguageNeutrality(phrase);
        expect(result.isValid).toBe(true);
        expect(result.violations).toHaveLength(0);
      });
    });
  });

  describe('Forbidden Pattern Detection', () => {
    describe('Recommendation Language', () => {
      it('should detect "should"', () => {
        const result = validateLanguageNeutrality('You should use RAG');
        expect(result.isValid).toBe(false);
        expect(result.violations.some(v => v.violationType === 'recommendation')).toBe(true);
      });

      it('should detect "recommend"', () => {
        const result = validateLanguageNeutrality('We recommend Hybrid architecture');
        expect(result.isValid).toBe(false);
        expect(result.violations.some(v => v.violationType === 'recommendation')).toBe(true);
      });

      it('should detect "must"', () => {
        const result = validateLanguageNeutrality('You must choose this option');
        expect(result.isValid).toBe(false);
        expect(result.violations.some(v => v.violationType === 'recommendation')).toBe(true);
      });
    });

    describe('Superlative Language', () => {
      it('should detect "best"', () => {
        const result = validateLanguageNeutrality('RAG is the best choice');
        expect(result.isValid).toBe(false);
        expect(result.violations.some(v => v.violationType === 'superlative')).toBe(true);
      });

      it('should detect "worst"', () => {
        const result = validateLanguageNeutrality('This is the worst option');
        expect(result.isValid).toBe(false);
        expect(result.violations.some(v => v.violationType === 'superlative')).toBe(true);
      });

      it('should detect "optimal"', () => {
        const result = validateLanguageNeutrality('The optimal solution is RAG');
        expect(result.isValid).toBe(false);
        expect(result.violations.some(v => v.violationType === 'superlative')).toBe(true);
      });

      it('should detect "better than"', () => {
        const result = validateLanguageNeutrality('RAG is better than Hybrid');
        expect(result.isValid).toBe(false);
        expect(result.violations.some(v => v.violationType === 'superlative')).toBe(true);
      });
    });

    describe('Prescriptive Language', () => {
      it('should detect "use this"', () => {
        const result = validateLanguageNeutrality('Use this architecture');
        expect(result.isValid).toBe(false);
        expect(result.violations.some(v => v.violationType === 'prescriptive')).toBe(true);
      });

      it('should detect "avoid this"', () => {
        const result = validateLanguageNeutrality('Avoid this approach');
        expect(result.isValid).toBe(false);
        expect(result.violations.some(v => v.violationType === 'prescriptive')).toBe(true);
      });

      it('should detect "prefer"', () => {
        const result = validateLanguageNeutrality('Prefer RAG over Hybrid');
        expect(result.isValid).toBe(false);
        expect(result.violations.some(v => v.violationType === 'prescriptive')).toBe(true);
      });
    });

    describe('Implied Preference Language', () => {
      it('should detect "unfortunately"', () => {
        const result = validateLanguageNeutrality('Unfortunately, this has high cost');
        expect(result.isValid).toBe(false);
        expect(result.violations.some(v => v.violationType === 'implied_preference')).toBe(true);
      });

      it('should detect "fortunately"', () => {
        const result = validateLanguageNeutrality('Fortunately, RAG is simple');
        expect(result.isValid).toBe(false);
        expect(result.violations.some(v => v.violationType === 'implied_preference')).toBe(true);
      });
    });
  });

  describe('Allowed Pattern Validation', () => {
    it('should accept descriptive comparisons', () => {
      const phrases = [
        'RAG scores higher in cost efficiency',
        'Hybrid exhibits lower latency',
        'This architecture demonstrates increased complexity',
        'The system reflects more operational overhead'
      ];

      phrases.forEach(phrase => {
        const result = validateLanguageNeutrality(phrase);
        expect(result.isValid).toBe(true);
      });
    });

    it('should accept trade-off language', () => {
      const phrases = [
        'RAG trades accuracy for simplicity',
        'Hybrid gains verification at the expense of cost',
        'This architecture sacrifices speed in exchange for accuracy'
      ];

      phrases.forEach(phrase => {
        const result = validateLanguageNeutrality(phrase);
        expect(result.isValid).toBe(true);
      });
    });

    it('should accept factual quantification', () => {
      const phrases = [
        'RAG scores 7 out of 10',
        'The difference is 1.5 points',
        'Cost increases by 25%',
        'Latency is 200ms faster'
      ];

      phrases.forEach(phrase => {
        const result = validateLanguageNeutrality(phrase);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('Conditional Statement Validation', () => {
    it('should accept valid IF/THEN statements', () => {
      const statements = [
        'IF cost sensitivity is high THEN RAG exhibits lower per-query costs',
        'IF accuracy is critical THEN Hybrid demonstrates enhanced verification',
        'IF data changes frequently THEN RAG provides real-time access'
      ];

      statements.forEach(statement => {
        expect(validateConditionalFormat(statement)).toBe(true);
      });
    });

    it('should reject statements without IF', () => {
      const statement = 'THEN RAG exhibits lower costs';
      expect(validateConditionalFormat(statement)).toBe(false);
    });

    it('should reject statements without THEN', () => {
      const statement = 'IF cost sensitivity is high';
      expect(validateConditionalFormat(statement)).toBe(false);
    });

    it('should reject statements with THEN before IF', () => {
      const statement = 'THEN RAG exhibits lower costs IF cost is high';
      expect(validateConditionalFormat(statement)).toBe(false);
    });

    it('should reject conditionals with recommendation language after THEN', () => {
      const statement = 'IF cost is high THEN you should use RAG';
      expect(validateConditionalFormat(statement)).toBe(false);
    });
  });

  describe('Trade-off Balance Validation', () => {
    it('should accept trade-offs with both gains and sacrifices', () => {
      const gains = ['Lower cost', 'Simpler workflow'];
      const sacrifices = ['Reduced accuracy', 'Limited verification'];
      
      expect(validateTradeoffBalance(gains, sacrifices)).toBe(true);
    });

    it('should reject trade-offs with empty gains', () => {
      const gains: string[] = [];
      const sacrifices = ['Reduced accuracy'];
      
      expect(validateTradeoffBalance(gains, sacrifices)).toBe(false);
    });

    it('should reject trade-offs with empty sacrifices', () => {
      const gains = ['Lower cost'];
      const sacrifices: string[] = [];
      
      expect(validateTradeoffBalance(gains, sacrifices)).toBe(false);
    });

    it('should reject trade-offs with both empty', () => {
      const gains: string[] = [];
      const sacrifices: string[] = [];
      
      expect(validateTradeoffBalance(gains, sacrifices)).toBe(false);
    });
  });

  describe('Allowed Pattern Detection', () => {
    it('should detect allowed descriptive patterns', () => {
      expect(containsAllowedPatterns('RAG exhibits higher cost efficiency')).toBe(true);
      expect(containsAllowedPatterns('Hybrid demonstrates lower latency')).toBe(true);
      expect(containsAllowedPatterns('The system reflects increased complexity')).toBe(true);
    });

    it('should detect allowed trade-off patterns', () => {
      expect(containsAllowedPatterns('RAG trades cost for accuracy')).toBe(true);
      expect(containsAllowedPatterns('Hybrid gains verification at the expense of cost')).toBe(true);
      expect(containsAllowedPatterns('This sacrifices speed in exchange for accuracy')).toBe(true);
    });
  });

  describe('Case Insensitivity', () => {
    it('should detect forbidden patterns regardless of case', () => {
      const variations = [
        'You SHOULD use RAG',
        'The BEST choice is Hybrid',
        'We RECOMMEND this option',
        'This is OPTIMAL'
      ];

      variations.forEach(text => {
        const result = validateLanguageNeutrality(text);
        expect(result.isValid).toBe(false);
      });
    });
  });
});