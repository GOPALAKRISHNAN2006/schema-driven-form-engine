/**
 * FORM STATE ACTIONS
 * 
 * Design Decisions:
 * 1. Actions are strongly typed with discriminated unions
 * 2. Each action is a pure object - no side effects
 * 3. Payload types are explicit to prevent runtime errors
 * 4. Action creators are simple functions (no thunks needed)
 */

import type { FieldValue, FormValues } from '../schema/types';

// ============================================================================
// ACTION TYPE CONSTANTS
// ============================================================================

export const FormActionTypes = {
  // Field-level actions
  SET_FIELD_VALUE: 'SET_FIELD_VALUE',
  SET_FIELD_TOUCHED: 'SET_FIELD_TOUCHED',
  SET_FIELD_ERROR: 'SET_FIELD_ERROR',
  CLEAR_FIELD_ERROR: 'CLEAR_FIELD_ERROR',
  SET_FIELD_VALIDATING: 'SET_FIELD_VALIDATING',
  
  // Form-level actions
  SET_VALUES: 'SET_VALUES',
  RESET_FORM: 'RESET_FORM',
  SET_SUBMITTING: 'SET_SUBMITTING',
  SET_FORM_ERRORS: 'SET_FORM_ERRORS',
  CLEAR_ALL_ERRORS: 'CLEAR_ALL_ERRORS',
  
  // Repeatable section actions
  ADD_SECTION_INSTANCE: 'ADD_SECTION_INSTANCE',
  REMOVE_SECTION_INSTANCE: 'REMOVE_SECTION_INSTANCE',
  
  // Autosave actions
  SET_DRAFT_LOADED: 'SET_DRAFT_LOADED',
  SET_LAST_SAVED: 'SET_LAST_SAVED',
  SET_CONFLICT: 'SET_CONFLICT',
  RESOLVE_CONFLICT: 'RESOLVE_CONFLICT',
} as const;

// ============================================================================
// ACTION INTERFACES
// ============================================================================

export interface SetFieldValueAction {
  type: typeof FormActionTypes.SET_FIELD_VALUE;
  payload: {
    fieldId: string;
    value: FieldValue;
    /** For repeatable sections: which instance */
    instanceIndex?: number;
  };
}

export interface SetFieldTouchedAction {
  type: typeof FormActionTypes.SET_FIELD_TOUCHED;
  payload: {
    fieldId: string;
    touched: boolean;
    instanceIndex?: number;
  };
}

export interface SetFieldErrorAction {
  type: typeof FormActionTypes.SET_FIELD_ERROR;
  payload: {
    fieldId: string;
    errors: string[];
    instanceIndex?: number;
  };
}

export interface ClearFieldErrorAction {
  type: typeof FormActionTypes.CLEAR_FIELD_ERROR;
  payload: {
    fieldId: string;
    instanceIndex?: number;
  };
}

export interface SetFieldValidatingAction {
  type: typeof FormActionTypes.SET_FIELD_VALIDATING;
  payload: {
    fieldId: string;
    validating: boolean;
    instanceIndex?: number;
  };
}

export interface SetValuesAction {
  type: typeof FormActionTypes.SET_VALUES;
  payload: {
    values: FormValues;
    /** If true, doesn't mark fields as dirty */
    isInitial?: boolean;
  };
}

export interface ResetFormAction {
  type: typeof FormActionTypes.RESET_FORM;
  payload: {
    /** Values to reset to (defaults to initial values) */
    values?: FormValues;
  };
}

export interface SetSubmittingAction {
  type: typeof FormActionTypes.SET_SUBMITTING;
  payload: {
    submitting: boolean;
  };
}

export interface SetFormErrorsAction {
  type: typeof FormActionTypes.SET_FORM_ERRORS;
  payload: {
    errors: Record<string, string[]>;
  };
}

export interface ClearAllErrorsAction {
  type: typeof FormActionTypes.CLEAR_ALL_ERRORS;
}

export interface AddSectionInstanceAction {
  type: typeof FormActionTypes.ADD_SECTION_INSTANCE;
  payload: {
    sectionId: string;
    /** Initial values for the new instance */
    defaultValues?: Record<string, FieldValue>;
  };
}

export interface RemoveSectionInstanceAction {
  type: typeof FormActionTypes.REMOVE_SECTION_INSTANCE;
  payload: {
    sectionId: string;
    instanceIndex: number;
  };
}

export interface SetDraftLoadedAction {
  type: typeof FormActionTypes.SET_DRAFT_LOADED;
  payload: {
    loaded: boolean;
    timestamp?: number;
  };
}

export interface SetLastSavedAction {
  type: typeof FormActionTypes.SET_LAST_SAVED;
  payload: {
    timestamp: number;
  };
}

