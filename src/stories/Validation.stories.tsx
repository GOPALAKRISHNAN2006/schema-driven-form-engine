/**
 * VALIDATION STORIES
 * 
 * Demonstrates validation features with interaction tests.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { expect, within, userEvent } from '@storybook/test';
import { FormRenderer } from '@/components/form';
import type { FormSchema, FormValues } from '@/schema/types';
import { runAxeAccessibilityCheck, validateFocusOnError } from './test-utils';

const meta: Meta<typeof FormRenderer> = {
  title: 'Features/Validation',
  component: FormRenderer,
  parameters: {
    docs: {
      description: {
        component: 'Demonstrates built-in validation rules.',
      },
    },
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FormRenderer>;

// ============= REQUIRED VALIDATION =============

const requiredSchema: FormSchema = {
  id: 'required-validation',
  version: '1.0',
  title: 'Required Field Validation',
  description: 'All fields are required. Try to submit without filling them.',
  sections: [
    {
      id: 'main',
      fields: [
        {
          id: 'name',
          type: 'text',
          label: 'Name',
          placeholder: 'Your name',
          validation: [{ type: 'required', message: 'Name is required' }],
        },
        {
          id: 'email',
          type: 'text',
          label: 'Email',
          inputType: 'email',
          placeholder: 'your@email.com',
          validation: [{ type: 'required', message: 'Email is required' }],
        },
        {
          id: 'terms',
          type: 'checkbox',
          label: 'I accept the terms and conditions',
          validation: [{ type: 'required', message: 'You must accept the terms' }],
        },
      ],
    },
  ],
};

export const RequiredFields: Story = {
  args: {
    schema: requiredSchema,
    onSubmit: (values: FormValues) => {
      alert('Form submitted successfully!');
      console.log('Submitted:', values);
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Run axe accessibility check first
    await runAxeAccessibilityCheck(canvasElement);
    
    // Wait for form to render
    const submitButton = await canvas.findByRole('button', { name: /submit/i }, { timeout: 5000 });
    
    // Try to submit without filling any fields
    await userEvent.click(submitButton);
    
    // Verify validation errors appear
    await expect(canvas.getByText('Name is required')).toBeInTheDocument();
    await expect(canvas.getByText('Email is required')).toBeInTheDocument();
    
    // Verify aria-invalid is set on invalid fields
    const nameInput = await canvas.findByRole('textbox', { name: /name/i }, { timeout: 5000 });
    await expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    
    // Verify error has role="alert" for screen reader announcement
    const errorElements = canvasElement.querySelectorAll('[role="alert"]');
    await expect(errorElements.length).toBeGreaterThan(0);
    
    // Verify aria-describedby links input to error message
    const emailInput = await canvas.findByRole('textbox', { name: /email/i }, { timeout: 5000 });
    const describedBy = emailInput.getAttribute('aria-describedby');
    await expect(describedBy).toBeTruthy();
    
    // Verify focus moved to first invalid field
    await validateFocusOnError(canvasElement);
    
    // Fill in fields and verify errors clear
    await userEvent.type(nameInput, 'John Doe');
    await userEvent.type(emailInput, 'john@example.com');
    
    // Check the terms checkbox
    const termsCheckbox = await canvas.findByRole('checkbox', { name: /terms/i }, { timeout: 5000 });
    await userEvent.click(termsCheckbox);
    
    // Submit again - should succeed without errors
    await userEvent.click(submitButton);
  },
};

// ============= EMAIL VALIDATION =============

const emailSchema: FormSchema = {
  id: 'email-validation',
  version: '1.0',
  title: 'Email Validation',
  description: 'Enter an invalid email to see validation.',
  sections: [
    {
      id: 'main',
      fields: [
        {
          id: 'email',
          type: 'text',
          label: 'Email Address',
          inputType: 'email',
          placeholder: 'your@email.com',
          validation: [
            { type: 'required', message: 'Email is required' },
            { type: 'email', message: 'Please enter a valid email address' },
          ],
        },
      ],
    },
  ],
};

export const EmailValidation: Story = {
  args: {
    schema: emailSchema,
    onSubmit: (values: FormValues) => console.log('Submitted:', values),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Run axe accessibility check
    await runAxeAccessibilityCheck(canvasElement);
    
    const emailInput = canvas.getByRole('textbox', { name: /email address/i });
    const submitButton = canvas.getByRole('button', { name: /submit/i });
    
    // Test invalid email format
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.tab(); // Trigger blur validation
    await userEvent.click(submitButton);
    
    // Verify email format error
    await expect(canvas.getByText('Please enter a valid email address')).toBeInTheDocument();
    
    // Verify aria-invalid
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    
    // Fix with valid email
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'valid@email.com');
    await userEvent.click(submitButton);
  },
};

// ============= LENGTH VALIDATION =============

const lengthSchema: FormSchema = {
  id: 'length-validation',
  version: '1.0',
  title: 'Length Validation',
  description: 'Fields with minimum and maximum length requirements.',
  sections: [
    {
      id: 'main',
      fields: [
        {
          id: 'username',
          type: 'text',
          label: 'Username',
          placeholder: 'min 3 characters',
          helperText: 'Must be between 3 and 20 characters',
          validation: [
            { type: 'required' },
            { type: 'minLength', value: 3, message: 'Username must be at least 3 characters' },
            { type: 'maxLength', value: 20, message: 'Username must be at most 20 characters' },
          ],
        },
        {
          id: 'bio',
          type: 'textarea',
          label: 'Bio',
          placeholder: 'Tell us about yourself...',
          rows: 4,
          validation: [
            { type: 'maxLength', value: 200, message: 'Bio must be at most 200 characters' },
          ],
        },
      ],
    },
  ],
};

export const LengthValidation: Story = {
  args: {
    schema: lengthSchema,
    onSubmit: (values: FormValues) => console.log('Submitted:', values),
  },
};

// ============= NUMBER RANGE VALIDATION =============

const rangeSchema: FormSchema = {
  id: 'range-validation',
  version: '1.0',
  title: 'Number Range Validation',
  description: 'Number fields with min/max constraints.',
  sections: [
    {
      id: 'main',
      fields: [
        {
          id: 'age',
          type: 'number',
          label: 'Age',
          min: 18,
          max: 120,
          helperText: 'Must be between 18 and 120',
          validation: [
            { type: 'required' },
            { type: 'min', value: 18, message: 'You must be at least 18 years old' },
            { type: 'max', value: 120, message: 'Please enter a valid age' },
          ],
        },
        {
          id: 'quantity',
          type: 'number',
          label: 'Quantity',
          min: 1,
          max: 10,
          helperText: 'Order between 1 and 10 items',
          validation: [
            { type: 'required' },
            { type: 'min', value: 1, message: 'Minimum order is 1' },
            { type: 'max', value: 10, message: 'Maximum order is 10' },
          ],
        },
      ],
    },
  ],
};

export const NumberRangeValidation: Story = {
  args: {
    schema: rangeSchema,
    onSubmit: (values: FormValues) => console.log('Submitted:', values),
  },
};

// ============= PATTERN VALIDATION =============

const patternSchema: FormSchema = {
  id: 'pattern-validation',
  version: '1.0',
  title: 'Pattern (Regex) Validation',
  description: 'Fields validated with regular expressions.',
  sections: [
    {
      id: 'main',
      fields: [
        {
          id: 'zipCode',
          type: 'text',
          label: 'US Zip Code',
          placeholder: '12345 or 12345-6789',
          helperText: 'Format: 12345 or 12345-6789',
          validation: [
            { type: 'required' },
            {
              type: 'pattern',
              value: '^\\d{5}(-\\d{4})?$',
              message: 'Please enter a valid US zip code',
            },
          ],
        },
        {
          id: 'phone',
          type: 'text',
          label: 'Phone Number',
          placeholder: '(123) 456-7890',
          inputType: 'tel',
          validation: [
            { type: 'phone', message: 'Please enter a valid phone number' },
          ],
        },
        {
          id: 'website',
          type: 'text',
          label: 'Website URL',
          placeholder: 'https://example.com',
          helperText: 'Must start with http:// or https://',
          validation: [
            { type: 'url', message: 'Please enter a valid URL' },
          ],
        },
      ],
    },
  ],
};

export const PatternValidation: Story = {
  args: {
    schema: patternSchema,
    onSubmit: (values: FormValues) => console.log('Submitted:', values),
  },
};

// ============= ALL VALIDATORS =============

const allValidatorsSchema: FormSchema = {
  id: 'all-validators',
  version: '1.0',
  title: 'All Built-in Validators',
  description: 'Showcases all available validation rules.',
  sections: [
    {
      id: 'text',
      title: 'Text Validations',
      fields: [
        {
          id: 'required_text',
          type: 'text',
          label: 'Required Text',
          validation: [{ type: 'required' }],
        },
        {
          id: 'min_length',
          type: 'text',
          label: 'Min Length (5)',
          validation: [{ type: 'minLength', value: 5 }],
        },
        {
          id: 'max_length',
          type: 'text',
          label: 'Max Length (10)',
          validation: [{ type: 'maxLength', value: 10 }],
        },
        {
          id: 'email_field',
          type: 'text',
          label: 'Email',
          inputType: 'email',
          validation: [{ type: 'email' }],
        },
        {
          id: 'url_field',
          type: 'text',
          label: 'URL',
          validation: [{ type: 'url' }],
        },
        {
          id: 'phone_field',
          type: 'text',
          label: 'Phone',
          inputType: 'tel',
          validation: [{ type: 'phone' }],
        },
      ],
    },
    {
      id: 'number',
      title: 'Number Validations',
      fields: [
        {
          id: 'min_number',
          type: 'number',
          label: 'Min Value (10)',
          validation: [{ type: 'min', value: 10 }],
        },
        {
          id: 'max_number',
          type: 'number',
          label: 'Max Value (100)',
          validation: [{ type: 'max', value: 100 }],
        },
      ],
    },
  ],
};

export const AllValidators: Story = {
  args: {
    schema: allValidatorsSchema,
    onSubmit: (values: FormValues) => console.log('Submitted:', values),
  },
};

// ============================================================================
// STORY 3 — AsyncUsernameCheck: Async validation demo
// ============================================================================

import React from 'react';
import { waitFor } from '@storybook/test';

/**
 * Async validation demo component.
 * Shows loading, success, and error states for username validation.
 */
