/**
 * Input Processor
 * Validates user constraints and returns validated constraint object
 */

import { UserConstraints, ValidatedConstraints } from '../types';

// Custom error classes for better error handling
export class InvalidConstraintError extends Error {
  constructor(constraintName: string, value: string, allowedValues: string[]) {
    super(
      `Constraint '${constraintName}' has invalid value '${value}'. Allowed values: ${allowedValues.join(', ')}`
    );
    this.name = 'InvalidConstraintError';
  }
}

export class MissingConstraintError extends Error {
  constructor(constraintName: string) {
    super(`Required constraint '${constraintName}' not provided`);
    this.name = 'MissingConstraintError';
  }
}

// Allowed values for each constraint
const ALLOWED_DATA_CHANGE_FREQUENCY = ['low', 'medium', 'high'] as const;
const ALLOWED_ACCURACY_REQUIREMENT = ['low', 'medium', 'high', 'critical'] as const;
const ALLOWED_COST_SENSITIVITY = ['low', 'medium', 'high'] as const;

/**
 * Validates user constraints
 * @param input - User-provided constraints
 * @returns ValidatedConstraints object
 * @throws InvalidConstraintError if constraint values are invalid
 * @throws MissingConstraintError if required constraints are missing
 */
export function processConstraints(input: Partial<UserConstraints>): ValidatedConstraints {
  // Check for missing constraints
  if (input.dataChangeFrequency === undefined) {
    throw new MissingConstraintError('dataChangeFrequency');
  }
  if (input.accuracyRequirement === undefined) {
    throw new MissingConstraintError('accuracyRequirement');
  }
  if (input.costSensitivity === undefined) {
    throw new MissingConstraintError('costSensitivity');
  }

  // Validate dataChangeFrequency
  if (!ALLOWED_DATA_CHANGE_FREQUENCY.includes(input.dataChangeFrequency as any)) {
    throw new InvalidConstraintError(
      'dataChangeFrequency',
      String(input.dataChangeFrequency),
      [...ALLOWED_DATA_CHANGE_FREQUENCY]
    );
  }

  // Validate accuracyRequirement
  if (!ALLOWED_ACCURACY_REQUIREMENT.includes(input.accuracyRequirement as any)) {
    throw new InvalidConstraintError(
      'accuracyRequirement',
      String(input.accuracyRequirement),
      [...ALLOWED_ACCURACY_REQUIREMENT]
    );
  }

  // Validate costSensitivity
  if (!ALLOWED_COST_SENSITIVITY.includes(input.costSensitivity as any)) {
    throw new InvalidConstraintError(
      'costSensitivity',
      String(input.costSensitivity),
      [...ALLOWED_COST_SENSITIVITY]
    );
  }

  // Return validated constraints
  return {
    dataChangeFrequency: input.dataChangeFrequency,
    accuracyRequirement: input.accuracyRequirement,
    costSensitivity: input.costSensitivity
  };
}

/**
 * Type guard to check if an object is a valid UserConstraints object
 */
export function isValidUserConstraints(obj: any): obj is UserConstraints {
  try {
    processConstraints(obj);
    return true;
  } catch {
    return false;
  }
}
