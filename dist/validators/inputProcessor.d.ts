/**
 * Input Processor
 * Validates user constraints and returns validated constraint object
 */
import { UserConstraints, ValidatedConstraints } from '../types';
export declare class InvalidConstraintError extends Error {
    constructor(constraintName: string, value: string, allowedValues: string[]);
}
export declare class MissingConstraintError extends Error {
    constructor(constraintName: string);
}
/**
 * Validates user constraints
 * @param input - User-provided constraints
 * @returns ValidatedConstraints object
 * @throws InvalidConstraintError if constraint values are invalid
 * @throws MissingConstraintError if required constraints are missing
 */
export declare function processConstraints(input: Partial<UserConstraints>): ValidatedConstraints;
/**
 * Type guard to check if an object is a valid UserConstraints object
 */
export declare function isValidUserConstraints(obj: any): obj is UserConstraints;
//# sourceMappingURL=inputProcessor.d.ts.map