const AsyncUsernameValidationDemo = () => {
  const [username, setUsername] = React.useState('');
  const [validationState, setValidationState] = React.useState<
    'idle' | 'checking' | 'valid' | 'invalid'
  >('idle');
  const [errorMessage, setErrorMessage] = React.useState('');
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Simulated async validation function
  const checkUsernameAvailability = async (value: string): Promise<{ valid: boolean; message: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Reserved usernames
    const takenUsernames = ['admin', 'root', 'administrator', 'test'];
    
    if (takenUsernames.includes(value.toLowerCase())) {
      return { valid: false, message: `Username "${value}" is already taken` };
    }
    
    if (value.length < 3) {
      return { valid: false, message: 'Username must be at least 3 characters' };
    }
    
    return { valid: true, message: 'Username is available!' };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (!value.trim()) {
      setValidationState('idle');
      setErrorMessage('');
      return;
    }
    
    // Debounce the validation
    debounceRef.current = setTimeout(async () => {
      setValidationState('checking');
      setErrorMessage('');
      
      const result = await checkUsernameAvailability(value);
      
      if (result.valid) {
        setValidationState('valid');
        setErrorMessage('');
      } else {
        setValidationState('invalid');
        setErrorMessage(result.message);
      }
    }, 300);
  };

  const handleBlur = async () => {
    if (!username.trim()) return;
    
    // Clear debounce and validate immediately on blur
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    setValidationState('checking');
    setErrorMessage('');
    
    const result = await checkUsernameAvailability(username);
    
    if (result.valid) {
      setValidationState('valid');
      setErrorMessage('');
    } else {
      setValidationState('invalid');
      setErrorMessage(result.message);
    }
  };

  const getInputClassName = () => {
    const base = 'w-full p-3 border rounded-md focus:outline-none focus:ring-2';
    switch (validationState) {
      case 'invalid':
        return `${base} border-red-500 focus:ring-red-500`;
      case 'valid':
        return `${base} border-green-500 focus:ring-green-500`;
      default:
        return `${base} border-gray-300 focus:ring-blue-500`;
    }
  };

  return (
    <div className="p-6 max-w-md">
      <h2 className="text-xl font-semibold mb-4">Async Username Validation</h2>
      <p className="text-gray-600 mb-6">
        Try usernames: <code className="bg-gray-100 px-1 rounded">admin</code> (taken) or{' '}
        <code className="bg-gray-100 px-1 rounded">john123</code> (available)
      </p>
      
      <div className="mb-4">
        <label 
          htmlFor="username" 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Username <span className="text-red-500">*</span>
        </label>
        
        <div className="relative">
          <input
            id="username"
            type="text"
            value={username}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter a username"
            className={getInputClassName()}
            aria-invalid={validationState === 'invalid' ? 'true' : 'false'}
            aria-describedby={
              validationState === 'checking' ? 'username-checking' :
              validationState === 'invalid' ? 'username-error' :
              validationState === 'valid' ? 'username-success' :
              undefined
            }
            data-testid="username-input"
          />
          
          {/* Loading indicator */}
          {validationState === 'checking' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg 
                className="animate-spin h-5 w-5 text-blue-600" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" cy="12" r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          )}
          
          {/* Valid indicator */}
          {validationState === 'valid' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg 
                className="h-5 w-5 text-green-600" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
          )}
          
          {/* Invalid indicator */}
          {validationState === 'invalid' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg 
                className="h-5 w-5 text-red-600" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
          )}
        </div>
        
        {/* Status messages */}
        {validationState === 'checking' && (
          <p 
            id="username-checking" 
            className="mt-1 text-sm text-blue-600 flex items-center gap-1"
            role="status"
            aria-live="polite"
            data-testid="checking-message"
          >
            Checking availability...
          </p>
        )}
        
        {validationState === 'invalid' && (
          <p 
            id="username-error" 
            className="mt-1 text-sm text-red-600"
            role="alert"
            aria-live="polite"
            data-testid="error-message"
          >
            {errorMessage}
          </p>
        )}
        
        {validationState === 'valid' && (
          <p 
            id="username-success" 
            className="mt-1 text-sm text-green-600"
            aria-live="polite"
            data-testid="success-message"
          >
            ✓ Username is available!
          </p>
        )}
      </div>
      
      <button
        type="submit"
        disabled={validationState !== 'valid'}
        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
          validationState === 'valid'
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Create Account
      </button>
    </div>
  );
};

