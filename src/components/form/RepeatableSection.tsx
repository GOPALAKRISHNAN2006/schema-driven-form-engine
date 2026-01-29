/**
 * REPEATABLE SECTION COMPONENT
 * 
 * Renders a section that can be added/removed multiple times.
 * Common use cases: order items, attendees, addresses.
 * 
 * Each instance has a unique key and scoped field IDs.
 */

import { useMemo, useCallback } from 'react';
import { useFormContext, useRepeatableSection } from '@/state';
import { evaluateCondition } from '@/schema/resolver';
import { FieldRenderer } from '@/components/fields';
import { Button } from '@/components/primitives';
import type { SectionSchema, FieldSchema, FormValues } from '@/schema/types';

export interface RepeatableSectionProps {
  /** Section schema (with repeatable: true) */
  schema: SectionSchema;
  /** Maximum instances allowed */
  maxInstances?: number;
  /** Minimum instances required */
  minInstances?: number;
}

/**
 * Renders a repeatable section with add/remove controls.
 * 
 * @example
 * <RepeatableSection
 *   schema={{
 *     id: 'items',
 *     title: 'Order Items',
 *     repeatable: true,
 *     fields: [
 *       { id: 'productId', type: 'select', label: 'Product' },
 *       { id: 'quantity', type: 'number', label: 'Qty' },
 *     ],
 *   }}
 *   maxInstances={10}
 *   minInstances={1}
 * />
 */
export function RepeatableSection({
  schema,
  maxInstances = 10,
  minInstances = 0,
}: RepeatableSectionProps) {
  const { state } = useFormContext();
  const { instances, addInstance, removeInstance } = useRepeatableSection(schema.id);

  // Get section instances from state (array of instance objects)
  const sectionInstances = instances || [];
  const instanceCount = sectionInstances.length;

  // Can add/remove checks
  const canAdd = instanceCount < maxInstances;
  const canRemove = instanceCount > minInstances;

  // Create scoped field ID for a specific instance
  const getScopedFieldId = useCallback((instanceIndex: number, fieldId: string) => {
    // Matches reducer key format: `${fieldId}[${instanceIndex}]`
    return `${fieldId}[${instanceIndex}]`;
  }, []);

  // Get scoped values for an instance
  const getInstanceValues = useCallback((instanceIndex: number): FormValues => {
    const scopedValues: FormValues = {};
    for (const field of schema.fields) {
      const scopedId = getScopedFieldId(instanceIndex, field.id);
      scopedValues[field.id] = state.values[scopedId];
    }
    return scopedValues;
  }, [schema.fields, state.values, getScopedFieldId]);

  // Handle add instance
  const handleAdd = useCallback(() => {
    if (canAdd) {
      addInstance();
    }
  }, [canAdd, addInstance]);

  // Handle remove instance
  const handleRemove = useCallback((instanceIndex: number) => {
    if (canRemove) {
      removeInstance(instanceIndex);
    }
  }, [canRemove, removeInstance]);

  return (
    <div className="mb-6">
      {/* Section header */}
      {schema.title && (
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {schema.title}
            </h3>
            {schema.description && (
              <p className="mt-1 text-sm text-gray-600">
                {schema.description}
              </p>
            )}
          </div>
          
          {/* Add button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={!canAdd}
            aria-label={`Add ${schema.title || 'item'}`}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </Button>
        </div>
      )}

      {/* Instances */}
      {sectionInstances.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p>No items added yet</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAdd}
            disabled={!canAdd}
            className="mt-2"
          >
            Add your first item
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sectionInstances.map((_, index) => (
            <RepeatableSectionInstance
              key={index}
              schema={schema}
              instanceIndex={index}
              canRemove={canRemove}
              onRemove={() => handleRemove(index)}
              getScopedFieldId={getScopedFieldId}
              formValues={getInstanceValues(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Individual instance of a repeatable section.
 */
interface RepeatableSectionInstanceProps {
  schema: SectionSchema;
  instanceIndex: number;
  canRemove: boolean;
  onRemove: () => void;
  getScopedFieldId: (instanceIndex: number, fieldId: string) => string;
  formValues: FormValues;
}

function RepeatableSectionInstance({
  schema,
  instanceIndex,
  canRemove,
  onRemove,
  getScopedFieldId,
  formValues,
}: RepeatableSectionInstanceProps) {
  // Compute field visibility for this instance
  const fieldVisibility = useMemo(() => {
    const visibility: Record<string, boolean> = {};
    
    for (const field of schema.fields) {
      if (!field.showWhen) {
        visibility[field.id] = true;
      } else {
        // TODO: Need to scope condition evaluation to instance values
        visibility[field.id] = evaluateCondition(field.showWhen, formValues);
      }
    }
    
    return visibility;
  }, [schema.fields, formValues]);

  return (
    <div className="relative p-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* Instance header */}
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm font-medium text-gray-500">
          Item {instanceIndex + 1}
        </span>
        
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-gray-400 hover:text-error-600 transition-colors"
            aria-label={`Remove item ${instanceIndex + 1}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Instance fields */}
      <div className="space-y-3">
        {schema.fields.map((field: FieldSchema) => {
          // Create scoped schema with unique ID for this instance
          const scopedSchema = {
            ...field,
            id: getScopedFieldId(instanceIndex, field.id),
          };

          return (
            <FieldRenderer
              key={scopedSchema.id}
              schema={scopedSchema}
              isVisible={fieldVisibility[field.id]}
            />
          );
        })}
      </div>
    </div>
  );
}
