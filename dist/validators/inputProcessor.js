"use strict";
/**
 * Input Processor
 * Validates user constraints and returns validated constraint object
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingConstraintError = exports.InvalidConstraintError = void 0;
exports.processConstraints = processConstraints;
exports.isValidUserConstraints = isValidUserConstraints;
// Custom error classes for better error handling
class InvalidConstraintError extends Error {
    constructor(constraintName, value, allowedValues) {
        super(`Constraint '${constraintName}' has invalid value '${value}'. Allowed values: ${allowedValues.join(', ')}`);
        this.name = 'InvalidConstraintError';
    }
}
exports.InvalidConstraintError = InvalidConstraintError;
class MissingConstraintError extends Error {
    constructor(constraintName) {
        super(`Required constraint '${constraintName}' not provided`);
        this.name = 'MissingConstraintError';
    }
}
exports.MissingConstraintError = MissingConstraintError;
// Allowed values for each constraint
const ALLOWED_DATA_CHANGE_FREQUENCY = ['low', 'medium', 'high'];
const ALLOWED_ACCURACY_REQUIREMENT = ['low', 'medium', 'high', 'critical'];
const ALLOWED_COST_SENSITIVITY = ['low', 'medium', 'high'];
/**
 * Validates user constraints
 * @param input - User-provided constraints
 * @returns ValidatedConstraints object
 * @throws InvalidConstraintError if constraint values are invalid
 * @throws MissingConstraintError if required constraints are missing
 */
function processConstraints(input) {
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
    if (!ALLOWED_DATA_CHANGE_FREQUENCY.includes(input.dataChangeFrequency)) {
        throw new InvalidConstraintError('dataChangeFrequency', String(input.dataChangeFrequency), [...ALLOWED_DATA_CHANGE_FREQUENCY]);
    }
    // Validate accuracyRequirement
    if (!ALLOWED_ACCURACY_REQUIREMENT.includes(input.accuracyRequirement)) {
        throw new InvalidConstraintError('accuracyRequirement', String(input.accuracyRequirement), [...ALLOWED_ACCURACY_REQUIREMENT]);
    }
    // Validate costSensitivity
    if (!ALLOWED_COST_SENSITIVITY.includes(input.costSensitivity)) {
        throw new InvalidConstraintError('costSensitivity', String(input.costSensitivity), [...ALLOWED_COST_SENSITIVITY]);
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
function isValidUserConstraints(obj) {
    try {
        processConstraints(obj);
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=inputProcessor.js.map