/**
 * CHECKBOX PRIMITIVE
 * 
 * Custom styled checkbox with accessibility.
 * Uses hidden native checkbox for accessibility.
 * 
 * Pattern: Hidden native input + styled span
 * - Native input handles focus, keyboard, and screen readers
 * - Visual span provides custom styling
 */

import { forwardRef, type InputHTMLAttributes, type ChangeEvent } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  /** Unique identifier for the checkbox */
  id: string;
  /** Whether checkbox is checked */
  checked: boolean;
  /** Change handler receiving the new checked state */
  onChange: (checked: boolean) => void;
  /** Label text (rendered inline) */
  label?: string;
  /** Whether checkbox has validation error */
  hasError?: boolean;
  /** ID of error message element for aria-describedby */
  errorId?: string;
  /** Additional CSS classes for the wrapper */
  className?: string;
}

/**
 * Accessible checkbox primitive with custom styling.
 * 
 * @example
 * <Checkbox
 *   id="terms"
 *   checked={acceptTerms}
 *   onChange={setAcceptTerms}
 *   label="I accept the terms and conditions"
 *   hasError={!!errors.terms}
 *   errorId="terms-error"
 * />
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      id,
      checked,
      onChange,
      label,
      hasError = false,
      errorId,
      className = '',
      disabled = false,
      ...rest
    },
    ref
  ) {
    // Handle change event
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.checked);
    };

    // Checkbox box styling
    const boxBaseClasses = [
      'h-4 w-4',
      'rounded border',
      'flex items-center justify-center',
      'transition-colors duration-150',
    ].join(' ');

    const boxStateClasses = hasError
      ? 'border-error-500'
      : checked
        ? 'bg-blue-600 border-blue-600'
        : 'border-gray-300 bg-white';

    const boxDisabledClasses = disabled
      ? 'opacity-60 cursor-not-allowed'
      : 'cursor-pointer';

    return (
      <label
        htmlFor={id}
        className={`inline-flex items-start gap-2 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      >
        {/* Hidden native checkbox for accessibility */}
        <span className="relative flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={hasError ? 'true' : undefined}
            aria-describedby={hasError && errorId ? errorId : undefined}
            className="sr-only peer"
            {...rest}
          />
          
          {/* Visual checkbox */}
          <span
            className={`
              ${boxBaseClasses}
              ${boxStateClasses}
              ${boxDisabledClasses}
              peer-focus:ring-2 peer-focus:ring-blue-500/20 peer-focus:ring-offset-1
            `}
            aria-hidden="true"
          >
            {/* Checkmark icon */}
            {checked && (
              <svg
                className="h-3 w-3 text-white"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 6l3 3 5-5" />
              </svg>
            )}
          </span>
        </span>
        
        {/* Label text */}
        {label && (
          <span
            className={`
              text-sm
              ${disabled ? 'text-gray-400' : 'text-gray-700'}
            `}
          >
            {label}
          </span>
        )}
      </label>
    );
  }
);
