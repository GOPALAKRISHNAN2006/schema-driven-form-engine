/**
 * FORM SECTION COMPONENT
 * 
 * Renders a group of fields with optional title/description.
 * Handles conditional visibility at section level.
 */

import { useMemo } from 'react';
import { useFormContext } from '@/state';
import { evaluateCondition } from '@/schema/resolver';
import { FieldRenderer } from '@/components/fields';
import type { SectionSchema, FieldSchema } from '@/schema/types';

export interface FormSectionProps {
  /** Section schema */
  schema: SectionSchema;
  /** Override visibility (for nested conditions) */
  forceVisible?: boolean;
}

/**
 * Renders a form section with its fields.
 * 
 * @example
 * <FormSection
 *   schema={{
 *     id: 'contact',
 *     title: 'Contact Information',
 *     fields: [
 *       { id: 'email', type: 'text', label: 'Email' },
 *       { id: 'phone', type: 'text', label: 'Phone' },
 *     ],
 *   }}
 * />
 */
export function FormSection({ schema, forceVisible }: FormSectionProps) {
  const { state } = useFormContext();

  // Evaluate section visibility
  const isSectionVisible = useMemo(() => {
    if (forceVisible !== undefined) return forceVisible;
    if (!schema.showWhen) return true;
    return evaluateCondition(schema.showWhen, state.values);
  }, [schema.showWhen, state.values, forceVisible]);

  // Don't render if section is not visible
  if (!isSectionVisible) return null;

  // Compute field visibility
  const fieldVisibility = useMemo(() => {
    const visibility: Record<string, boolean> = {};
    
    for (const field of schema.fields) {
      if (!field.showWhen) {
        visibility[field.id] = true;
      } else {
        visibility[field.id] = evaluateCondition(field.showWhen, state.values);
      }
    }
    
    return visibility;
  }, [schema.fields, state.values]);

  return (
    <fieldset className="mb-6">
      {/* Section header */}
      {(schema.title || schema.description) && (
        <div className="mb-4">
          {schema.title && (
            <legend className="text-lg font-semibold text-gray-900">
              {schema.title}
            </legend>
          )}
          {schema.description && (
            <p className="mt-1 text-sm text-gray-600">
              {schema.description}
            </p>
          )}
        </div>
      )}

      {/* Fields */}
      <div className="space-y-4">
        {schema.fields.map((field: FieldSchema) => (
          <FieldRenderer
            key={field.id}
            schema={field}
            isVisible={fieldVisibility[field.id]}
          />
        ))}
      </div>
    </fieldset>
  );
}
