/**
 * VALIDATION PIPELINE
 * 
 * Orchestrates validation execution:
 * 1. Runs sync validators immediately
 * 2. Queues and debounces async validators
 * 3. Aggregates results for form-level validation
 */

import type { 
  FieldSchema, 
  ValidationRule, 
  FieldValue, 
  FormValues 
} from '../schema/types';
import type { 
  FieldValidationResult, 
  FormValidationResult,
} from './types';
import { getSyncValidator } from './sync-validators';

/**
 * Validates a single field against its validation rules.
 * Only runs sync validation - async is handled separately.
 */
export function validateFieldSync(
  fieldId: string,
  value: FieldValue,
  rules: ValidationRule[],
  formValues: FormValues
): FieldValidationResult {
  const errors: string[] = [];
  let failedRule: ValidationRule | undefined;
  
  for (const rule of rules) {
    // Skip async rules in sync validation
    if (rule.type === 'async') continue;
    
    // Skip rules with blur/submit trigger during change
    // (This would be controlled by trigger context in full implementation)
    
    const error = validateRule(value, rule, formValues);
    
    if (error) {
      errors.push(rule.message || error);
      failedRule = rule;
      // Stop at first error (fail-fast)
      break;
    }
  }
  
  return {
    fieldId,
    isValid: errors.length === 0,
    errors,
    failedRule,
  };
}

/**
 * Validates a single rule against a value.
 */
function validateRule(
  value: FieldValue,
  rule: ValidationRule,
  formValues: FormValues
): string | null {
  const validator = getSyncValidator(rule.type);
  
  if (!validator) {
    // Custom validator - would lookup in registry
    if (rule.type === 'custom') {
      console.warn(`Custom validator "${(rule as { validator?: string }).validator}" not found`);
      return null;
    }
    console.warn(`Unknown validator type: ${rule.type}`);
    return null;
  }
  
  // Build params object from rule
  const params: Record<string, unknown> = {
    value: (rule as { value?: unknown }).value,
    message: rule.message,
  };
  
  return validator(value, params, formValues);
}

/**
 * Validates all fields in a form.
 * Returns aggregated validation result.
 */
export function validateFormSync(
  fields: FieldSchema[],
  values: FormValues,
  options: {
    /** Only validate fields that have been touched */
    touchedOnly?: boolean;
    /** Set of touched field IDs */
    touchedFields?: Set<string>;
    /** Set of hidden field IDs (skip validation) */
    hiddenFields?: Set<string>;
  } = {}
): FormValidationResult {
  const { touchedOnly = false, touchedFields = new Set(), hiddenFields = new Set() } = options;
  
  const fieldErrors: Record<string, string[]> = {};
  let errorCount = 0;
  
  for (const field of fields) {
    // Skip hidden fields
    if (hiddenFields.has(field.id)) continue;
    
    // Skip untouched fields if touchedOnly
    if (touchedOnly && !touchedFields.has(field.id)) continue;
    
    // Skip fields without validation rules
    if (!field.validation || field.validation.length === 0) continue;
    
    const value = values[field.id] as FieldValue;
    const result = validateFieldSync(field.id, value, field.validation, values);
    
    if (!result.isValid) {
      fieldErrors[field.id] = result.errors;
      errorCount += result.errors.length;
    }
  }
  
  return {
    isValid: errorCount === 0,
    fieldErrors,
    errorCount,
  };
}

/**
 * Debounce utility for async validation.
 */
export function debounce<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  ms: number
): { run: T; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let abortController: AbortController | null = null;
  
  const run = ((...args: unknown[]) => {
    // Cancel previous
    if (timeoutId) clearTimeout(timeoutId);
    if (abortController) abortController.abort();
    
    abortController = new AbortController();
    
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          if ((error as Error).name === 'AbortError') {
            resolve(null);
          } else {
            reject(error);
          }
        }
      }, ms);
    });
  }) as T;
  
  const cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    if (abortController) abortController.abort();
  };
  
  return { run, cancel };
}

/**
 * Creates an async validation runner for a field.
 */
export function createAsyncValidator(
  url: string,
  debounceMs = 300
): {
  validate: (value: FieldValue) => Promise<string | null>;
  cancel: () => void;
} {
  const { run, cancel } = debounce(async (value: FieldValue) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      
      if (!response.ok) {
        throw new Error('Validation request failed');
      }
      
      const result = await response.json();
      return result.valid ? null : result.message;
    } catch (error) {
      console.error('Async validation error:', error);
      // Don't block form submission on network errors
      return null;
    }
  }, debounceMs);
  
  return {
    validate: run as (value: FieldValue) => Promise<string | null>,
    cancel,
  };
}
