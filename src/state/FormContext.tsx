/**
 * FORM CONTEXT
 * 
 * Provides form state and dispatch to all child components.
 * Uses React Context with useReducer for predictable state updates.
 * 
 * Design Decisions:
 * 1. Split into two contexts (state and dispatch) to prevent unnecessary re-renders
 * 2. Form schema is also provided via context for field components to access
 * 3. Custom hooks hide context complexity from consumers
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  type ReactNode,
  type Dispatch,
} from 'react';

import type { FormSchema, FormValues, FieldValue } from '../schema/types';
import { FormStateShape, formReducer, createInitialState, formSelectors } from './reducer';
import { FormAction, formActions } from './actions';

// ============================================================================
// CONTEXT TYPES
// ============================================================================

interface FormContextValue {
  state: FormStateShape;
  schema: FormSchema;
}

interface FormDispatchContextValue {
  dispatch: Dispatch<FormAction>;
}

// ============================================================================
// CONTEXTS
// ============================================================================

/**
 * Context for form state and schema.
 * Components that only read state subscribe to this.
 */
const FormContext = createContext<FormContextValue | null>(null);
FormContext.displayName = 'FormContext';

/**
 * Context for dispatch function.
 * Separated to prevent re-renders when state changes
 * for components that only dispatch actions.
 */
const FormDispatchContext = createContext<FormDispatchContextValue | null>(null);
FormDispatchContext.displayName = 'FormDispatchContext';

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface FormProviderProps {
  /** The form schema defining structure and validation */
  schema: FormSchema;
  
  /** Initial form values */
  initialValues?: FormValues;
  
  /** Child components (form fields, etc.) */
  children: ReactNode;
  
  /** Callback when form values change */
  onChange?: (values: FormValues) => void;
}

export function FormProvider({
  schema,
  initialValues = {},
  children,
  onChange,
}: FormProviderProps) {
  // Initialize reducer with initial values
  const [state, dispatch] = useReducer(
    formReducer,
    initialValues,
    createInitialState
  );

  // Memoize context values to prevent unnecessary re-renders
  const stateContextValue = useMemo<FormContextValue>(
    () => ({ state, schema }),
    [state, schema]
  );

  const dispatchContextValue = useMemo<FormDispatchContextValue>(
    () => ({ dispatch }),
    [dispatch]
  );

  // Call onChange when values change
  React.useEffect(() => {
    onChange?.(state.values);
  }, [state.values, onChange]);

  return (
    <FormContext.Provider value={stateContextValue}>
      <FormDispatchContext.Provider value={dispatchContextValue}>
        {children}
      </FormDispatchContext.Provider>
    </FormContext.Provider>
  );
}

// ============================================================================
// CONTEXT HOOKS
// ============================================================================

/**
 * Access form state and schema.
 * Use this in components that need to read form data.
 */
export function useFormContext(): FormContextValue {
  const context = useContext(FormContext);
  
  if (!context) {
    throw new Error(
      'useFormContext must be used within a FormProvider. ' +
      'Wrap your form components with <FormProvider>.'
    );
  }
  
  return context;
}

/**
 * Access dispatch function.
 * Use this in components that only need to update form state.
 */
export function useFormDispatch(): Dispatch<FormAction> {
  const context = useContext(FormDispatchContext);
  
  if (!context) {
    throw new Error(
      'useFormDispatch must be used within a FormProvider. ' +
      'Wrap your form components with <FormProvider>.'
    );
  }
  
  return context.dispatch;
}

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook for working with a single field.
 * Returns field state and handlers for common operations.
 */
