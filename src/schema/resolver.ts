/**
 * CONDITION RESOLVER
 * 
 * Evaluates conditional expressions against form values.
 * Used to determine field/section visibility.
 * 
 * Design: Recursive evaluation of AND/OR/NOT/Simple conditions
 */

import type {
  Condition,
  SimpleCondition,
  AndCondition,
  OrCondition,
  NotCondition,
  FormValues,
  FieldValue,
} from './types';

/**
 * Evaluates a condition against current form values.
 * Returns true if condition is met, false otherwise.
 */
export function evaluateCondition(
  condition: Condition,
  values: FormValues
): boolean {
  // Type guards for discriminated union
  if ('field' in condition && 'operator' in condition) {
    return evaluateSimpleCondition(condition as SimpleCondition, values);
  }
  
  if ('and' in condition) {
    return evaluateAndCondition(condition as AndCondition, values);
  }
  
  if ('or' in condition) {
    return evaluateOrCondition(condition as OrCondition, values);
  }
  
  if ('not' in condition) {
    return evaluateNotCondition(condition as NotCondition, values);
  }
  
  // Unknown condition type - default to visible
  console.warn('Unknown condition type:', condition);
  return true;
}

/**
 * Evaluates a simple field comparison condition.
 */
function evaluateSimpleCondition(
  condition: SimpleCondition,
  values: FormValues
): boolean {
  const fieldValue = getNestedValue(values, condition.field);
  const compareValue = condition.value;

  switch (condition.operator) {
    case 'equals':
      return fieldValue === compareValue;
    
    case 'notEquals':
      return fieldValue !== compareValue;
    
    case 'contains':
      if (typeof fieldValue === 'string' && typeof compareValue === 'string') {
        return fieldValue.includes(compareValue);
      }
      if (Array.isArray(fieldValue) && typeof compareValue === 'string') {
        return fieldValue.includes(compareValue);
      }
      return false;
    
    case 'greaterThan':
      if (typeof fieldValue === 'number' && typeof compareValue === 'number') {
        return fieldValue > compareValue;
      }
      return false;
    
    case 'lessThan':
      if (typeof fieldValue === 'number' && typeof compareValue === 'number') {
        return fieldValue < compareValue;
      }
      return false;
    
    case 'isEmpty':
      return isEmpty(fieldValue);
    
    case 'isNotEmpty':
      return !isEmpty(fieldValue);
    
    case 'in':
      if (Array.isArray(compareValue)) {
        return compareValue.includes(fieldValue);
      }
      return false;
    
    case 'notIn':
      if (Array.isArray(compareValue)) {
        return !compareValue.includes(fieldValue);
      }
      return true;
    
    default:
      console.warn('Unknown operator:', condition.operator);
      return true;
  }
}

/**
 * Evaluates AND condition - all sub-conditions must be true.
 */
function evaluateAndCondition(
  condition: AndCondition,
  values: FormValues
): boolean {
  return condition.and.every(subCondition => 
    evaluateCondition(subCondition, values)
  );
}

/**
 * Evaluates OR condition - at least one sub-condition must be true.
 */
function evaluateOrCondition(
  condition: OrCondition,
  values: FormValues
): boolean {
  return condition.or.some(subCondition => 
    evaluateCondition(subCondition, values)
  );
}

/**
 * Evaluates NOT condition - inverts the sub-condition result.
 */
function evaluateNotCondition(
  condition: NotCondition,
  values: FormValues
): boolean {
  return !evaluateCondition(condition.not, values);
}

/**
 * Gets a nested value from an object using dot notation.
 * Example: getNestedValue({ a: { b: 1 } }, 'a.b') => 1
 */
function getNestedValue(obj: FormValues, path: string): FieldValue {
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  
  return current as FieldValue;
}

/**
 * Checks if a value is "empty" for conditional purposes.
 */
function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value === 'number') return false; // 0 is not empty
  if (typeof value === 'boolean') return false; // false is not empty
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * Determines which fields should be visible given current form values.
 * Returns a Set of visible field IDs.
 */
export function getVisibleFields(
  fieldConditions: Map<string, Condition | undefined>,
  values: FormValues
): Set<string> {
  const visible = new Set<string>();
  
  for (const [fieldId, condition] of fieldConditions) {
    if (!condition) {
      // No condition = always visible
      visible.add(fieldId);
    } else if (evaluateCondition(condition, values)) {
      visible.add(fieldId);
    }
  }
  
  return visible;
}

/**
 * Gets fields that are hidden but have required validation.
 * These should have their required validation skipped.
 */
export function getHiddenRequiredFields(
  allFields: Array<{ id: string; showWhen?: Condition; validation?: Array<{ type: string }> }>,
  values: FormValues
): Set<string> {
  const hidden = new Set<string>();
  
  for (const field of allFields) {
    const hasRequired = field.validation?.some(v => v.type === 'required');
    
    if (hasRequired && field.showWhen) {
      const isVisible = evaluateCondition(field.showWhen, values);
      if (!isVisible) {
        hidden.add(field.id);
      }
    }
  }
  
  return hidden;
}
