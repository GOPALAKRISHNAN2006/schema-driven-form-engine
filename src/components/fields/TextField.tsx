/**
 * TEXT FIELD COMPONENT
 * 
 * Schema-aware text input that:
 * - Connects to FormContext via useField hook
 * - Renders Label + Input + ErrorMessage
 * - Handles validation display
 * - Supports conditional visibility
 */

import { useField } from '@/state';
import { Input, Label, ErrorMessage, HelperText } from '@/components/primitives';
import type { TextFieldSchema } from '@/schema/types';

export interface TextFieldProps {
  /** Field schema from form definition */
  schema: TextFieldSchema;
  /** Whether field should be visible (from condition evaluation) */
  isVisible?: boolean;
}

/**
 * Text field connected to form state.
 * 
 * @example
 * <TextField
 *   schema={{
 *     id: 'email',
 *     type: 'text',
 *     label: 'Email',
 *     inputType: 'email',
 *     validation: [{ type: 'required' }, { type: 'email' }],
 *   }}
 * />
 */
export function TextField({ schema, isVisible = true }: TextFieldProps) {
  // Connect to form state
  const { value, error, touched, setValue, setTouched } = useField(schema.id);

  // Don't render if not visible
  if (!isVisible) return null;

  // Check if field is required
  const isRequired = schema.validation?.some(rule => rule.type === 'required') ?? false;

  // ID for error message (for aria-describedby)
  const errorId = `${schema.id}-error`;
  const helperId = `${schema.id}-helper`;

  // Show error only if touched
  const showError = touched && error;
  
  // Helper text from either property
  const helperText = schema.helperText || schema.helpText;

  // Handlers
  const handleChange = (newValue: string) => setValue(newValue);
  const handleBlur = () => setTouched(true);

  return (
    <div className="mb-4">
      {/* Label */}
      <Label htmlFor={schema.id} required={isRequired} className="mb-1">
        {schema.label}
      </Label>

      {/* Input */}
      <Input
        id={schema.id}
        name={schema.id}
        type={schema.inputType || 'text'}
        value={(value as string) || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={schema.placeholder}
        disabled={schema.disabled}
        hasError={!!showError}
        errorId={showError ? errorId : undefined}
        aria-describedby={helperText ? helperId : undefined}
      />

      {/* Helper text (shown when no error) */}
      {helperText && !showError && (
        <HelperText id={helperId}>{helperText}</HelperText>
      )}

      {/* Error message */}
      {showError && (
        <ErrorMessage id={errorId}>{error}</ErrorMessage>
      )}
    </div>
  );
}
