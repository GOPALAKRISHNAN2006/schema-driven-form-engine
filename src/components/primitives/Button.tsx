/**
 * BUTTON PRIMITIVE
 * 
 * Accessible button with variants and loading state.
 * Built from scratch - supports multiple visual styles.
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size variant */
  size?: ButtonSize;
  /** Loading state - shows spinner and disables button */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Button content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Accessible button primitive with variants.
 * 
 * @example
 * <Button variant="primary" onClick={handleSubmit} loading={isSubmitting}>
 *   Submit Form
 * </Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      children,
      className = '',
      disabled = false,
      type = 'button',
      ...rest
    },
    ref
  ) {
    // Base classes
    const baseClasses = [
      'inline-flex items-center justify-center',
      'font-medium',
      'rounded-md',
      'transition-colors duration-150',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-60',
    ].join(' ');

    // Variant classes
    const variantClasses: Record<ButtonVariant, string> = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
    };

    // Size classes
    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const combinedClasses = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      className,
    ].join(' ');

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={combinedClasses}
        aria-busy={loading ? 'true' : undefined}
        {...rest}
      >
        {/* Loading spinner */}
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {children}
      </button>
    );
  }
);
