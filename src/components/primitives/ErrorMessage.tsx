/**
 * ERROR MESSAGE PRIMITIVE
 * 
 * Accessible error message display.
 * Uses aria-live for screen reader announcements.
 */

import type { HTMLAttributes, ReactNode } from 'react';

export interface ErrorMessageProps extends HTMLAttributes<HTMLDivElement> {
  /** Unique ID (used for aria-describedby on inputs) */
  id: string;
  /** Error message content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Accessible error message with live region.
 * 
 * @example
 * <ErrorMessage id="email-error">
 *   Please enter a valid email address
 * </ErrorMessage>
 */
export function ErrorMessage({
  id,
  children,
  className = '',
  ...rest
}: ErrorMessageProps) {
  if (!children) return null;

  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={`mt-1 text-sm text-error-600 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * HELPER TEXT PRIMITIVE
 * 
 * Non-error help text for form fields.
 */

export interface HelperTextProps extends HTMLAttributes<HTMLDivElement> {
  /** Unique ID (used for aria-describedby on inputs) */
  id: string;
  /** Helper text content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Helper text for form fields.
 * 
 * @example
 * <HelperText id="password-helper">
 *   Password must be at least 8 characters
 * </HelperText>
 */
export function HelperText({
  id,
  children,
  className = '',
  ...rest
}: HelperTextProps) {
  if (!children) return null;

  return (
    <div
      id={id}
      className={`mt-1 text-sm text-gray-500 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