export const AsyncUsernameCheck: Story = {
  render: () => <AsyncUsernameValidationDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Run initial accessibility check
    await runAxeAccessibilityCheck(canvasElement);
    
    // Wait for form to render and get username input
    const usernameInput = await waitFor(() => {
      return canvas.getByTestId('username-input');
    }, { timeout: 5000 });
    
    // --- Test 1: Check "admin" (taken username) ---
    await userEvent.type(usernameInput, 'admin');
    
    // Should show "Checking availability..."
    await waitFor(() => {
      const checkingMessage = canvas.getByTestId('checking-message');
      expect(checkingMessage).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Wait for validation to complete
    await waitFor(() => {
      const errorMessage = canvas.getByTestId('error-message');
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Verify error message content
    await expect(canvas.getByText(/already taken/i)).toBeInTheDocument();
    
    // Verify aria-invalid is set
    await expect(usernameInput).toHaveAttribute('aria-invalid', 'true');
    
    // Verify role="alert" for screen reader
    const alertElement = canvas.getByRole('alert');
    await expect(alertElement).toBeInTheDocument();
    
    // --- Test 2: Clear and try "john123" (available) ---
    await userEvent.clear(usernameInput);
    await userEvent.type(usernameInput, 'john123');
    
    // Should show checking state
    await waitFor(() => {
      const checkingMessage = canvas.getByTestId('checking-message');
      expect(checkingMessage).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Wait for success state
    await waitFor(() => {
      const successMessage = canvas.getByTestId('success-message');
      expect(successMessage).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Verify success message
    await expect(canvas.getByText(/username is available/i)).toBeInTheDocument();
    
    // Verify aria-invalid is NOT set (should be false or removed)
    await expect(usernameInput).toHaveAttribute('aria-invalid', 'false');
    
    // Submit button should be enabled
    const submitButton = canvas.getByRole('button', { name: /create account/i });
    await expect(submitButton).not.toBeDisabled();
    
    // Final accessibility check
    await runAxeAccessibilityCheck(canvasElement);
  },
  parameters: {
    docs: {
      description: {
        story: `
**UZENCE PROOF: Async Field Validation**

This story explicitly demonstrates:

1. **Debounced Validation**: Triggers after 300ms pause in typing
2. **Loading State**: "Checking availability..." with spinner
3. **Error State**: "Username is already taken" with aria-invalid="true"
4. **Success State**: "✓ Username is available!" with green check
5. **Accessibility**: 
   - aria-invalid updates correctly
   - role="alert" for error announcements
   - aria-describedby links to status messages

**Test Scenarios:**
- \`admin\` → Shows error (username taken)
- \`john123\` → Shows success (available)

**What Chromatic Will Capture:**
- Loading spinner during check
- Error state with red border
- Success state with green border
        `,
      },
    },
  },
};
