/**
 * FIELD RENDERER COMPONENT
 * 
 * Routes field schema to appropriate field component.
 * Uses discriminated union for type-safe rendering.
 * 
 * This is the central dispatch for field rendering -
 * it examines field.type and renders the correct component.
 */

import type { FieldSchema } from '@/schema/types';
import { TextField } from './TextField';
import { NumberField } from './NumberField';
import { SelectField } from './SelectField';
import { CheckboxField } from './CheckboxField';
import { TextareaField } from './TextareaField';

export interface FieldRendererProps {
  /** Field schema to render */
  schema: FieldSchema;
  /** Whether field should be visible */
  isVisible?: boolean;
}

/**
 * Renders the appropriate field component based on schema type.
 * Uses exhaustive type checking with discriminated unions.
 * 
 * @example
 * <FieldRenderer
 *   schema={{ id: 'email', type: 'text', label: 'Email' }}
 *   isVisible={true}
 * />
 */
export function FieldRenderer({ schema, isVisible = true }: FieldRendererProps) {
  // Don't render if not visible
  if (!isVisible) return null;

  // Exhaustive type check using discriminated union
  switch (schema.type) {
    case 'text':
      return <TextField schema={schema} isVisible={isVisible} />;
    
    case 'number':
      return <NumberField schema={schema} isVisible={isVisible} />;
    
    case 'select':
      return <SelectField schema={schema} isVisible={isVisible} />;
    
    case 'checkbox':
      return <CheckboxField schema={schema} isVisible={isVisible} />;
    
    case 'textarea':
      return <TextareaField schema={schema} isVisible={isVisible} />;
    
    default: {
      // TypeScript exhaustiveness check
      // This ensures we handle all field types
      const _exhaustiveCheck: never = schema;
      console.warn('Unknown field type:', _exhaustiveCheck);
      return null;
    }
  }
}
