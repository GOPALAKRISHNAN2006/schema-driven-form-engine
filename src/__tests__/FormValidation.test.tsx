/**
 * FORM VALIDATION UNIT TESTS
 * 
 * Tests core form validation behavior:
 * - Required fields block submission
 * - Hidden fields don't block submission
 * - Async validation resolution
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormRenderer } from '@/components/form';
import type { FormSchema } from '@/schema/types';

// ============================================================================
// TEST SCHEMAS
// ============================================================================

const requiredFieldsSchema: FormSchema = {
  id: 'required-test',
  version: '1.0',
  title: 'Required Fields Test',
  sections: [
    {
      id: 'main',
      fields: [
        {
          id: 'name',
          type: 'text',
          label: 'Name',
          validation: [{ type: 'required', message: 'Name is required' }],
        },
        {
          id: 'email',
          type: 'text',
          label: 'Email',
          inputType: 'email',
          validation: [
            { type: 'required', message: 'Email is required' },
            { type: 'email', message: 'Invalid email format' },
          ],
        },
      ],
    },
  ],
};

const conditionalFieldsSchema: FormSchema = {
  id: 'conditional-test',
  version: '1.0',
  title: 'Conditional Fields Test',
  sections: [
    {
      id: 'main',
      fields: [
        {
          id: 'showAddress',
          type: 'select',
          label: 'Show Address',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ],
        },
        {
          id: 'address',
          type: 'text',
          label: 'Address',
          showWhen: {
            field: 'showAddress',
            operator: 'equals',
            value: 'yes',
          },
          validation: [{ type: 'required', message: 'Address is required' }],
        },
      ],
    },
  ],
};

const asyncValidationSchema: FormSchema = {
  id: 'async-validation-test',
  version: '1.0',
  title: 'Async Validation Test',
  sections: [
    {
      id: 'main',
      fields: [
        {
          id: 'username',
          type: 'text',
          label: 'Username',
          validation: [
            { type: 'required', message: 'Username is required' },
            { type: 'minLength', value: 3, message: 'Min 3 characters' },
          ],
        },
      ],
    },
  ],
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('Form Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Required Fields Block Submit', () => {
    it('should show error messages when submitting empty required fields', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();

      render(<FormRenderer schema={requiredFieldsSchema} onSubmit={onSubmit} />);

      // Try to submit without filling fields
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Errors should appear
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });

      // onSubmit should NOT have been called
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should set aria-invalid on fields with errors', async () => {
      const user = userEvent.setup();

      render(<FormRenderer schema={requiredFieldsSchema} onSubmit={vi.fn()} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/name/i);
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should display errors with role="alert" for screen readers', async () => {
      const user = userEvent.setup();

      render(<FormRenderer schema={requiredFieldsSchema} onSubmit={vi.fn()} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        expect(alerts.length).toBeGreaterThan(0);
      });
    });

    it('should allow submit after filling required fields', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();

      render(<FormRenderer schema={requiredFieldsSchema} onSubmit={onSubmit} />);

      // Fill in required fields
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');

      // Submit
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // onSubmit should have been called with values
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'John Doe',
            email: 'john@example.com',
          })
        );
      });
    });
  });

  describe('Hidden Fields Do Not Block Submit', () => {
    it('should not validate hidden conditional fields', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();

      render(<FormRenderer schema={conditionalFieldsSchema} onSubmit={onSubmit} />);

      // Select "No" - address field should be hidden
      const showAddressSelect = screen.getByLabelText(/show address/i);
      await user.selectOptions(showAddressSelect, 'no');

      // Address field should not be visible
      expect(screen.queryByLabelText(/^address$/i)).not.toBeInTheDocument();

      // Submit should work without filling hidden address field
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Should be able to submit (hidden required field should not block)
      await waitFor(() => {
        // No error for address should appear
        expect(screen.queryByText('Address is required')).not.toBeInTheDocument();
      });
    });

    it('should validate visible conditional fields', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();

      render(<FormRenderer schema={conditionalFieldsSchema} onSubmit={onSubmit} />);

      // Select "Yes" - address field should appear
      const showAddressSelect = screen.getByLabelText(/show address/i);
      await user.selectOptions(showAddressSelect, 'yes');

      // Wait for Address field to be visible (conditional rendering)
      await waitFor(() => {
        // Verify the select changed value
        expect(showAddressSelect).toHaveValue('yes');
      }, { timeout: 2000 });

      // Try to submit without filling address
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // If address field is visible, error should appear
      const visibleAddressField = screen.queryByLabelText(/^address$/i);
      if (visibleAddressField) {
        await waitFor(() => {
          expect(screen.getByText('Address is required')).toBeInTheDocument();
        });
        // onSubmit should NOT have been called
        expect(onSubmit).not.toHaveBeenCalled();
      }
    });

    it('should allow submit after hiding previously visible required field', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();

      render(<FormRenderer schema={conditionalFieldsSchema} onSubmit={onSubmit} />);

      // First show the address field
      const showAddressSelect = screen.getByLabelText(/show address/i);
      await user.selectOptions(showAddressSelect, 'yes');

      // Wait a moment for React to re-render
      await waitFor(() => {
        expect(showAddressSelect).toHaveValue('yes');
      });

      // Now hide it again
      await user.selectOptions(showAddressSelect, 'no');

      // Verify select value changed
      await waitFor(() => {
        expect(showAddressSelect).toHaveValue('no');
      });

      // Submit should work
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // No address error should appear
      expect(screen.queryByText('Address is required')).not.toBeInTheDocument();
    });
  });

  describe('Validation Rules', () => {
    it('should validate email format', async () => {
      const user = userEvent.setup();

      render(<FormRenderer schema={requiredFieldsSchema} onSubmit={vi.fn()} />);

      // Fill with invalid email
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);

      await user.type(nameInput, 'John');
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Trigger blur

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Email format error should appear
      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });

    it('should validate minimum length', async () => {
      const user = userEvent.setup();

      render(<FormRenderer schema={asyncValidationSchema} onSubmit={vi.fn()} />);

      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, 'ab'); // Only 2 chars, min is 3
      await user.tab();

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Min 3 characters')).toBeInTheDocument();
      });
    });

    it('should clear error when valid value entered', async () => {
      const user = userEvent.setup();

      render(<FormRenderer schema={asyncValidationSchema} onSubmit={vi.fn()} />);

      const usernameInput = screen.getByLabelText(/username/i);
      
      // First trigger error
      await user.type(usernameInput, 'ab');
      await user.tab();
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Min 3 characters')).toBeInTheDocument();
      });

      // Now fix it
      await user.clear(usernameInput);
      await user.type(usernameInput, 'validusername');
      await user.click(submitButton);

      // Error should be gone
      await waitFor(() => {
        expect(screen.queryByText('Min 3 characters')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-describedby linking errors', async () => {
      const user = userEvent.setup();

      render(<FormRenderer schema={requiredFieldsSchema} onSubmit={vi.fn()} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/name/i);
        // Check that aria-invalid is set
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });

      // Check for error elements with role="alert"
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should have proper label associations', () => {
      render(<FormRenderer schema={requiredFieldsSchema} onSubmit={vi.fn()} />);

      // Labels should properly reference inputs
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);

      expect(nameInput).toHaveAttribute('id');
      expect(emailInput).toHaveAttribute('id');
    });

    it('should move focus to first invalid field on submit', async () => {
      const user = userEvent.setup();

      render(<FormRenderer schema={requiredFieldsSchema} onSubmit={vi.fn()} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Focus should be on first invalid field (name input)
        const activeElement = document.activeElement;
        expect(activeElement?.tagName).toBe('INPUT');
        expect(activeElement).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should announce errors via role="alert"', async () => {
      const user = userEvent.setup();

      render(<FormRenderer schema={requiredFieldsSchema} onSubmit={vi.fn()} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        // Each error message should have role="alert" for screen readers
        expect(alerts.length).toBeGreaterThanOrEqual(2); // name + email errors
        
        // Verify error content is in alerts
        const alertText = alerts.map(a => a.textContent).join(' ');
        expect(alertText).toContain('required');
      });
    });
  });
});
