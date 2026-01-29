/**
 * useConditional Hook
 * 
 * Evaluates conditional visibility for fields/sections.
 * Memoizes evaluation to prevent unnecessary re-renders.
 */

import { useMemo } from 'react';
import { useFormContext } from '@/state';
import { evaluateCondition } from '@/schema/resolver';
import type { Condition } from '@/schema/types';

export interface UseConditionalOptions {
  /** Condition to evaluate */
  condition?: Condition;
  /** ID for tracking (optional) */
  id?: string;
}

export interface UseConditionalResult {
  /** Whether the condition is met (element should be visible) */
  isVisible: boolean;
  /** Re-evaluate the condition (usually not needed) */
  evaluate: () => boolean;
}

/**
 * Hook to evaluate conditional visibility.
 * 
 * @example
 * const { isVisible } = useConditional({
 *   condition: { field: 'country', operator: 'equals', value: 'us' },
 * });
 * 
 * if (!isVisible) return null;
 */
export function useConditional({
  condition,
}: UseConditionalOptions): UseConditionalResult {
  const { state } = useFormContext();

  const isVisible = useMemo(() => {
    if (!condition) return true;
    return evaluateCondition(condition, state.values);
  }, [condition, state.values]);

  const evaluate = () => {
    if (!condition) return true;
    return evaluateCondition(condition, state.values);
  };

  return {
    isVisible,
    evaluate,
  };
}
