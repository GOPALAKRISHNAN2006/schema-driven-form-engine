/**
 * CHECKBOX FIELD COMPONENT
 * 
 * Schema-aware checkbox with:
 * - Inline label support
 * - Required validation (must be checked)
 */

import { useField } from '@/state';
import { Checkbox, ErrorMessage } from '@/components/primitives';
import type { CheckboxFieldSchema } from '@/schema/types';

export interface CheckboxFieldProps {
  /** Field schema from form definition */
  schema: CheckboxFieldSchema;
  /** Whether field should be visible (from condition evaluation) */
  isVisible?: boolean;
}

/**
 * Checkbox field connected to form state.
 * 
 * @example
 * <CheckboxField
 *   schema={{
 *     id: 'terms',
 *     type: 'checkbox',
 *     label: 'I accept the terms and conditions',
 *     validation: [{ type: 'required', message: 'You must accept the terms' }],
 *   }}
 * />
 */
export function CheckboxField({ schema, isVisible = true }: CheckboxFieldProps) {
  const { value, error, touched, setValue, setTouched } = useField(schema.id);

  if (!isVisible) return null;

  const errorId = `${schema.id}-error`;
  const showError = touched && error;

  // Handle checkbox-specific change
  const handleCheckboxChange = (checked: boolean) => {
    setValue(checked);
  };
  
  const handleBlur = () => setTouched(true);

  return (
    <div className="mb-4">
      <Checkbox
        id={schema.id}
        name={schema.id}
        checked={!!value}
        onChange={handleCheckboxChange}
        onBlur={handleBlur}
        label={schema.label}
        disabled={schema.disabled}
        hasError={!!showError}
        errorId={showError ? errorId : undefined}
      />

      {showError && (
        <ErrorMessage id={errorId} className="ml-6">{error}</ErrorMessage>
      )}
    </div>
  );
}
