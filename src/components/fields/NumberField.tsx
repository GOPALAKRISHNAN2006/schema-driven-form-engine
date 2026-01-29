/**
 * NUMBER FIELD COMPONENT
 * 
 * Schema-aware number input with:
 * - Min/max constraints
 * - Step control
 * - Numeric validation
 */

import { useField } from '@/state';
import { Input, Label, ErrorMessage, HelperText } from '@/components/primitives';
import type { NumberFieldSchema } from '@/schema/types';

export interface NumberFieldProps {
  /** Field schema from form definition */
  schema: NumberFieldSchema;
  /** Whether field should be visible (from condition evaluation) */
  isVisible?: boolean;
}

/**
 * Number field connected to form state.
 * 
 * @example
 * <NumberField
 *   schema={{
 *     id: 'age',
 *     type: 'number',
 *     label: 'Age',
 *     min: 0,
 *     max: 120,
 *     validation: [{ type: 'required' }],
 *   }}
 * />
 */
export function NumberField({ schema, isVisible = true }: NumberFieldProps) {
  const { value, error, touched, setValue, setTouched } = useField(schema.id);

  if (!isVisible) return null;

  const isRequired = schema.validation?.some(rule => rule.type === 'required') ?? false;
  const errorId = `${schema.id}-error`;
  const helperId = `${schema.id}-helper`;
  const showError = touched && error;
  const helperText = schema.helpText;

  // Handlers
  const handleBlur = () => setTouched(true);

  // Handle number-specific change
  const handleNumberChange = (stringValue: string) => {
    // Allow empty string
    if (stringValue === '') {
      setValue('');
      return;
    }
    
    // Parse number
    const numValue = parseFloat(stringValue);
    if (!isNaN(numValue)) {
      setValue(numValue);
    }
  };

  return (
    <div className="mb-4">
      <Label htmlFor={schema.id} required={isRequired} className="mb-1">
        {schema.label}
      </Label>

      <Input
        id={schema.id}
        name={schema.id}
        type="number"
        value={value !== undefined && value !== null ? String(value) : ''}
        onChange={handleNumberChange}
        onBlur={handleBlur}
        placeholder={schema.placeholder}
        disabled={schema.disabled}
        hasError={!!showError}
        errorId={showError ? errorId : undefined}
        aria-describedby={helperText ? helperId : undefined}
        min={schema.min}
        max={schema.max}
        step={schema.step}
      />

      {helperText && !showError && (
        <HelperText id={helperId}>{helperText}</HelperText>
      )}

      {showError && (
        <ErrorMessage id={errorId}>{error}</ErrorMessage>
      )}
    </div>
  );
}
