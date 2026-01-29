/**
 * TEXTAREA PRIMITIVE
 * 
 * Multi-line text input with auto-resize option.
 * Built from scratch with full accessibility.
 */

import { forwardRef, type TextareaHTMLAttributes, type ChangeEvent, useEffect, useRef } from 'react';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  /** Unique identifier for the textarea */
  id: string;
  /** Current value */
  value: string;
  /** Change handler receiving the new value */
  onChange: (value: string) => void;
  /** Whether textarea has validation error */
  hasError?: boolean;
  /** ID of error message element for aria-describedby */
  errorId?: string;
  /** Auto-resize based on content */
  autoResize?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Accessible textarea primitive with optional auto-resize.
 * 
 * @example
 * <Textarea
 *   id="message"
 *   value={message}
 *   onChange={setMessage}
 *   rows={4}
 *   placeholder="Enter your message..."
 *   autoResize
 * />
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      id,
      value,
      onChange,
      hasError = false,
      errorId,
      autoResize = false,
      className = '',
      disabled = false,
      rows = 3,
      ...rest
    },
    forwardedRef
  ) {
    // Internal ref for auto-resize
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    
    // Combine refs
    const setRefs = (element: HTMLTextAreaElement | null) => {
      internalRef.current = element;
      if (typeof forwardedRef === 'function') {
        forwardedRef(element);
      } else if (forwardedRef) {
        forwardedRef.current = element;
      }
    };

    // Handle change event
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    };

    // Auto-resize effect
    useEffect(() => {
      if (autoResize && internalRef.current) {
        const textarea = internalRef.current;
        // Reset height to auto to get proper scrollHeight
        textarea.style.height = 'auto';
        // Set height to scrollHeight
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [value, autoResize]);

    // Build CSS classes
    const baseClasses = [
      'block w-full px-3 py-2',
      'rounded-md border',
      'text-sm text-gray-900',
      'placeholder:text-gray-400',
      'resize-y', // Allow vertical resize
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'transition-colors duration-150',
    ].join(' ');

    const stateClasses = hasError
      ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20';

    const disabledClasses = disabled
      ? 'bg-gray-100 cursor-not-allowed opacity-60'
      : 'bg-white';

    const autoResizeClasses = autoResize ? 'resize-none overflow-hidden' : '';

    const combinedClasses = [
      baseClasses,
      stateClasses,
      disabledClasses,
      autoResizeClasses,
      className,
    ].join(' ');

    return (
      <textarea
        ref={setRefs}
        id={id}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        rows={rows}
        aria-invalid={hasError ? 'true' : undefined}
        aria-describedby={hasError && errorId ? errorId : undefined}
        className={combinedClasses}
        {...rest}
      />
    );
  }
);
