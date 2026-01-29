/**
 * FORM STATE REDUCER
 * 
 * Design Decisions:
 * 1. Immutable updates using spread operators
 * 2. Derived state (isValid, isDirty) calculated on every update
 * 3. Repeatable sections stored as arrays with index-based access
 * 4. Field state separate from values for clarity
 */

import type { FormValues, FieldValue } from '../schema/types';
import { FormAction, FormActionTypes } from './actions';

// ============================================================================
// STATE INTERFACE
// ============================================================================

export interface FieldState {
  value: FieldValue;
  touched: boolean;
  dirty: boolean;
  validating: boolean;
  errors: string[];
}

export interface RepeatableSectionState {
  instances: Array<Record<string, FieldState>>;
}

export interface AutosaveState {
  draftLoaded: boolean;
  lastSaved: number | null;
  hasConflict: boolean;
  localValues: FormValues | null;
  savedValues: FormValues | null;
  localTimestamp: number | null;
  savedTimestamp: number | null;
}

export interface FormStateShape {
  /** Current form values (flat or nested) */
  values: FormValues;
  
  /** Per-field state (touched, errors, etc.) */
  fields: Record<string, FieldState>;
  
  /** Repeatable section instances */
  repeatableSections: Record<string, RepeatableSectionState>;
  
  /** Initial values for reset functionality */
  initialValues: FormValues;
  
  /** Form-level state */
  isSubmitting: boolean;
  submitCount: number;
  
  /** Autosave state */
  autosave: AutosaveState;
}

// ============================================================================
// INITIAL STATE FACTORY
// ============================================================================

