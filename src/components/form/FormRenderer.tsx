/**
 * FORM RENDERER COMPONENT
 * 
 * Top-level component that:
 * - Provides FormContext to children
 * - Renders sections and fields from schema
 * - Handles form submission
 * - Manages autosave (optional)
 * - Shows global validation errors
 */

import { useCallback, useMemo, useEffect } from 'react';
import { FormProvider, useFormContext, useFormActions, useFormDispatch } from '@/state';
import { formActions } from '@/state/actions';
import { validateFormSync } from '@/validation/pipeline';
import { Button } from '@/components/primitives';
import { FormSection } from './FormSection';
import { RepeatableSection } from './RepeatableSection';
import type { FormSchema, FormValues, SectionSchema } from '@/schema/types';

export interface FormRendererProps {
  /** Form schema definition */
  schema: FormSchema;
  /** Initial form values */
  initialValues?: FormValues;
  /** Submit handler - receives validated values */
  onSubmit?: (values: FormValues) => void | Promise<void>;
  /** Change handler - called on every value change */
  onChange?: (values: FormValues) => void;
  /** Enable autosave */
  autosave?: boolean;
  /** Autosave debounce delay (ms) */
  autosaveDelay?: number;
  /** Autosave handler */
  onAutosave?: (values: FormValues) => Promise<void>;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Renders a complete form from schema.
 * 
 * @example
 * <FormRenderer
 *   schema={contactFormSchema}
 *   initialValues={{ email: '', name: '' }}
 *   onSubmit={async (values) => {
 *     await saveContact(values);
 *   }}
 * />
 */
export function FormRenderer({
  schema,
  initialValues = {},
  onSubmit,
  onChange,
  autosave = false,
  autosaveDelay = 2000,
  onAutosave,
  className = '',
}: FormRendererProps) {
  return (
    <FormProvider schema={schema} initialValues={initialValues}>
      <FormRendererInner
        schema={schema}
        onSubmit={onSubmit}
        onChange={onChange}
        autosave={autosave}
        autosaveDelay={autosaveDelay}
        onAutosave={onAutosave}
        className={className}
      />
    </FormProvider>
  );
}

/**
 * Inner component with access to FormContext.
 */
interface FormRendererInnerProps {
  schema: FormSchema;
  onSubmit?: (values: FormValues) => void | Promise<void>;
  onChange?: (values: FormValues) => void;
  autosave?: boolean;
  autosaveDelay?: number;
  onAutosave?: (values: FormValues) => Promise<void>;
  className?: string;
}

function FormRendererInner({
  schema,
  onSubmit,
  onChange,
  autosave,
  autosaveDelay,
  onAutosave,
  className,
}: FormRendererInnerProps) {
  const { state } = useFormContext();
  const { resetForm, isDirty } = useFormActions();
  const dispatch = useFormDispatch();

  // Track changes
  useEffect(() => {
    if (onChange) {
      onChange(state.values);
    }
  }, [state.values, onChange]);

  // Autosave effect
  useEffect(() => {
    if (!autosave || !onAutosave || !isDirty) return;

    const timeoutId = setTimeout(async () => {
      try {
        await onAutosave(state.values);
      } catch (error) {
        console.error('Autosave failed:', error);
      }
    }, autosaveDelay);

    return () => clearTimeout(timeoutId);
  }, [autosave, autosaveDelay, onAutosave, state.values, isDirty]);

  // Get all fields for validation
  const allFields = useMemo(() => {
    const fields: Array<{ id: string; validation?: unknown[] }> = [];
    
    for (const section of schema.sections) {
      for (const field of section.fields) {
        fields.push(field);
      }
    }
    
    return fields;
  }, [schema.sections]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched and validate
    for (const field of allFields) {
      dispatch(formActions.setFieldTouched(field.id, true));
    }

    // Validate all fields
    const touchedFields = new Set(allFields.map(f => f.id));
    const validationResult = validateFormSync(
      allFields as any,
      state.values,
      { touchedFields }
    );

    if (!validationResult.isValid) {
      // Dispatch errors for each invalid field
      for (const [fieldId, errors] of Object.entries(validationResult.fieldErrors)) {
        dispatch(formActions.setFieldError(fieldId, errors));
      }
      
      // Focus first error field
      const firstErrorField = Object.keys(validationResult.fieldErrors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        element?.focus();
      }
      return;
    }

    // Clear all errors before submitting
    dispatch(formActions.clearAllErrors());

    // Call submit handler
    if (onSubmit) {
      try {
        await onSubmit(state.values);
      } catch (error) {
        console.error('Form submission failed:', error);
      }
    }
  }, [state.values, allFields, onSubmit, dispatch]);

  // Handle reset
  const handleReset = useCallback(() => {
    resetForm();
  }, [resetForm]);

  return (
    <form
      onSubmit={handleSubmit}
      onReset={handleReset}
      className={`${className}`}
      noValidate // We handle validation ourselves
    >
      {/* Form header */}
      {(schema.title || schema.description) && (
        <div className="mb-6">
          {schema.title && (
            <h2 className="text-2xl font-bold text-gray-900">
              {schema.title}
            </h2>
          )}
          {schema.description && (
            <p className="mt-2 text-gray-600">
              {schema.description}
            </p>
          )}
        </div>
      )}

      {/* Sections */}
      {schema.sections.map((section: SectionSchema) => (
        section.repeatable ? (
          <RepeatableSection
            key={section.id}
            schema={section}
            maxInstances={section.maxInstances}
            minInstances={section.minInstances}
          />
        ) : (
          <FormSection
            key={section.id}
            schema={section}
          />
        )
      ))}

      {/* Form actions */}
      <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
        <Button
          type="submit"
          variant="primary"
        >
          {schema.submit?.label || 'Submit'}
        </Button>
        
        <Button
          type="reset"
          variant="outline"
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
