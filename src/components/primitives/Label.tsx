/**
 * LABEL PRIMITIVE
 * 
 * Form label with required indicator support.
 * Proper association with form controls via htmlFor.
 */

import type { LabelHTMLAttributes, ReactNode } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** The ID of the form control this label is for */
  htmlFor: string;
  /** Label text */
  children: ReactNode;
  /** Show required indicator (*) */
  required?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Accessible label primitive.
 * 
 * @example
 * <Label htmlFor="email" required>
 *   Email Address
 * </Label>
 */
export function Label({
  htmlFor,
  children,
  required = false,
  className = '',
  ...rest
}: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-700 ${className}`}
      {...rest}
    >
      {children}
      {required && (
        <span className="text-error-500 ml-0.5" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
