/**
 * TEXTAREA FIELD COMPONENT
 * 
 * Schema-aware textarea with:
 * - Configurable rows
 * - Auto-resize option
 * - Character count
 */

import { useField } from '@/state';
import { Textarea, Label, ErrorMessage, HelperText } from '@/components/primitives';
import type { TextareaFieldSchema } from '@/schema/types';

export interface TextareaFieldProps {
  /** Field schema from form definition */
  schema: TextareaFieldSchema;
  /** Whether field should be visible (from condition evaluation) */
  isVisible?: boolean;
}

/**
 * Textarea field connected to form state.
 * 
 * @example
 * <TextareaField
 *   schema={{
 *     id: 'message',
 *     type: 'textarea',
 *     label: 'Your Message',
 *     rows: 4,
 *     validation: [
 *       { type: 'required' },
 *       { type: 'maxLength', value: 500 },
 *     ],
 *   }}
 * />
 */
export function TextareaField({ schema, isVisible = true }: TextareaFieldProps) {
  const { value, error, touched, setValue, setTouched } = useField(schema.id);

  if (!isVisible) return null;

  const isRequired = schema.validation?.some(rule => rule.type === 'required') ?? false;
  const errorId = `${schema.id}-error`;
  const helperId = `${schema.id}-helper`;
  const showError = touched && error;
  const helperText = schema.helpText;

  // Handlers
  const handleChange = (newValue: string) => setValue(newValue);
  const handleBlur = () => setTouched(true);

  // Get max length for character count
  const maxLengthRule = schema.validation?.find(rule => rule.type === 'maxLength');
  const maxLength = maxLengthRule ? (maxLengthRule as { value?: number }).value : undefined;
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-baseline mb-1">
        <Label htmlFor={schema.id} required={isRequired}>
          {schema.label}
        </Label>
        
        {/* Character count */}
        {maxLength && (
          <span 
            className={`text-xs ${currentLength > maxLength ? 'text-error-600' : 'text-gray-500'}`}
            aria-live="polite"
          >
            {currentLength}/{maxLength}
          </span>
        )}
      </div>

      <Textarea
        id={schema.id}
        name={schema.id}
        value={(value as string) || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={schema.placeholder}
        disabled={schema.disabled}
        hasError={!!showError}
        errorId={showError ? errorId : undefined}
        aria-describedby={helperText ? helperId : undefined}
        rows={schema.rows || 3}
        autoResize={(schema as any).autoResize}
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
