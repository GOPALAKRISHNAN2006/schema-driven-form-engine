/**
 * useAutosave Hook
 * 
 * Handles automatic saving with:
 * - Debounced saves
 * - Conflict detection
 * - Version tracking
 * - Retry logic
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { FormValues } from '@/schema/types';

export interface UseAutosaveOptions {
  /** Form values to save */
  values: FormValues;
  /** Whether form has unsaved changes */
  isDirty: boolean;
  /** Save handler */
  onSave: (values: FormValues) => Promise<{ version: number }>;
  /** Debounce delay (ms) */
  debounceMs?: number;
  /** Enable autosave */
  enabled?: boolean;
  /** Current version (for conflict detection) */
  currentVersion?: number;
}

export interface AutosaveState {
  /** Last saved timestamp */
  lastSaved: Date | null;
  /** Whether a save is in progress */
  isSaving: boolean;
  /** Save error (if any) */
  error: string | null;
  /** Version conflict detected */
  hasConflict: boolean;
  /** Server version (when conflict) */
  serverVersion: number | null;
}

export interface UseAutosaveResult extends AutosaveState {
  /** Manually trigger save */
  save: () => Promise<void>;
  /** Resolve conflict by overwriting */
  resolveConflict: () => Promise<void>;
  /** Clear error */
  clearError: () => void;
}

/**
 * Hook for autosave functionality.
 * 
 * @example
 * const { isSaving, lastSaved, error } = useAutosave({
 *   values: formValues,
 *   isDirty: true,
 *   onSave: async (values) => {
 *     const response = await api.saveForm(values);
 *     return { version: response.version };
 *   },
 * });
 */
export function useAutosave({
  values,
  isDirty,
  onSave,
  debounceMs = 2000,
  enabled = true,
  currentVersion = 0,
}: UseAutosaveOptions): UseAutosaveResult {
  const [state, setState] = useState<AutosaveState>({
    lastSaved: null,
    isSaving: false,
    error: null,
    hasConflict: false,
    serverVersion: null,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const versionRef = useRef(currentVersion);

  // Update version ref
  useEffect(() => {
    versionRef.current = currentVersion;
  }, [currentVersion]);

  // Save function
  const save = useCallback(async () => {
    if (state.isSaving) return;

    setState((prev: AutosaveState) => ({ ...prev, isSaving: true, error: null }));

    try {
      const result = await onSave(values);
      
      // Check for version conflict
      if (versionRef.current > 0 && result.version !== versionRef.current + 1) {
        setState((prev: AutosaveState) => ({
          ...prev,
          isSaving: false,
          hasConflict: true,
          serverVersion: result.version,
        }));
        return;
      }

      versionRef.current = result.version;
      
      setState((prev: AutosaveState) => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasConflict: false,
        serverVersion: null,
      }));
    } catch (err) {
      setState((prev: AutosaveState) => ({
        ...prev,
        isSaving: false,
        error: (err as Error).message || 'Save failed',
      }));
    }
  }, [values, onSave, state.isSaving]);

  // Autosave effect
  useEffect(() => {
    if (!enabled || !isDirty) return;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      save();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, isDirty, values, debounceMs, save]);

  // Resolve conflict
  const resolveConflict = useCallback(async () => {
    setState((prev: AutosaveState) => ({ ...prev, hasConflict: false, serverVersion: null }));
    await save();
  }, [save]);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev: AutosaveState) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    save,
    resolveConflict,
    clearError,
  };
}
