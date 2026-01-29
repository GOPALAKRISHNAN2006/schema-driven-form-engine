/**
 * SYNC VALIDATORS
 * 
 * Built-in synchronous validation functions.
 * Each validator takes a value and optional params,
 * returns error message or null.
 */

import type { SyncValidator } from './types';

/**
 * Required field validator.
 */
export const required: SyncValidator = (value) => {
  if (value === null || value === undefined) {
    return 'This field is required';
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return 'This field is required';
  }
  
  if (typeof value === 'boolean' && value === false) {
    // For checkboxes that must be checked
    return 'This field is required';
  }
  
  return null;
};

/**
 * Minimum length validator (for strings).
 */
export const minLength: SyncValidator = (value, params) => {
  if (typeof value !== 'string') return null;
  
  const min = params?.value as number;
  if (typeof min !== 'number') return null;
  
  if (value.length < min) {
    return `Must be at least ${min} characters`;
  }
  
  return null;
};

/**
 * Maximum length validator (for strings).
 */
export const maxLength: SyncValidator = (value, params) => {
  if (typeof value !== 'string') return null;
  
  const max = params?.value as number;
  if (typeof max !== 'number') return null;
  
  if (value.length > max) {
    return `Must be at most ${max} characters`;
  }
  
  return null;
};

/**
 * Regex pattern validator.
 */
export const pattern: SyncValidator = (value, params) => {
  if (typeof value !== 'string' || value === '') return null;
  
  const patternStr = params?.value as string;
  if (typeof patternStr !== 'string') return null;
  
  try {
    const regex = new RegExp(patternStr);
    if (!regex.test(value)) {
      return params?.message as string || 'Invalid format';
    }
  } catch (e) {
    console.error('Invalid regex pattern:', patternStr);
    return null;
  }
  
  return null;
};

/**
 * Email validator.
 */
export const email: SyncValidator = (value) => {
  if (typeof value !== 'string' || value === '') return null;
  
  // RFC 5322 simplified email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(value)) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

/**
 * Minimum value validator (for numbers).
 */
export const min: SyncValidator = (value, params) => {
  if (typeof value !== 'number') return null;
  
  const minVal = params?.value as number;
  if (typeof minVal !== 'number') return null;
  
  if (value < minVal) {
    return `Must be at least ${minVal}`;
  }
  
  return null;
};

/**
 * Maximum value validator (for numbers).
 */
export const max: SyncValidator = (value, params) => {
  if (typeof value !== 'number') return null;
  
  const maxVal = params?.value as number;
  if (typeof maxVal !== 'number') return null;
  
  if (value > maxVal) {
    return `Must be at most ${maxVal}`;
  }
  
  return null;
};

/**
 * URL validator.
 */
export const url: SyncValidator = (value) => {
  if (typeof value !== 'string' || value === '') return null;
  
  try {
    new URL(value);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
};

/**
 * Phone number validator (basic).
 */
export const phone: SyncValidator = (value) => {
  if (typeof value !== 'string' || value === '') return null;
  
  // Basic phone regex - allows digits, spaces, dashes, parentheses, plus
  const phoneRegex = /^[+]?[(]?[0-9]{1,3}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
  
  if (!phoneRegex.test(value)) {
    return 'Please enter a valid phone number';
  }
  
  return null;
};

/**
 * Registry of built-in sync validators.
 */
export const syncValidators: Record<string, SyncValidator> = {
  required,
  minLength,
  maxLength,
  pattern,
  email,
  min,
  max,
  url,
  phone,
};

/**
 * Get a sync validator by type name.
 */
export function getSyncValidator(type: string): SyncValidator | undefined {
  return syncValidators[type];
}
