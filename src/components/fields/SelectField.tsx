/**
 * SELECT FIELD COMPONENT
 * 
 * Schema-aware select with:
 * - Static or async options
 * - Dependent dropdowns support
 * - Loading state for async options
 */

import { useEffect, useState, useCallback } from 'react';
import { useField, useFormContext } from '@/state';
import { Select, Label, ErrorMessage, HelperText, type SelectOption } from '@/components/primitives';
import type { SelectFieldSchema } from '@/schema/types';

export interface SelectFieldProps {
  /** Field schema from form definition */
  schema: SelectFieldSchema;
  /** Whether field should be visible (from condition evaluation) */
  isVisible?: boolean;
}

/**
 * Select field connected to form state.
 * Supports both static options and async fetching.
 * 
 * @example
 * <SelectField
 *   schema={{
 *     id: 'country',
 *     type: 'select',
 *     label: 'Country',
 *     options: [
 *       { value: 'us', label: 'United States' },
 *       { value: 'uk', label: 'United Kingdom' },
 *     ],
 *   }}
 * />
 */
export function SelectField({ schema, isVisible = true }: SelectFieldProps) {
  const { value, error, touched, setValue, setTouched } = useField(schema.id);
  const { state } = useFormContext();
  
  // State for async options
  const [asyncOptions, setAsyncOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Determine if we need to fetch options
  const hasAsyncOptions = !!schema.asyncOptions;
  
  // Get dependency value if this is a dependent dropdown
  const dependsOnValue = (() => {
    const d = schema.asyncOptions?.dependsOn;
    if (!d) return undefined;
    if (Array.isArray(d)) {
      return state.values[d[0] as string];
    }
    return state.values[d as string];
  })();

  // Fetch async options
  const fetchOptions = useCallback(async () => {
    if (!schema.asyncOptions?.url) return;
    
    setIsLoading(true);
    setLoadError(null);
    
    try {
      // Build URL with dependency value if needed
      let url = schema.asyncOptions.url;
      if (schema.asyncOptions.dependsOn && dependsOnValue) {
        url = url.replace('{value}', String(dependsOnValue));
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch options');
      
      const data = await response.json();
      
      // Map response to options (configurable via schema)
      const options: SelectOption[] = data.map((item: Record<string, unknown>) => ({
        value: String(item.value || item.id),
        label: String(item.label || item.name),
      }));
      
      setAsyncOptions(options);
    } catch (err) {
      setLoadError('Failed to load options');
      console.error('Error fetching select options:', err);
    } finally {
      setIsLoading(false);
    }
  }, [schema.asyncOptions, dependsOnValue]);

  // Fetch options on mount or when dependency changes
  useEffect(() => {
    if (hasAsyncOptions) {
      // Clear current value if dependency changed
      if (schema.asyncOptions?.dependsOn && dependsOnValue !== undefined) {
        fetchOptions();
      } else if (!schema.asyncOptions?.dependsOn) {
        fetchOptions();
      }
    }
  }, [hasAsyncOptions, fetchOptions, schema.asyncOptions?.dependsOn, dependsOnValue]);

  if (!isVisible) return null;

  const isRequired = schema.validation?.some(rule => rule.type === 'required') ?? false;
  const errorId = `${schema.id}-error`;
  const helperId = `${schema.id}-helper`;
  const showError = touched && error;
  const helperText = schema.helperText || schema.helpText;

  // Handlers
  const handleChange = (newValue: string | number) => setValue(newValue as any);
  const handleBlur = () => setTouched(true);

  // Use async options if available, otherwise static options
  const options: SelectOption[] = hasAsyncOptions 
    ? asyncOptions 
    : (schema.options || []);

  // Build placeholder
  let placeholder = schema.placeholder || 'Select an option';
  if (isLoading) placeholder = 'Loading...';
  if (loadError) placeholder = loadError;

  return (
    <div className="mb-4">
      <Label htmlFor={schema.id} required={isRequired} className="mb-1">
        {schema.label}
      </Label>

      <Select
        id={schema.id}
        name={schema.id}
        value={value as any}
        onChange={handleChange}
        onBlur={handleBlur}
        options={options}
        placeholder={placeholder}
        disabled={schema.disabled || isLoading}
        hasError={!!showError || !!loadError}
        errorId={showError ? errorId : undefined}
        aria-describedby={helperText ? helperId : undefined}
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
