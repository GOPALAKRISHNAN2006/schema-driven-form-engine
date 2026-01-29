/**
 * DEEP GET/SET UTILITIES
 * 
 * Utilities for working with nested object paths.
 * Used for repeatable sections with dot notation paths.
 */

/**
 * Get a nested value from an object using dot notation.
 * 
 * @example
 * deepGet({ a: { b: 1 } }, 'a.b') // => 1
 * deepGet({ items: [{ name: 'foo' }] }, 'items.0.name') // => 'foo'
 */
export function deepGet<T = unknown>(
  obj: Record<string, unknown>,
  path: string
): T | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  
  return current as T;
}

/**
 * Set a nested value in an object using dot notation.
 * Returns a new object (immutable).
 * 
 * @example
 * deepSet({ a: { b: 1 } }, 'a.b', 2) // => { a: { b: 2 } }
 */
export function deepSet<T extends Record<string, unknown>>(
  obj: T,
  path: string,
  value: unknown
): T {
  const keys = path.split('.');
  const result = { ...obj } as Record<string, unknown>;
  let current = result;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (key === undefined) continue;
    
    const nextKey = keys[i + 1];
    const isNextKeyNumeric = nextKey !== undefined && /^\d+$/.test(nextKey);
    
    if (current[key] === undefined || current[key] === null) {
      current[key] = isNextKeyNumeric ? [] : {};
    } else if (Array.isArray(current[key])) {
      current[key] = [...(current[key] as unknown[])];
    } else if (typeof current[key] === 'object') {
      current[key] = { ...(current[key] as Record<string, unknown>) };
    }
    
    current = current[key] as Record<string, unknown>;
  }
  
  const lastKey = keys[keys.length - 1];
  if (lastKey !== undefined) {
    current[lastKey] = value;
  }
  
  return result as T;
}

/**
 * Delete a nested value from an object using dot notation.
 * Returns a new object (immutable).
 */
export function deepDelete<T extends Record<string, unknown>>(
  obj: T,
  path: string
): T {
  const keys = path.split('.');
  if (keys.length === 0) return obj;
  
  if (keys.length === 1) {
    const { [keys[0] as keyof T]: _, ...rest } = obj;
    return rest as T;
  }
  
  const result = { ...obj } as Record<string, unknown>;
  let current = result;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (key === undefined || current[key] === undefined) {
      return obj; // Path doesn't exist, return original
    }
    
    if (Array.isArray(current[key])) {
      current[key] = [...(current[key] as unknown[])];
    } else if (typeof current[key] === 'object') {
      current[key] = { ...(current[key] as Record<string, unknown>) };
    }
    
    current = current[key] as Record<string, unknown>;
  }
  
  const lastKey = keys[keys.length - 1];
  if (lastKey !== undefined) {
    delete current[lastKey];
  }
  
  return result as T;
}

/**
 * Check if a path exists in an object.
 */
export function deepHas(
  obj: Record<string, unknown>,
  path: string
): boolean {
  const value = deepGet(obj, path);
  return value !== undefined;
}
