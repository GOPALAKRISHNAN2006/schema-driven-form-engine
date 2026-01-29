/**
 * useValidation Hook
 * 
 * Provides field-level and form-level validation.
 * Handles both sync and async validation with debouncing.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useFormContext, useFormDispatch } from '@/state';
import { formActions } from '@/state/actions';
import { validateFieldSync } from '@/validation/pipeline';
import type { ValidationRule, FieldValue } from '@/schema/types';

export interface UseFieldValidationOptions {
  /** Field ID */
  fieldId: string;
  /** Validation rules from schema */
  rules?: ValidationRule[];
  /** Debounce delay for async validation (ms) */
  debounceMs?: number;
}

export interface UseFieldValidationResult {
  /** Current validation error */
  error: string | null;
  /** Whether async validation is in progress */
  isValidating: boolean;
  /** Validate the current value */
  validate: (value: FieldValue) => Promise<string | null>;
  /** Clear validation error */
  clearError: () => void;
}

/**
 * Hook for field-level validation.
 * 
 * @example
 * const { error, isValidating, validate } = useFieldValidation({
 *   fieldId: 'email',
 *   rules: [{ type: 'required' }, { type: 'email' }],
 * });
 */
export function useFieldValidation({
  fieldId,
  rules = [],
  debounceMs = 300,
}: UseFieldValidationOptions): UseFieldValidationResult {
  const { state } = useFormContext();
  const dispatch = useFormDispatch();
  
  const [isValidating, setIsValidating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get current error from state (first error in array)
  const fieldErrors = state.fields[fieldId]?.errors ?? [];
  const error = fieldErrors[0] ?? null;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // Validate function
  const validate = useCallback(async (value: FieldValue): Promise<string | null> => {
    // Cancel previous async validation
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

    // Run sync validation first
    const syncResult = validateFieldSync(fieldId, value, rules, state.values);
    
    if (!syncResult.isValid) {
      const errorMessage = syncResult.errors[0] ?? null;
      dispatch(formActions.setFieldError(fieldId, errorMessage ? [errorMessage] : []));
      return errorMessage;
    }

    // Check for async rules
    const asyncRule = rules.find(r => r.type === 'async');
    
    if (!asyncRule) {
      dispatch(formActions.setFieldError(fieldId, []));
      return null;
    }

    // Run async validation with debounce
    return new Promise((resolve) => {
      setIsValidating(true);
      abortControllerRef.current = new AbortController();
      
      timeoutRef.current = setTimeout(async () => {
        try {
          const url = (asyncRule as { url?: string }).url;
          if (!url) {
            setIsValidating(false);
            resolve(null);
            return;
          }

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value }),
            signal: abortControllerRef.current?.signal,
          });

          if (!response.ok) throw new Error('Validation request failed');

          const result = await response.json();
          const errorMessage = result.valid ? null : result.message;
          
          dispatch(formActions.setFieldError(fieldId, errorMessage ? [errorMessage] : []));
          setIsValidating(false);
          resolve(errorMessage);
        } catch (err) {
          if ((err as Error).name === 'AbortError') {
            resolve(null);
            return;
          }
          console.error('Async validation error:', err);
          setIsValidating(false);
          resolve(null);
        }
      }, debounceMs);
    });
  }, [fieldId, rules, state.values, dispatch, debounceMs]);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch(formActions.clearFieldError(fieldId));
  }, [fieldId, dispatch]);

  return {
    error,
    isValidating,
    validate,
    clearError,
  };
}
