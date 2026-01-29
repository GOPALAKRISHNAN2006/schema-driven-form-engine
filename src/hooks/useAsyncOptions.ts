/**
 * useAsyncOptions Hook
 * 
 * Fetches options for select fields asynchronously.
 * Supports dependent dropdowns (options based on another field's value).
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { SelectOption } from '@/components/primitives';

export interface UseAsyncOptionsConfig {
  /** API endpoint URL */
  url: string;
  /** Field ID this depends on (for dependent dropdowns) */
  dependsOn?: string;
  /** Current value of the dependency field */
  dependencyValue?: unknown;
  /** Map response to options */
  mapResponse?: (data: unknown) => SelectOption[];
  /** Enable fetching */
  enabled?: boolean;
}

export interface UseAsyncOptionsResult {
  /** Fetched options */
  options: SelectOption[];
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Manually refetch options */
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching async select options.
 * 
 * @example
 * const { options, isLoading } = useAsyncOptions({
 *   url: '/api/cities?country={value}',
 *   dependsOn: 'country',
 *   dependencyValue: selectedCountry,
 * });
 */
export function useAsyncOptions({
  url,
  dependsOn,
  dependencyValue,
  mapResponse,
  enabled = true,
}: UseAsyncOptionsConfig): UseAsyncOptionsResult {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Default response mapper
  const defaultMapper = (data: unknown): SelectOption[] => {
    if (!Array.isArray(data)) return [];
    
    return data.map((item: Record<string, unknown>) => ({
      value: String(item.value ?? item.id ?? ''),
      label: String(item.label ?? item.name ?? ''),
    }));
  };

  // Fetch function
  const fetchOptions = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Don't fetch if dependency value is missing
    if (dependsOn && !dependencyValue) {
      setOptions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      // Replace {value} placeholder with dependency value
      let fetchUrl = url;
      if (dependsOn && dependencyValue) {
        fetchUrl = url.replace('{value}', encodeURIComponent(String(dependencyValue)));
      }

      const response = await fetch(fetchUrl, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const mapper = mapResponse || defaultMapper;
      const mappedOptions = mapper(data);

      setOptions(mappedOptions);
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return;
      }
      console.error('Failed to fetch options:', err);
      setError('Failed to load options');
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [url, dependsOn, dependencyValue, mapResponse]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    if (enabled) {
      fetchOptions();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, fetchOptions]);

  // Clear options when dependency clears
  useEffect(() => {
    if (dependsOn && !dependencyValue) {
      setOptions([]);
    }
  }, [dependsOn, dependencyValue]);

  return {
    options,
    isLoading,
    error,
    refetch: fetchOptions,
  };
}
