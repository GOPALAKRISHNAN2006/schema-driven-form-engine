/**
 * CONDITIONAL VISIBILITY STORIES
 * 
 * Demonstrates conditional field rendering with interaction tests.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { expect, within, userEvent } from '@storybook/test';
import { FormRenderer } from '@/components/form';
import type { FormSchema, FormValues } from '@/schema/types';
import { runAxeAccessibilityCheck } from './test-utils';

const meta: Meta<typeof FormRenderer> = {
  title: 'Features/ConditionalFields',
  component: FormRenderer,
  parameters: {
    docs: {
      description: {
        component: 'Demonstrates conditional field visibility based on form values.',
      },
    },
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FormRenderer>;

// ============= SIMPLE CONDITION =============

const simpleConditionSchema: FormSchema = {
  id: 'simple-condition',
  version: '1.0',
  title: 'Simple Condition Example',
  description: 'Select "Yes" to reveal additional fields.',
  sections: [
    {
      id: 'main',
      fields: [
        {
          id: 'hasAddress',
          type: 'select',
          label: 'Do you have a shipping address?',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ],
        },
        {
          id: 'street',
          type: 'text',
          label: 'Street Address',
          placeholder: '123 Main St',
          showWhen: {
            field: 'hasAddress',
            operator: 'equals',
            value: 'yes',
          },
          validation: [{ type: 'required' }],
        },
        {
          id: 'city',
          type: 'text',
          label: 'City',
          placeholder: 'New York',
          showWhen: {
            field: 'hasAddress',
            operator: 'equals',
            value: 'yes',
          },
          validation: [{ type: 'required' }],
        },
      ],
    },
  ],
};

export const SimpleCondition: Story = {
  args: {
    schema: simpleConditionSchema,
    onSubmit: (values: FormValues) => console.log('Submitted:', values),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Run axe accessibility check
    await runAxeAccessibilityCheck(canvasElement);
    
    // Initially, conditional fields should NOT be visible
    await expect(canvas.queryByLabelText(/street address/i)).not.toBeInTheDocument();
    await expect(canvas.queryByLabelText(/city/i)).not.toBeInTheDocument();
    
    // Select "Yes" to show conditional fields
    const selectField = canvas.getByLabelText(/do you have a shipping address/i);
    await userEvent.selectOptions(selectField, 'yes');
    
    // Now fields should be visible
    await expect(canvas.getByLabelText(/street address/i)).toBeInTheDocument();
    await expect(canvas.getByLabelText(/city/i)).toBeInTheDocument();
    
    // Test that hidden fields don't block submission
    // Select "No" to hide fields again
    await userEvent.selectOptions(selectField, 'no');
    
    // Fields should be hidden
    await expect(canvas.queryByLabelText(/street address/i)).not.toBeInTheDocument();
    
    // Submit should work even though hidden required fields exist
    const submitButton = canvas.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);
    
    // No errors should appear for hidden fields
    await expect(canvas.queryByText(/street.*required/i)).not.toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story: 'Street and City fields appear when "Yes" is selected.',
      },
    },
  },
};

// ============= AND CONDITION =============

const andConditionSchema: FormSchema = {
  id: 'and-condition',
  version: '1.0',
  title: 'AND Condition Example',
  description: 'Both conditions must be true to reveal the field.',
  sections: [
    {
      id: 'main',
      fields: [
        {
          id: 'isEmployee',
          type: 'checkbox',
          label: 'I am an employee',
        },
        {
          id: 'hasComputer',
          type: 'checkbox',
          label: 'I need a company computer',
        },
        {
          id: 'computerType',
          type: 'select',
          label: 'Preferred Computer Type',
          options: [
            { value: 'mac', label: 'MacBook Pro' },
            { value: 'windows', label: 'Windows Laptop' },
            { value: 'linux', label: 'Linux Workstation' },
          ],
          showWhen: {
            and: [
              { field: 'isEmployee', operator: 'equals', value: true },
              { field: 'hasComputer', operator: 'equals', value: true },
            ],
          },
        },
      ],
    },
  ],
};

export const AndCondition: Story = {
  args: {
    schema: andConditionSchema,
    onSubmit: (values: FormValues) => console.log('Submitted:', values),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Run axe accessibility check
    await runAxeAccessibilityCheck(canvasElement);
    
    // Computer type should NOT be visible initially
    await expect(canvas.queryByLabelText(/preferred computer type/i)).not.toBeInTheDocument();
    
    // Check only first checkbox - computer type should still be hidden
    const isEmployeeCheckbox = canvas.getByLabelText(/i am an employee/i);
    await userEvent.click(isEmployeeCheckbox);
    await expect(canvas.queryByLabelText(/preferred computer type/i)).not.toBeInTheDocument();
    
    // Check second checkbox - NOW computer type should appear (AND condition met)
    const hasComputerCheckbox = canvas.getByLabelText(/i need a company computer/i);
    await userEvent.click(hasComputerCheckbox);
    
    // Both conditions met - field should appear
    await expect(canvas.getByLabelText(/preferred computer type/i)).toBeInTheDocument();
    
    // Uncheck one - field should disappear
    await userEvent.click(isEmployeeCheckbox);
    await expect(canvas.queryByLabelText(/preferred computer type/i)).not.toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story: 'Computer type selector appears only when BOTH checkboxes are checked.',
      },
    },
  },
};

// ============= OR CONDITION =============

const orConditionSchema: FormSchema = {
  id: 'or-condition',
  version: '1.0',
  title: 'OR Condition Example',
  description: 'Either condition can reveal the field.',
  sections: [
    {
      id: 'main',
      fields: [
        {
          id: 'needsSupport',
          type: 'checkbox',
          label: 'I need technical support',
        },
        {
          id: 'hasQuestion',
          type: 'checkbox',
          label: 'I have a question',
        },
        {
          id: 'message',
          type: 'textarea',
          label: 'Your Message',
          placeholder: 'How can we help?',
          showWhen: {
            or: [
              { field: 'needsSupport', operator: 'equals', value: true },
              { field: 'hasQuestion', operator: 'equals', value: true },
            ],
          },
        },
      ],
    },
  ],
};

export const OrCondition: Story = {
  args: {
    schema: orConditionSchema,
    onSubmit: (values: FormValues) => console.log('Submitted:', values),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Run axe accessibility check
    await runAxeAccessibilityCheck(canvasElement);
    
    // Message field should NOT be visible initially
    await expect(canvas.queryByLabelText(/your message/i)).not.toBeInTheDocument();
    
    // Check first checkbox - message should appear (OR condition)
    const needsSupportCheckbox = canvas.getByLabelText(/i need technical support/i);
    await userEvent.click(needsSupportCheckbox);
    await expect(canvas.getByLabelText(/your message/i)).toBeInTheDocument();
    
    // Uncheck first, check second - should still be visible
    await userEvent.click(needsSupportCheckbox);
    await expect(canvas.queryByLabelText(/your message/i)).not.toBeInTheDocument();
    
    const hasQuestionCheckbox = canvas.getByLabelText(/i have a question/i);
    await userEvent.click(hasQuestionCheckbox);
    await expect(canvas.getByLabelText(/your message/i)).toBeInTheDocument();
    
    // Both checked - still visible
    await userEvent.click(needsSupportCheckbox);
    await expect(canvas.getByLabelText(/your message/i)).toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story: 'Message field appears when EITHER checkbox is checked.',
      },
    },
  },
};

// ============= NOT CONDITION =============

const notConditionSchema: FormSchema = {
  id: 'not-condition',
  version: '1.0',
  title: 'NOT Condition Example',
  description: 'Field appears when condition is NOT met.',
  sections: [
    {
      id: 'main',
      fields: [
        {
          id: 'isExistingCustomer',
          type: 'checkbox',
          label: 'I am an existing customer',
        },
        {
          id: 'referralCode',
          type: 'text',
          label: 'Referral Code',
          placeholder: 'Enter referral code',
          helperText: 'New customers can use a referral code for 10% off',
          showWhen: {
            not: {
              field: 'isExistingCustomer',
              operator: 'equals',
              value: true,
            },
          },
        },
      ],
    },
  ],
};

export const NotCondition: Story = {
  args: {
    schema: notConditionSchema,
    onSubmit: (values: FormValues) => console.log('Submitted:', values),
  },
  parameters: {
    docs: {
      description: {
        story: 'Referral code field appears when the checkbox is NOT checked.',
      },
    },
  },
};

// ============= COMPLEX NESTED CONDITION =============

const complexConditionSchema: FormSchema = {
  id: 'complex-condition',
  version: '1.0',
  title: 'Complex Nested Conditions',
  description: 'Combines AND, OR, and NOT conditions.',
  sections: [
    {
      id: 'main',
      fields: [
        {
          id: 'accountType',
          type: 'select',
          label: 'Account Type',
          options: [
            { value: 'personal', label: 'Personal' },
            { value: 'business', label: 'Business' },
            { value: 'enterprise', label: 'Enterprise' },
          ],
        },
        {
          id: 'employees',
          type: 'number',
          label: 'Number of Employees',
          showWhen: {
            or: [
              { field: 'accountType', operator: 'equals', value: 'business' },
              { field: 'accountType', operator: 'equals', value: 'enterprise' },
            ],
          },
        },
        {
          id: 'needsEnterprisePlan',
          type: 'checkbox',
          label: 'I need enterprise features',
          showWhen: {
            and: [
              { field: 'accountType', operator: 'equals', value: 'business' },
              { field: 'employees', operator: 'greaterThan', value: 50 },
            ],
          },
        },
        {
          id: 'enterpriseContact',
          type: 'text',
          label: 'Enterprise Sales Contact Email',
          inputType: 'email',
          showWhen: {
            or: [
              { field: 'accountType', operator: 'equals', value: 'enterprise' },
              {
                and: [
                  { field: 'accountType', operator: 'equals', value: 'business' },
                  { field: 'needsEnterprisePlan', operator: 'equals', value: true },
                ],
              },
            ],
          },
        },
      ],
    },
  ],
};

export const ComplexNestedConditions: Story = {
  args: {
    schema: complexConditionSchema,
    onSubmit: (values: FormValues) => console.log('Submitted:', values),
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates complex nested conditional logic with multiple levels of AND/OR.',
      },
    },
  },
};
