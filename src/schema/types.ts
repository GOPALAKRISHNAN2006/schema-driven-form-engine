/**
 * SCHEMA TYPES
 * 
 * Design Decisions:
 * 1. Discriminated unions for field types - enables exhaustive type checking
 * 2. Validation rules are declarative - no functions in JSON
 * 3. Conditions use a simple expression language - evaluable at runtime
 * 4. Async config is separate - clearly marks network dependencies
 */

// ============================================================================
// FIELD TYPES - Using discriminated union pattern
// ============================================================================

/**
 * Base properties shared by ALL field types.
 * Every field must have these regardless of type.
 */
export interface BaseFieldSchema {
  /** Unique identifier, used as form state key and DOM id */
  id: string;
  
  /** Human-readable label for the field */
  label: string;
  
  /** Optional helper text shown below the field */
  helpText?: string;
  
  /** Placeholder text for input fields */
  placeholder?: string;
  
  /** Whether field is disabled (still visible, not editable) */
  disabled?: boolean;
  
  /** Whether field is read-only (visible, shows value, not editable) */
  readOnly?: boolean;
  
  /** Validation rules - evaluated in order, first failure stops */
  validation?: ValidationRule[];
  
  /** Condition that must be true for field to be visible */
  showWhen?: Condition;
  
  /** CSS class names for custom styling */
  className?: string;
}

/**
 * Text input field (single line)
 */
export interface TextFieldSchema extends BaseFieldSchema {
  type: 'text';
  defaultValue?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string; // Regex pattern for HTML5 validation
  /** Input type attribute (email, password, tel, url, etc.) */
  inputType?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
  /** Alias for helpText for convenience */
  helperText?: string;
}

/**
 * Number input field
 */
export interface NumberFieldSchema extends BaseFieldSchema {
  type: 'number';
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  /** Alias for helpText for convenience */
  helperText?: string;
}

/**
 * Select/dropdown field
 */
export interface SelectFieldSchema extends BaseFieldSchema {
  type: 'select';
  defaultValue?: string | number;
  
  /** Static options - use this OR asyncOptions, not both */
  options?: SelectOption[];
  
  /** Config for fetching options from an API */
  asyncOptions?: AsyncOptionsConfig;
  
  
  /** Allow selecting multiple values */
  multiple?: boolean;
  
  /** Alias for helpText for convenience */
  helperText?: string;
}

/**
 * Checkbox field (boolean)
 */
export interface CheckboxFieldSchema extends BaseFieldSchema {
  type: 'checkbox';
  defaultValue?: boolean;
}

/**
 * Textarea field (multi-line text)
 */
export interface TextareaFieldSchema extends BaseFieldSchema {
  type: 'textarea';
  defaultValue?: string;
  minLength?: number;
  maxLength?: number;
  rows?: number;
  /** Alias for helpText for convenience */
  helperText?: string;
}

/**
 * Union of all field types.
 * The 'type' property acts as discriminator for type narrowing.
 * 
 * Usage:
 * ```ts
 * function renderField(field: FieldSchema) {
 *   switch (field.type) {
 *     case 'text': // TypeScript knows field is TextFieldSchema here
 *     case 'number': // TypeScript knows field is NumberFieldSchema here
 *   }
 * }
 * ```
 */
export type FieldSchema =
  | TextFieldSchema
  | NumberFieldSchema
  | SelectFieldSchema
  | CheckboxFieldSchema
  | TextareaFieldSchema;

// ============================================================================
// SELECT OPTIONS
// ============================================================================

export interface SelectOption {
  /** Display text */
  label: string;
  
  /** Actual value stored in form state */
  value: string | number;
  
  /** Whether this option is disabled */
  disabled?: boolean;
}

/**
 * Configuration for fetching select options asynchronously.
 * Designed to be serializable (no functions).
 */
export interface AsyncOptionsConfig {
  /** API endpoint URL */
  url: string;
  
  /** HTTP method, defaults to GET */
  method?: 'GET' | 'POST';
  
  /** 
   * JSONPath-like accessor for extracting options array from response.
   * Example: "data.items" extracts response.data.items
   */
  responsePath?: string;
  
  /** Map response item properties to label/value */
  labelKey?: string;  // defaults to 'label'
  valueKey?: string;  // defaults to 'value'
  
  /** 
   * Field IDs whose values should be included in request.
   * Enables dependent dropdowns (e.g., city depends on country).
   */
  dependsOn?: string[];
  
  /** Cache duration in milliseconds, 0 = no cache */
  cacheDuration?: number;
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

/**
 * Validation rules are declarative objects, not functions.
 * This allows:
 * 1. Schema to be pure JSON (serializable)
 * 2. Rules to be validated at parse time
 * 3. Custom error messages per rule
 */

export interface BaseValidationRule {
  /** Error message shown when validation fails */
  // Make message optional so simple story examples don't have to include it
  message?: string;
  