export function createInitialState(initialValues: FormValues = {}): FormStateShape {
  return {
    values: initialValues,
    fields: {},
    repeatableSections: {},
    initialValues,
    isSubmitting: false,
    submitCount: 0,
    autosave: {
      draftLoaded: false,
      lastSaved: null,
      hasConflict: false,
      localValues: null,
      savedValues: null,
      localTimestamp: null,
      savedTimestamp: null,
    },
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates default field state for a new field
 */
function createFieldState(value: FieldValue = null): FieldState {
  return {
    value,
    touched: false,
    dirty: false,
    validating: false,
    errors: [],
  };
}

/**
 * Gets field key for repeatable sections
 */
function getFieldKey(fieldId: string, instanceIndex?: number): string {
  if (instanceIndex !== undefined) {
    return `${fieldId}[${instanceIndex}]`;
  }
  return fieldId;
}

/**
 * Checks if any field has errors
 */
function hasErrors(fields: Record<string, FieldState>): boolean {
  return Object.values(fields).some(field => field.errors.length > 0);
}

/**
 * Checks if any field is dirty
 */
function hasDirtyFields(fields: Record<string, FieldState>): boolean {
  return Object.values(fields).some(field => field.dirty);
}

// ============================================================================
// REDUCER
// ============================================================================

export function formReducer(
  state: FormStateShape,
  action: FormAction
): FormStateShape {
  switch (action.type) {
    // =========================================================================
    // FIELD VALUE CHANGES
    // =========================================================================
    case FormActionTypes.SET_FIELD_VALUE: {
      const { fieldId, value, instanceIndex } = action.payload;
      const key = getFieldKey(fieldId, instanceIndex);
      
      // Get or create field state
      const existingField = state.fields[key] || createFieldState();
      
      // Check if value actually changed
      const initialValue = state.initialValues[fieldId];
      const isDirty = value !== initialValue;
      
      return {
        ...state,
        values: {
          ...state.values,
          [fieldId]: value,
        },
        fields: {
          ...state.fields,
          [key]: {
            ...existingField,
            value,
            dirty: isDirty,
            // Clear errors on change (will be re-validated)
            errors: [],
          },
        },
      };
    }

    // =========================================================================
    // FIELD TOUCHED STATE
    // =========================================================================
    case FormActionTypes.SET_FIELD_TOUCHED: {
      const { fieldId, touched, instanceIndex } = action.payload;
      const key = getFieldKey(fieldId, instanceIndex);
      
      const existingField = state.fields[key] || createFieldState();
      
      return {
        ...state,
        fields: {
          ...state.fields,
          [key]: {
            ...existingField,
            touched,
          },
        },
      };
    }

    // =========================================================================
    // FIELD ERRORS
    // =========================================================================
    case FormActionTypes.SET_FIELD_ERROR: {
      const { fieldId, errors, instanceIndex } = action.payload;
      const key = getFieldKey(fieldId, instanceIndex);
      
      const existingField = state.fields[key] || createFieldState();
      
      return {
        ...state,
        fields: {
          ...state.fields,
          [key]: {
            ...existingField,
            errors,
            validating: false,
          },
        },
      };
    }

    case FormActionTypes.CLEAR_FIELD_ERROR: {
      const { fieldId, instanceIndex } = action.payload;
      const key = getFieldKey(fieldId, instanceIndex);
      
      const existingField = state.fields[key];
      if (!existingField) return state;
      
      return {
        ...state,
        fields: {
          ...state.fields,
          [key]: {
            ...existingField,
            errors: [],
          },
        },
      };
    }

    // =========================================================================
    // FIELD VALIDATING STATE
    // =========================================================================
    case FormActionTypes.SET_FIELD_VALIDATING: {
      const { fieldId, validating, instanceIndex } = action.payload;
      const key = getFieldKey(fieldId, instanceIndex);
      
      const existingField = state.fields[key] || createFieldState();
      
      return {
        ...state,
        fields: {
          ...state.fields,
          [key]: {
            ...existingField,
            validating,
          },
        },
      };
    }

    // =========================================================================
    // BULK VALUE UPDATES
    // =========================================================================
    case FormActionTypes.SET_VALUES: {
      const { values, isInitial } = action.payload;
      
      // Update field states for all values
      const updatedFields = { ...state.fields };
      
      for (const [fieldId, value] of Object.entries(values)) {
        const existingField = state.fields[fieldId] || createFieldState();
        updatedFields[fieldId] = {
          ...existingField,
          value: value as FieldValue,
          dirty: isInitial ? false : value !== state.initialValues[fieldId],
        };
      }
      
      return {
        ...state,
        values: { ...state.values, ...values },
        fields: updatedFields,
        initialValues: isInitial ? values : state.initialValues,
      };
    }

    // =========================================================================
    // FORM RESET
    // =========================================================================
    case FormActionTypes.RESET_FORM: {
      const resetValues = action.payload.values || state.initialValues;
      
      // Create fresh field states for all values
      const freshFields: Record<string, FieldState> = {};
      for (const [fieldId, value] of Object.entries(resetValues)) {
        freshFields[fieldId] = createFieldState(value as FieldValue);
      }
      
      return {
        ...state,
        values: resetValues,
        fields: freshFields,
        repeatableSections: {},
        isSubmitting: false,
      };
    }

    // =========================================================================
    // FORM SUBMISSION STATE
    // =========================================================================
    case FormActionTypes.SET_SUBMITTING: {
      return {
        ...state,
        isSubmitting: action.payload.submitting,
        submitCount: action.payload.submitting 
          ? state.submitCount + 1 
          : state.submitCount,
      };
    }

    case FormActionTypes.SET_FORM_ERRORS: {
      const { errors } = action.payload;
      
      const updatedFields = { ...state.fields };
      
      for (const [fieldId, fieldErrors] of Object.entries(errors)) {
        const existingField = state.fields[fieldId] || createFieldState();
        updatedFields[fieldId] = {
          ...existingField,
          errors: fieldErrors,
        };
      }
      
      return {
        ...state,
        fields: updatedFields,
      };
    }

    case FormActionTypes.CLEAR_ALL_ERRORS: {
      const clearedFields: Record<string, FieldState> = {};
      
      for (const [fieldId, fieldState] of Object.entries(state.fields)) {
        clearedFields[fieldId] = {
          ...fieldState,
          errors: [],
        };
      }
      
      return {
        ...state,
        fields: clearedFields,
      };
    }

    // =========================================================================
    // REPEATABLE SECTIONS
    // =========================================================================
    case FormActionTypes.ADD_SECTION_INSTANCE: {
      const { sectionId, defaultValues = {} } = action.payload;
      
      const existingSection = state.repeatableSections[sectionId] || { instances: [] };
      
      // Create field states for new instance
      const newInstanceFields: Record<string, FieldState> = {};
      for (const [fieldId, value] of Object.entries(defaultValues)) {
        newInstanceFields[fieldId] = createFieldState(value);
      }
      
      return {
        ...state,
        repeatableSections: {
          ...state.repeatableSections,
          [sectionId]: {
            instances: [...existingSection.instances, newInstanceFields],
          },
        },
      };
    }

    case FormActionTypes.REMOVE_SECTION_INSTANCE: {
      const { sectionId, instanceIndex } = action.payload;
      
      const existingSection = state.repeatableSections[sectionId];
      if (!existingSection) return state;
      
      const newInstances = existingSection.instances.filter(
        (_, index) => index !== instanceIndex
      );
      
      return {
        ...state,
        repeatableSections: {
          ...state.repeatableSections,
          [sectionId]: {
            instances: newInstances,
          },
        },
      };
    }

    // =========================================================================
    // AUTOSAVE STATE
    // =========================================================================
    case FormActionTypes.SET_DRAFT_LOADED: {
      return {
        ...state,
        autosave: {
          ...state.autosave,
          draftLoaded: action.payload.loaded,
        },
      };
    }

    case FormActionTypes.SET_LAST_SAVED: {
      return {
        ...state,
        autosave: {
          ...state.autosave,
          lastSaved: action.payload.timestamp,
        },
      };
    }

    case FormActionTypes.SET_CONFLICT: {
      const { hasConflict, localValues, savedValues, localTimestamp, savedTimestamp } = action.payload;
      
      return {
        ...state,
        autosave: {
          ...state.autosave,
          hasConflict,
          localValues: localValues ?? state.autosave.localValues,
          savedValues: savedValues ?? state.autosave.savedValues,
          localTimestamp: localTimestamp ?? state.autosave.localTimestamp,
          savedTimestamp: savedTimestamp ?? state.autosave.savedTimestamp,
        },
      };
    }

    case FormActionTypes.RESOLVE_CONFLICT: {
      const { resolution } = action.payload;
      
      const valuesToUse = resolution === 'local' 
        ? state.autosave.localValues 
        : state.autosave.savedValues;
      
      return {
        ...state,
        values: valuesToUse || state.values,
        autosave: {
          ...state.autosave,
          hasConflict: false,
          localValues: null,
          savedValues: null,
        },
      };
    }

    default:
      return state;
  }
}

// ============================================================================
// SELECTORS (Derived State)
// ============================================================================

/**
 * Selectors compute derived state from the form state.
 * They're pure functions that can be memoized if needed.
 */

export const formSelectors = {
  /** Check if form has any validation errors */
  isValid: (state: FormStateShape): boolean => {
    return !hasErrors(state.fields);
  },

  /** Check if form has been modified */
  isDirty: (state: FormStateShape): boolean => {
    return hasDirtyFields(state.fields);
  },

  /** Get all current errors as a flat object */
  getAllErrors: (state: FormStateShape): Record<string, string[]> => {
    const errors: Record<string, string[]> = {};
    
    for (const [fieldId, fieldState] of Object.entries(state.fields)) {
      if (fieldState.errors.length > 0) {
        errors[fieldId] = fieldState.errors;
      }
    }
    
    return errors;
  },

  /** Get specific field state */
  getFieldState: (state: FormStateShape, fieldId: string): FieldState | undefined => {
    return state.fields[fieldId];
  },

  /** Get field value */
  getFieldValue: (state: FormStateShape, fieldId: string): FieldValue => {
    return state.values[fieldId] as FieldValue;
  },

  /** Check if any field is currently validating (async) */
  isValidating: (state: FormStateShape): boolean => {
    return Object.values(state.fields).some(field => field.validating);
  },

  /** Get touched fields */
  getTouchedFields: (state: FormStateShape): string[] => {
    return Object.entries(state.fields)
      .filter(([_, fieldState]) => fieldState.touched)
      .map(([fieldId]) => fieldId);
  },

  /** Get repeatable section instance count */
  getSectionInstanceCount: (state: FormStateShape, sectionId: string): number => {
    return state.repeatableSections[sectionId]?.instances.length ?? 0;
  },
};