export interface SetConflictAction {
  type: typeof FormActionTypes.SET_CONFLICT;
  payload: {
    hasConflict: boolean;
    localValues?: FormValues;
    savedValues?: FormValues;
    localTimestamp?: number;
    savedTimestamp?: number;
  };
}

export interface ResolveConflictAction {
  type: typeof FormActionTypes.RESOLVE_CONFLICT;
  payload: {
    resolution: 'local' | 'saved';
  };
}

// ============================================================================
// ACTION UNION TYPE
// ============================================================================

export type FormAction =
  | SetFieldValueAction
  | SetFieldTouchedAction
  | SetFieldErrorAction
  | ClearFieldErrorAction
  | SetFieldValidatingAction
  | SetValuesAction
  | ResetFormAction
  | SetSubmittingAction
  | SetFormErrorsAction
  | ClearAllErrorsAction
  | AddSectionInstanceAction
  | RemoveSectionInstanceAction
  | SetDraftLoadedAction
  | SetLastSavedAction
  | SetConflictAction
  | ResolveConflictAction;

// ============================================================================
// ACTION CREATORS
// ============================================================================

/**
 * Action creators are pure functions that return action objects.
 * They provide type safety and a clean API for dispatching actions.
 */

export const formActions = {
  setFieldValue: (
    fieldId: string,
    value: FieldValue,
    instanceIndex?: number
  ): SetFieldValueAction => ({
    type: FormActionTypes.SET_FIELD_VALUE,
    payload: { fieldId, value, instanceIndex },
  }),

  setFieldTouched: (
    fieldId: string,
    touched = true,
    instanceIndex?: number
  ): SetFieldTouchedAction => ({
    type: FormActionTypes.SET_FIELD_TOUCHED,
    payload: { fieldId, touched, instanceIndex },
  }),

  setFieldError: (
    fieldId: string,
    errors: string[],
    instanceIndex?: number
  ): SetFieldErrorAction => ({
    type: FormActionTypes.SET_FIELD_ERROR,
    payload: { fieldId, errors, instanceIndex },
  }),

  clearFieldError: (
    fieldId: string,
    instanceIndex?: number
  ): ClearFieldErrorAction => ({
    type: FormActionTypes.CLEAR_FIELD_ERROR,
    payload: { fieldId, instanceIndex },
  }),

  setFieldValidating: (
    fieldId: string,
    validating: boolean,
    instanceIndex?: number
  ): SetFieldValidatingAction => ({
    type: FormActionTypes.SET_FIELD_VALIDATING,
    payload: { fieldId, validating, instanceIndex },
  }),

  setValues: (values: FormValues, isInitial = false): SetValuesAction => ({
    type: FormActionTypes.SET_VALUES,
    payload: { values, isInitial },
  }),

  resetForm: (values?: FormValues): ResetFormAction => ({
    type: FormActionTypes.RESET_FORM,
    payload: { values },
  }),

  setSubmitting: (submitting: boolean): SetSubmittingAction => ({
    type: FormActionTypes.SET_SUBMITTING,
    payload: { submitting },
  }),

  setFormErrors: (errors: Record<string, string[]>): SetFormErrorsAction => ({
    type: FormActionTypes.SET_FORM_ERRORS,
    payload: { errors },
  }),

  clearAllErrors: (): ClearAllErrorsAction => ({
    type: FormActionTypes.CLEAR_ALL_ERRORS,
  }),

  addSectionInstance: (
    sectionId: string,
    defaultValues?: Record<string, FieldValue>
  ): AddSectionInstanceAction => ({
    type: FormActionTypes.ADD_SECTION_INSTANCE,
    payload: { sectionId, defaultValues },
  }),

  removeSectionInstance: (
    sectionId: string,
    instanceIndex: number
  ): RemoveSectionInstanceAction => ({
    type: FormActionTypes.REMOVE_SECTION_INSTANCE,
    payload: { sectionId, instanceIndex },
  }),

  setDraftLoaded: (loaded: boolean, timestamp?: number): SetDraftLoadedAction => ({
    type: FormActionTypes.SET_DRAFT_LOADED,
    payload: { loaded, timestamp },
  }),

  setLastSaved: (timestamp: number): SetLastSavedAction => ({
    type: FormActionTypes.SET_LAST_SAVED,
    payload: { timestamp },
  }),

  setConflict: (
    hasConflict: boolean,
    details?: {
      localValues?: FormValues;
      savedValues?: FormValues;
      localTimestamp?: number;
      savedTimestamp?: number;
    }
  ): SetConflictAction => ({
    type: FormActionTypes.SET_CONFLICT,
    payload: { hasConflict, ...details },
  }),

  resolveConflict: (resolution: 'local' | 'saved'): ResolveConflictAction => ({
    type: FormActionTypes.RESOLVE_CONFLICT,
    payload: { resolution },
  }),
};