  /** 
   * When to run this validation.
   * - 'change': Run on every change (default for sync)
   * - 'blur': Run when field loses focus
   * - 'submit': Run only on form submission
   */
  trigger?: 'change' | 'blur' | 'submit';
}

export interface RequiredRule extends BaseValidationRule {
  type: 'required';
}

export interface MinLengthRule extends BaseValidationRule {
  type: 'minLength';
  value: number;
}

export interface MaxLengthRule extends BaseValidationRule {
  type: 'maxLength';
  value: number;
}

export interface PatternRule extends BaseValidationRule {
  type: 'pattern';
  /** Regex pattern as string (JSON-serializable) */
  value: string;
}

export interface MinRule extends BaseValidationRule {
  type: 'min';
  value: number;
}

export interface MaxRule extends BaseValidationRule {
  type: 'max';
  value: number;
}

export interface EmailRule extends BaseValidationRule {
  type: 'email';
}

export interface PhoneRule extends BaseValidationRule {
  type: 'phone';
}

export interface UrlRule extends BaseValidationRule {
  type: 'url';
}

/**
 * Custom sync validation - references a named validator function.
 * The actual function is registered separately, not in schema.
 */
export interface CustomSyncRule extends BaseValidationRule {
  type: 'custom';
  /** Name of registered validator function */
  validator: string;
  /** Additional params passed to validator */
  params?: Record<string, unknown>;
}

/**
 * Async validation - for server-side checks like username availability.
 */
export interface AsyncRule extends BaseValidationRule {
  type: 'async';
  /** URL to call for validation */
  url: string;
  /** Debounce delay in ms to prevent excessive API calls */
  debounceMs?: number;
}

export type ValidationRule =
  | RequiredRule
  | MinLengthRule
  | MaxLengthRule
  | PatternRule
  | MinRule
  | MaxRule
  | EmailRule
  | PhoneRule
  | UrlRule
  | CustomSyncRule
  | AsyncRule;

// ============================================================================
// CONDITIONAL LOGIC
// ============================================================================

/**
 * Conditions determine field visibility.
 * Using a simple expression tree that's JSON-serializable.
 */

export interface SimpleCondition {
  /** Field ID to check */
  field: string;
  
  /** Comparison operator */
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 
            'lessThan' | 'isEmpty' | 'isNotEmpty' | 'in' | 'notIn';
  
  /** Value to compare against (not needed for isEmpty/isNotEmpty) */
  value?: unknown;
}

export interface AndCondition {
  and: Condition[];
}

export interface OrCondition {
  or: Condition[];
}

export interface NotCondition {
  not: Condition;
}

/**
 * Condition can be simple or compound (and/or/not).
 * This allows complex expressions like:
 * { and: [
 *   { field: 'country', operator: 'equals', value: 'US' },
 *   { or: [
 *     { field: 'age', operator: 'greaterThan', value: 18 },
 *     { field: 'hasParentalConsent', operator: 'equals', value: true }
 *   ]}
 * ]}
 */
export type Condition = SimpleCondition | AndCondition | OrCondition | NotCondition;

// ============================================================================
// SECTIONS & FORM SCHEMA
// ============================================================================

/**
 * A section groups related fields together.
 * Sections can be repeatable (like adding multiple addresses).
 */
export interface SectionSchema {
  id: string;
  title?: string;
  description?: string;
  
  /** Fields in this section */
  fields: FieldSchema[];
  
  /** Whether this section can be repeated (array of entries) */
  repeatable?: boolean;
  
  /** Min/max instances for repeatable sections */
  minInstances?: number;
  maxInstances?: number;
  
  /** Condition for section visibility */
  showWhen?: Condition;
  
  /** Nested sections (for complex forms) */
  sections?: SectionSchema[];
}

/**
 * Top-level form schema.
 * This is what you pass to FormRenderer.
 */
export interface FormSchema {
  /** Unique form identifier */
  id: string;
  /** Optional schema version */
  version?: string;
  
  /** Form title (used for a11y) */
  title: string;
  
  /** Optional description */
  description?: string;
  
  /** Form sections containing fields */
  sections: SectionSchema[];
  
  /** Submit button configuration */
  submit?: {
    label?: string;
    loadingLabel?: string;
  };
  
  /** Reset button configuration */
  reset?: {
    label?: string;
    show?: boolean;
  };
  
  /** Autosave configuration */
  autosave?: AutosaveConfig;
}

// ============================================================================
// AUTOSAVE CONFIGURATION
// ============================================================================

export interface AutosaveConfig {
  /** Enable/disable autosave */
  enabled: boolean;
  
  /** Debounce delay before saving (ms) */
  debounceMs?: number;
  
  /** Storage key prefix for localStorage */
  storageKey?: string;
  
  /** 
   * Conflict resolution strategy:
   * - 'local': Always use local changes
   * - 'remote': Always use remote/saved changes  
   * - 'prompt': Ask user to choose
   */
  conflictStrategy?: 'local' | 'remote' | 'prompt';
  
  /** Version field for optimistic locking */
  versionField?: string;
}

// ============================================================================
// FORM STATE TYPES (used internally, not in schema)
// ============================================================================

/**
 * Valid field value types - strongly typed to prevent runtime errors.
 * Includes array support for multi-select fields.
 */
export type FieldValue = string | number | boolean | string[] | null | undefined;

/**
 * Form values object with strong typing.
 * Uses FieldValue union to ensure type safety across the form engine.
 */
export type FormValues = Record<string, FieldValue>;

export interface FieldState {
  value: FieldValue;
  touched: boolean;
  dirty: boolean;
  validating: boolean;
  errors: string[];
}

export interface FormState {
  values: FormValues;
  fields: Record<string, FieldState>;
  isSubmitting: boolean;
  isValidating: boolean;
  isDirty: boolean;
  isValid: boolean;
  submitCount: number;
}

// ============================================================================
// TYPE GUARDS - Runtime type checking utilities
// ============================================================================

export function isSimpleCondition(condition: Condition): condition is SimpleCondition {
  return 'field' in condition && 'operator' in condition;
}

export function isAndCondition(condition: Condition): condition is AndCondition {
  return 'and' in condition;
}

export function isOrCondition(condition: Condition): condition is OrCondition {
  return 'or' in condition;
}

export function isNotCondition(condition: Condition): condition is NotCondition {
  return 'not' in condition;
}
