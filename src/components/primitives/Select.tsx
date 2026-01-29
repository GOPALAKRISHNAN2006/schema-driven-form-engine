/**
 * SELECT PRIMITIVE
 * 
 * Native select element with custom styling.
 * Built from scratch with full accessibility.
 * 
 * Why native <select>?
 * - Best accessibility out of the box
 * - Works with screen readers without extra work
 * - Mobile-friendly with native picker
 * - Keyboard navigation built-in
 */

import { forwardRef, type SelectHTMLAttributes, type ChangeEvent } from 'react';

export interface SelectOption {
  /** Option value */
  value: any;
  /** Display label */
  label: string;
  /** Whether option is disabled */
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  /** Unique identifier for the select */
  id: string;
  /** Current value */
  value: any;
  /** Change handler receiving the new value */
  onChange: (value: any) => void;
  /** Array of options to display */
  options: SelectOption[];
  /** Placeholder text (first disabled option) */
  placeholder?: string;
  /** Whether select has validation error */
  hasError?: boolean;
  /** ID of error message element for aria-describedby */
  errorId?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Accessible select primitive using native <select>.
 * 
 * @example
 * <Select
 *   id="country"
 *   value={country}
 *   onChange={setCountry}
 *   options={[
 *     { value: 'us', label: 'United States' },
 *     { value: 'uk', label: 'United Kingdom' },
 *   ]}
 *   placeholder="Select a country"
 * />
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      id,
      value,
      onChange,
      options,
      placeholder,
      hasError = false,
      errorId,
      className = '',
      disabled = false,
      ...rest
    },
    ref
  ) {
    // Handle change event
    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
      const str = e.target.value;
      // Try to map back to original option types (number|string)
      const found = options.find((o) => String(o.value) === str);
      if (found) {
        onChange(found.value);
      } else {
        onChange(str);
      }
    };

    // Build CSS classes
    const baseClasses = [
      'block w-full px-3 py-2',
      'rounded-md border',
      'text-sm text-gray-900',
      // Custom arrow styling
      'appearance-none',
      'bg-no-repeat bg-right',
      'pr-10', // Space for arrow
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

    // Inline style for custom dropdown arrow
    const arrowStyle = {
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
      backgroundPosition: 'right 0.5rem center',
      backgroundSize: '1.5rem 1.5rem',
    };

    // Convert null/undefined to empty string to avoid React warning
    const safeValue = value ?? '';

    return (
      <select
        ref={ref}
        id={id}
        value={safeValue}
        onChange={handleChange}
        disabled={disabled}
        aria-invalid={hasError ? 'true' : undefined}
        aria-describedby={hasError && errorId ? errorId : undefined}
        className={combinedClasses}
        style={arrowStyle}
        {...rest}
      >
        {/* Placeholder option */}
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        
        {/* Options */}
        {options.map((option) => (
          <option
            key={String(option.value)}
            value={String(option.value)}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);
