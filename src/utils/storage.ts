/**
 * LOCAL STORAGE UTILITIES
 * 
 * Helpers for form data persistence with autosave.
 */

const STORAGE_PREFIX = 'form_autosave_';

export interface StoredFormData {
  values: Record<string, unknown>;
  timestamp: number;
  version?: number;
}

/**
 * Save form data to localStorage.
 */
export function saveFormData(
  formId: string,
  values: Record<string, unknown>,
  version?: number
): void {
  try {
    const data: StoredFormData = {
      values,
      timestamp: Date.now(),
      version,
    };
    localStorage.setItem(STORAGE_PREFIX + formId, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save form data to localStorage:', error);
  }
}

/**
 * Load form data from localStorage.
 */
export function loadFormData(formId: string): StoredFormData | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + formId);
    if (!raw) return null;
    return JSON.parse(raw) as StoredFormData;
  } catch (error) {
    console.warn('Failed to load form data from localStorage:', error);
    return null;
  }
}

/**
 * Clear form data from localStorage.
 */
export function clearFormData(formId: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + formId);
  } catch (error) {
    console.warn('Failed to clear form data from localStorage:', error);
  }
}

/**
 * Check if stored form data exists.
 */
export function hasStoredFormData(formId: string): boolean {
  return localStorage.getItem(STORAGE_PREFIX + formId) !== null;
}

/**
 * Get age of stored form data in milliseconds.
 */
export function getFormDataAge(formId: string): number | null {
  const data = loadFormData(formId);
  if (!data) return null;
  return Date.now() - data.timestamp;
}

/**
 * Clear all stored form data (for cleanup).
 */
export function clearAllFormData(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Failed to clear all form data:', error);
  }
}