export function useField(fieldId: string, instanceIndex?: number) {
  const { state, schema } = useFormContext();
  const dispatch = useFormDispatch();

  // Find field schema
  const fieldSchema = useMemo(() => {
    for (const section of schema.sections) {
      const field = section.fields.find(f => f.id === fieldId);
      if (field) return field;
    }
    return undefined;
  }, [schema, fieldId]);

  // Get field state
  const fieldKey = instanceIndex !== undefined 
    ? `${fieldId}[${instanceIndex}]` 
    : fieldId;
  
  const fieldState = state.fields[fieldKey] || {
    value: null,
    touched: false,
    dirty: false,
    validating: false,
    errors: [],
  };

  const value = state.values[fieldId] as FieldValue ?? fieldSchema?.defaultValue ?? null;

  // Memoized handlers
  const setValue = useCallback(
    (newValue: FieldValue) => {
      dispatch(formActions.setFieldValue(fieldId, newValue, instanceIndex));
    },
    [dispatch, fieldId, instanceIndex]
  );

  const setTouched = useCallback(
    (touched = true) => {
      dispatch(formActions.setFieldTouched(fieldId, touched, instanceIndex));
    },
    [dispatch, fieldId, instanceIndex]
  );

  const setError = useCallback(
    (errors: string[]) => {
      dispatch(formActions.setFieldError(fieldId, errors, instanceIndex));
    },
    [dispatch, fieldId, instanceIndex]
  );

  const clearError = useCallback(() => {
    dispatch(formActions.clearFieldError(fieldId, instanceIndex));
  }, [dispatch, fieldId, instanceIndex]);

  return {
    // Field data
    value,
    fieldSchema,
    fieldState,
    
    // Derived state
    error: fieldState.errors[0] || null,
    errors: fieldState.errors,
    touched: fieldState.touched,
    dirty: fieldState.dirty,
    validating: fieldState.validating,
    
    // Handlers
    setValue,
    setTouched,
    setError,
    clearError,
    
    // Input props (spread onto input element)
    inputProps: {
      id: fieldId,
      name: fieldId,
      value: value ?? '',
      'aria-invalid': fieldState.errors.length > 0,
      'aria-describedby': fieldState.errors.length > 0 
        ? `${fieldId}-error` 
        : undefined,
    },
  };
}

/**
 * Hook for form-level operations.
 */
export function useFormActions() {
  const { state, schema } = useFormContext();
  const dispatch = useFormDispatch();

  const setValues = useCallback(
    (values: FormValues, isInitial = false) => {
      dispatch(formActions.setValues(values, isInitial));
    },
    [dispatch]
  );

  const resetForm = useCallback(
    (values?: FormValues) => {
      dispatch(formActions.resetForm(values));
    },
    [dispatch]
  );

  const setSubmitting = useCallback(
    (submitting: boolean) => {
      dispatch(formActions.setSubmitting(submitting));
    },
    [dispatch]
  );

  const clearAllErrors = useCallback(() => {
    dispatch(formActions.clearAllErrors());
  }, [dispatch]);

  return {
    // State
    values: state.values,
    isSubmitting: state.isSubmitting,
    isValid: formSelectors.isValid(state),
    isDirty: formSelectors.isDirty(state),
    isValidating: formSelectors.isValidating(state),
    errors: formSelectors.getAllErrors(state),
    
    // Actions
    setValues,
    resetForm,
    setSubmitting,
    clearAllErrors,
    
    // Schema
    schema,
  };
}

/**
 * Hook for repeatable section operations.
 */
export function useRepeatableSection(sectionId: string) {
  const { state } = useFormContext();
  const dispatch = useFormDispatch();

  const section = state.repeatableSections[sectionId] || { instances: [] };
  const instanceCount = section.instances.length;

  const addInstance = useCallback(
    (defaultValues?: Record<string, FieldValue>) => {
      dispatch(formActions.addSectionInstance(sectionId, defaultValues));
    },
    [dispatch, sectionId]
  );

  const removeInstance = useCallback(
    (index: number) => {
      dispatch(formActions.removeSectionInstance(sectionId, index));
    },
    [dispatch, sectionId]
  );

  return {
    instances: section.instances,
    instanceCount,
    addInstance,
    removeInstance,
    canAdd: true, // Can be extended with maxInstances check
    canRemove: instanceCount > 0,
  };
}

/**
 * Hook for autosave state and operations.
 */
export function useAutosaveState() {
  const { state } = useFormContext();
  const dispatch = useFormDispatch();

  const resolveConflict = useCallback(
    (resolution: 'local' | 'saved') => {
      dispatch(formActions.resolveConflict(resolution));
    },
    [dispatch]
  );

  return {
    ...state.autosave,
    resolveConflict,
  };
}
