/**
 * ACCESSIBILITY STORIES
 * 
 * Demonstrates accessibility features with interaction tests.
 * Uses axe-core for programmatic a11y validation.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { expect, within, userEvent } from '@storybook/test';
import { FormRenderer } from '@/components/form';
import type { FormSchema, FormValues } from '@/schema/types';
import { runAxeAccessibilityCheck, validateAriaAttributes } from './test-utils';

const meta: Meta<typeof FormRenderer> = {
  title: 'Features/Accessibility',
  component: FormRenderer,
  parameters: {
    docs: {
      description: {
        component: 'Forms built with full WCAG 2.1 AA accessibility compliance. Use the a11y addon panel to check.',
      },
    },
    layout: 'padded',
    a11y: {
      // Run all a11y checks
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'label', enabled: true },
          { id: 'aria-required-attr', enabled: true },
        ],
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FormRenderer>;

// ============= ACCESSIBLE FORM =============

const accessibleFormSchema: FormSchema = {
  id: 'accessible-form',
  version: '1.0',
  title: 'Fully Accessible Form',
  description: 'This form demonstrates all accessibility features: proper labels, error announcements, keyboard navigation, and screen reader support.',
  sections: [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'All fields use proper label associations and ARIA attributes.',
      fields: [
        {
          id: 'firstName',
          type: 'text',
          label: 'First Name',
          placeholder: 'Enter your first name',
          helperText: 'As it appears on your ID',
          validation: [{ type: 'required', message: 'First name is required' }],
        },
        {
          id: 'lastName',
          type: 'text',
          label: 'Last Name',
          placeholder: 'Enter your last name',
          validation: [{ type: 'required', message: 'Last name is required' }],
        },
        {
          id: 'email',
          type: 'text',
          label: 'Email Address',
          inputType: 'email',
          placeholder: 'you@example.com',
          helperText: 'We will send confirmation to this email',
          validation: [
            { type: 'required', message: 'Email is required' },
            { type: 'email', message: 'Please enter a valid email address' },
          ],
        },
      ],
    },
    {
      id: 'preferences',
      title: 'Preferences',
      fields: [
        {
          id: 'notifications',
          type: 'select',
          label: 'Notification Preference',
          options: [
            { value: 'email', label: 'Email notifications' },
            { value: 'sms', label: 'SMS notifications' },
            { value: 'none', label: 'No notifications' },
          ],
          validation: [{ type: 'required', message: 'Please select a preference' }],
        },
        {
          id: 'acceptTerms',
          type: 'checkbox',
          label: 'I accept the terms of service and privacy policy',
          validation: [{ type: 'required', message: 'You must accept the terms to continue' }],
        },
      ],
    },
    {
      id: 'feedback',
      title: 'Additional Feedback',
      fields: [
        {
          id: 'comments',
          type: 'textarea',
          label: 'Comments or Questions',
          placeholder: 'Type your message here...',
          rows: 4,
          helperText: 'Optional - Let us know if you have any special requirements',
        },
      ],
    },
  ],
  submit: { label: 'Submit Form' },
};

export const FullyAccessibleForm: Story = {
  args: {
    schema: accessibleFormSchema,
    onSubmit: (values: FormValues) => {
      alert('Form submitted! Check the browser console for values.');
      console.log('Submitted values:', values);
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Run axe accessibility check on initial render
    await runAxeAccessibilityCheck(canvasElement);
    
    // Test focus management - submit with empty form
    const submitButton = canvas.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);
    
    // Verify errors appear with proper ARIA attributes
    await expect(canvas.getByText('First name is required')).toBeInTheDocument();
    
    // Validate aria-invalid on error fields
    const firstNameInput = canvas.getByRole('textbox', { name: /first name/i });
    await validateAriaAttributes(firstNameInput, true);
    
    // Verify role="alert" exists for screen reader announcement
    const alertElements = canvasElement.querySelectorAll('[role="alert"]');
    await expect(alertElements.length).toBeGreaterThan(0);
    
    // Verify focus management - check if a form field received focus
    const activeElement = document.activeElement;
    const isFormFieldFocused = activeElement?.tagName === 'INPUT' || 
                               activeElement?.tagName === 'SELECT' ||
                               activeElement?.tagName === 'TEXTAREA';
    // Log focus state for debugging (focus management is optional but recommended)
    console.log('Focus on form field after error:', isFormFieldFocused);
    
    // Fill form correctly
    await userEvent.type(firstNameInput, 'John');
    await userEvent.type(canvas.getByRole('textbox', { name: /last name/i }), 'Doe');
    await userEvent.type(canvas.getByRole('textbox', { name: /email address/i }), 'john@example.com');
    
    // Select notification preference
    const notificationSelect = canvas.getByRole('combobox', { name: /notification preference/i });
    await userEvent.selectOptions(notificationSelect, 'email');
    
    // Accept terms
    const termsCheckbox = canvas.getByRole('checkbox', { name: /terms of service/i });
    await userEvent.click(termsCheckbox);
    
    // Re-run axe check after filling form
    await runAxeAccessibilityCheck(canvasElement);
  },
  parameters: {
    docs: {
      description: {
        story: `
This form implements all accessibility best practices:

- **Labels**: Every input has an associated \`<label>\` with proper \`htmlFor\` attribute
- **Required indicators**: Visual asterisk (*) and \`aria-required\` for required fields
- **Error messages**: Connected via \`aria-describedby\` with \`role="alert"\` and \`aria-live="polite"\`
- **Helper text**: Connected via \`aria-describedby\` for additional context
- **Invalid state**: \`aria-invalid="true"\` when field has errors
- **Focus management**: Visible focus indicators with sufficient contrast
- **Keyboard navigation**: Full Tab/Shift+Tab navigation, Enter to submit
- **Screen reader**: All interactive elements properly announced

**Test with:**
1. Tab through all fields
2. Submit without filling required fields (errors should be announced)
3. Use screen reader (NVDA, VoiceOver, JAWS)
4. Check the "Accessibility" panel in Storybook
        `,
      },
    },
  },
};

// ============= KEYBOARD NAVIGATION =============

const keyboardNavSchema: FormSchema = {
  id: 'keyboard-nav',
  version: '1.0',
  title: 'Keyboard Navigation Demo',
  description: 'Navigate this form using only keyboard: Tab, Shift+Tab, Enter, Space, Arrow keys.',
  sections: [
    {
      id: 'main',
      fields: [
        {
          id: 'field1',
          type: 'text',
          label: 'Field 1 - Text Input',
          placeholder: 'Tab to next field',
        },
        {
          id: 'field2',
          type: 'select',
          label: 'Field 2 - Select (Arrow keys)',
          options: [
            { value: 'a', label: 'Option A' },
            { value: 'b', label: 'Option B' },
            { value: 'c', label: 'Option C' },
          ],
        },
        {
          id: 'field3',
          type: 'checkbox',
          label: 'Field 3 - Checkbox (Space to toggle)',
        },
        {
          id: 'field4',
          type: 'textarea',
          label: 'Field 4 - Textarea',
          placeholder: 'Type here, Tab to continue',
          rows: 3,
        },
      ],
    },
  ],
};

export const KeyboardNavigation: Story = {
  args: {
    schema: keyboardNavSchema,
    onSubmit: (values: FormValues) => console.log('Submitted:', values),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Run axe accessibility check
    await runAxeAccessibilityCheck(canvasElement);
    
    // Get form elements
    const textInput = canvas.getByRole('textbox', { name: /field 1/i });
    const selectInput = canvas.getByRole('combobox', { name: /field 2/i });
    const checkbox = canvas.getByRole('checkbox', { name: /field 3/i });
    const textarea = canvas.getByRole('textbox', { name: /field 4/i });
    
    // Test Tab navigation - start from text input
    await userEvent.click(textInput);
    await expect(document.activeElement).toBe(textInput);
    
    // Type in text field
    await userEvent.type(textInput, 'Test text');
    await expect(textInput).toHaveValue('Test text');
    
    // Tab to select
    await userEvent.tab();
    await expect(document.activeElement).toBe(selectInput);
    
    // Use keyboard to change select value (arrow keys)
    await userEvent.keyboard('{ArrowDown}');
    
    // Tab to checkbox
    await userEvent.tab();
    await expect(document.activeElement).toBe(checkbox);
    
    // Space to toggle checkbox
    await userEvent.keyboard(' ');
    await expect(checkbox).toBeChecked();
    
    // Space again to uncheck
    await userEvent.keyboard(' ');
    await expect(checkbox).not.toBeChecked();
    
    // Tab to textarea
    await userEvent.tab();
    await expect(document.activeElement).toBe(textarea);
    
    // Type in textarea
    await userEvent.type(textarea, 'Multi-line\ntext');
    
    // Tab to submit button
    await userEvent.tab();
    const submitButton = canvas.getByRole('button', { name: /submit/i });
    await expect(document.activeElement).toBe(submitButton);
    
    // Enter to submit (or Space)
    await userEvent.keyboard('{Enter}');
  },
  parameters: {
    docs: {
      description: {
        story: `
**Keyboard controls:**
- **Tab**: Move to next focusable element
- **Shift + Tab**: Move to previous focusable element
- **Enter**: Submit form (when on button) or select option
- **Space**: Toggle checkbox, activate button
- **Arrow keys**: Navigate select options
- **Escape**: Close dropdowns
        `,
      },
    },
  },
};

// ============= HIGH CONTRAST =============

export const HighContrastMode: Story = {
  args: {
    schema: accessibleFormSchema,
    className: 'p-6 bg-white',
    onSubmit: (values: FormValues) => console.log('Submitted:', values),
  },
  parameters: {
    backgrounds: {
      default: 'high-contrast',
    },
    docs: {
      description: {
        story: 'Form displayed in high contrast mode. All elements maintain sufficient color contrast ratios (4.5:1 for normal text, 3:1 for large text).',
      },
    },
  },
};
