/**
 * INPUT PRIMITIVE
 * 
 * Base text input component with full accessibility.
 * Built from scratch - no component libraries.
 * 
 * Features:
 * - Controlled input with proper typing
 * - Error state styling
 * - aria-invalid and aria-describedby for screen readers
 * - Disabled state handling
 */

import { forwardRef, type InputHTMLAttributes, type ChangeEvent } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Unique identifier for the input */
  id: string;
  /** Current value */
  value: string | number;
  /** Change handler receiving the new value */
  onChange: (value: string) => void;
  /** Whether input has validation error */
  hasError?: boolean;
  /** ID of error message element for aria-describedby */
  errorId?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Accessible text input primitive.
 * 
 * @example
 * <Input
 *   id="email"
 *   value={email}
 *   onChange={setEmail}
 *   hasError={!!errors.email}
 *   errorId="email-error"
 *   type="email"
 *   placeholder="Enter your email"
 * />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      id,
      value,
      onChange,
      hasError = false,
      errorId,
      className = '',
      type = 'text',
      disabled = false,
      ...rest
    },
    ref
  ) {
    // Handle change event and extract value
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    // Build CSS classes
    const baseClasses = [
      // Base styles
      'block w-full px-3 py-2',
      'rounded-md border',
      'text-sm text-gray-900',
      'placeholder:text-gray-400',
      // Focus styles
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      // Transition
      'transition-colors duration-150',
    ].join(' ');

    const stateClasses = hasError
      ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20';

    const disabledClasses = disabled
      ? 'bg-gray-100 cursor-not-allowed opacity-60'
      : 'bg-white';

    const combinedClasses = [
      baseClasses,
      stateClasses,
      disabledClasses,
      className,
    ].join(' ');

    return (
      <input
        ref={ref}
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        aria-invalid={hasError ? 'true' : undefined}
        aria-describedby={hasError && errorId ? errorId : undefined}
        className={combinedClasses}
        {...rest}
      />
    );
  }
);
