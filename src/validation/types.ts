/**
 * VALIDATION TYPES
 * 
 * Types for the validation pipeline.
 * Kept separate from schema types for clarity.
 */

import type { ValidationRule, FieldValue, FormValues } from '../schema/types';

/**
 * Result of validating a single field.
 */
export interface FieldValidationResult {
  fieldId: string;
  isValid: boolean;
  errors: string[];
  /** Which rule failed (for debugging) */
  failedRule?: ValidationRule;
}

/**
 * Result of validating the entire form.
 */
export interface FormValidationResult {
  isValid: boolean;
  fieldErrors: Record<string, string[]>;
  /** Count of total errors */
  errorCount: number;
}

/**
 * Sync validator function signature.
 * Returns error message if invalid, null if valid.
 */
export type SyncValidator = (
  value: FieldValue,
  params?: Record<string, unknown>,
  formValues?: FormValues
) => string | null;

/**
 * Async validator function signature.
 * Returns error message if invalid, null if valid.
 */
export type AsyncValidator = (
  value: FieldValue,
  params?: Record<string, unknown>,
  formValues?: FormValues
) => Promise<string | null>;

/**
 * Registry of custom validators.
 */
export interface ValidatorRegistry {
  sync: Map<string, SyncValidator>;
  async: Map<string, AsyncValidator>;
}

/**
 * Validation context passed to validators.
 */
export interface ValidationContext {
  fieldId: string;
  formValues: FormValues;
  /** Abort signal for cancelling async validation */
  signal?: AbortSignal;
}
