/**
 * Tests for Input Processor
 * Feature: genai-architecture-referee, Property 2: Constraint input acceptance
 * Validates: Requirements 3.1
 */

import * as fc from 'fast-check';
import {
  processConstraints,
  InvalidConstraintError,
  MissingConstraintError
} from '../src/validators/inputProcessor';
import { UserConstraints } from '../src/types';

describe('Input Processor', () => {
  describe('Property 2: Constraint input acceptance', () => {
    it('should accept any valid constraint object without error', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('low', 'medium', 'high'),
          fc.constantFrom('low', 'medium', 'high', 'critical'),
          fc.constantFrom('low', 'medium', 'high'),
          (dataChangeFrequency, accuracyRequirement, costSensitivity) => {
            const input: UserConstraints = {
              dataChangeFrequency: dataChangeFrequency as 'low' | 'medium' | 'high',
              accuracyRequirement: accuracyRequirement as 'low' | 'medium' | 'high' | 'critical',
              costSensitivity: costSensitivity as 'low' | 'medium' | 'high'
            };

            // Property: Valid constraints should be accepted without throwing
            const result = processConstraints(input);

            // Property: Output should match input
            expect(result.dataChangeFrequency).toBe(input.dataChangeFrequency);
            expect(result.accuracyRequirement).toBe(input.accuracyRequirement);
            expect(result.costSensitivity).toBe(input.costSensitivity);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Valid Constraint Handling', () => {
    it('should accept valid constraints for high cost sensitivity scenario', () => {
      const input: UserConstraints = {
        dataChangeFrequency: 'high',
        accuracyRequirement: 'critical',
        costSensitivity: 'high'
      };

      const result = processConstraints(input);

      expect(result).toEqual(input);
    });

    it('should accept all valid dataChangeFrequency values', () => {
      ['low', 'medium', 'high'].forEach(value => {
        const input: UserConstraints = {
          dataChangeFrequency: value as 'low' | 'medium' | 'high',
          accuracyRequirement: 'medium',
          costSensitivity: 'medium'
        };
        expect(() => processConstraints(input)).not.toThrow();
      });
    });

    it('should accept all valid accuracyRequirement values', () => {
      ['low', 'medium', 'high', 'critical'].forEach(value => {
        const input: UserConstraints = {
          dataChangeFrequency: 'medium',
          accuracyRequirement: value as 'low' | 'medium' | 'high' | 'critical',
          costSensitivity: 'medium'
        };
        expect(() => processConstraints(input)).not.toThrow();
      });
    });

    it('should accept all valid costSensitivity values', () => {
      ['low', 'medium', 'high'].forEach(value => {
        const input: UserConstraints = {
          dataChangeFrequency: 'medium',
          accuracyRequirement: 'medium',
          costSensitivity: value as 'low' | 'medium' | 'high'
        };
        expect(() => processConstraints(input)).not.toThrow();
      });
    });
  });

  describe('Invalid Constraint Handling', () => {
    it('should throw InvalidConstraintError for invalid dataChangeFrequency', () => {
      const input = {
        dataChangeFrequency: 'invalid',
        accuracyRequirement: 'medium',
        costSensitivity: 'medium'
      };

      expect(() => processConstraints(input as any)).toThrow(InvalidConstraintError);
      expect(() => processConstraints(input as any)).toThrow(
        "Constraint 'dataChangeFrequency' has invalid value 'invalid'"
      );
    });

    it('should throw InvalidConstraintError for invalid accuracyRequirement', () => {
      const input = {
        dataChangeFrequency: 'medium',
        accuracyRequirement: 'invalid',
        costSensitivity: 'medium'
      };

      expect(() => processConstraints(input as any)).toThrow(InvalidConstraintError);
      expect(() => processConstraints(input as any)).toThrow(
        "Constraint 'accuracyRequirement' has invalid value 'invalid'"
      );
    });

    it('should throw InvalidConstraintError for invalid costSensitivity', () => {
      const input = {
        dataChangeFrequency: 'medium',
        accuracyRequirement: 'medium',
        costSensitivity: 'invalid'
      };

      expect(() => processConstraints(input as any)).toThrow(InvalidConstraintError);
      expect(() => processConstraints(input as any)).toThrow(
        "Constraint 'costSensitivity' has invalid value 'invalid'"
      );
    });
  });

  describe('Missing Constraint Handling', () => {
    it('should throw MissingConstraintError for missing dataChangeFrequency', () => {
      const input = {
        accuracyRequirement: 'medium',
        costSensitivity: 'medium'
      };

      expect(() => processConstraints(input as any)).toThrow(MissingConstraintError);
      expect(() => processConstraints(input as any)).toThrow(
        "Required constraint 'dataChangeFrequency' not provided"
      );
    });

    it('should throw MissingConstraintError for missing accuracyRequirement', () => {
      const input = {
        dataChangeFrequency: 'medium',
        costSensitivity: 'medium'
      };

      expect(() => processConstraints(input as any)).toThrow(MissingConstraintError);
      expect(() => processConstraints(input as any)).toThrow(
        "Required constraint 'accuracyRequirement' not provided"
      );
    });

    it('should throw MissingConstraintError for missing costSensitivity', () => {
      const input = {
        dataChangeFrequency: 'medium',
        accuracyRequirement: 'medium'
      };

      expect(() => processConstraints(input as any)).toThrow(MissingConstraintError);
      expect(() => processConstraints(input as any)).toThrow(
        "Required constraint 'costSensitivity' not provided"
      );
    });

    it('should throw MissingConstraintError for empty object', () => {
      const input = {};

      expect(() => processConstraints(input as any)).toThrow(MissingConstraintError);
    });
  });
});
