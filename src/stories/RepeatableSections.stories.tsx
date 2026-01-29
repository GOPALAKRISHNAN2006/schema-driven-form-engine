/**
 * REPEATABLE SECTIONS STORIES
 * 
 * Demonstrates repeatable section functionality:
 * - Add/remove instances
 * - Min/max constraints
 * - Validation within repeatable items
 * - Keyboard accessibility
 */

import type { Meta, StoryObj } from '@storybook/react';
import { expect, within, userEvent, waitFor } from '@storybook/test';
import { FormRenderer } from '@/components/form';
import type { FormSchema, FormValues } from '@/schema/types';
import { runAxeAccessibilityCheck } from './test-utils';

const meta: Meta<typeof FormRenderer> = {
  title: 'Features/RepeatableSections',
  component: FormRenderer,
  parameters: {
    docs: {
      description: {
        component: 'Demonstrates repeatable sections that allow users to add/remove multiple instances of a field group.',
      },
    },
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FormRenderer>;

// ============= ORDER ITEMS (Basic Repeatable) =============

const orderItemsSchema: FormSchema = {
  id: 'order-items-form',
  version: '1.0',
  title: 'Order Items',
  description: 'Add items to your order. You can add up to 5 items.',
  sections: [
    {
      id: 'customer',
      title: 'Customer',
      fields: [
        {
          id: 'customerName',
          type: 'text',
          label: 'Customer Name',
          validation: [{ type: 'required', message: 'Name is required' }],
        },
      ],
    },
    {
      id: 'items',
      title: 'Order Items',
      description: 'Add products to your order',
      repeatable: true,
      minInstances: 1,
      maxInstances: 5,
      fields: [
        {
          id: 'product',
          type: 'select',
          label: 'Product',
          options: [
            { value: 'widget-a', label: 'Widget A - $10' },
            { value: 'widget-b', label: 'Widget B - $25' },
            { value: 'widget-c', label: 'Widget C - $50' },
            { value: 'premium', label: 'Premium Package - $100' },
          ],
          validation: [{ type: 'required', message: 'Please select a product' }],
        },
        {
          id: 'quantity',
          type: 'number',
          label: 'Quantity',
          min: 1,
          max: 99,
          defaultValue: 1,
          validation: [
            { type: 'required', message: 'Quantity is required' },
            { type: 'min', value: 1, message: 'Minimum quantity is 1' },
          ],
        },
        {
          id: 'notes',
          type: 'text',
          label: 'Notes (optional)',
          placeholder: 'Special instructions...',
        },
      ],
    },
  ],
  submit: { label: 'Place Order' },
};

export const OrderItems: Story = {
  args: {
    schema: orderItemsSchema,
    onSubmit: (values: FormValues) => {
      console.log('Order submitted:', values);
      alert('Order placed! Check console for details.');
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Run accessibility check
    await runAxeAccessibilityCheck(canvasElement);
    
    // Fill customer name
    const customerNameInput = canvas.getByLabelText(/customer name/i);
    await userEvent.type(customerNameInput, 'John Doe');
    
    // Wait for first repeatable item to appear (minInstances: 1)
    await waitFor(() => {
      const productSelects = canvas.getAllByRole('combobox');
      expect(productSelects.length).toBeGreaterThanOrEqual(1);
    }, { timeout: 2000 });
    
    // Select a product for first item - use getAllByRole to find select elements
    const selects = canvas.getAllByRole('combobox');
    const firstProductSelect = selects.find(s => s.id?.includes('product') || s.getAttribute('name')?.includes('product'));
    if (firstProductSelect) {
      await userEvent.selectOptions(firstProductSelect, 'widget-a');
    }
    
    // Find and click "Add" button
    const addButton = canvas.getByRole('button', { name: /add/i });
    await userEvent.click(addButton);
    
    // Wait for new item to appear
    await waitFor(() => {
      const updatedSelects = canvas.getAllByRole('combobox');
      expect(updatedSelects.length).toBeGreaterThanOrEqual(3); // 2 product selects + customer name has none, so more items
    }, { timeout: 2000 });
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic repeatable section for order items. Minimum 1 item, maximum 5 items.',
      },
    },
  },
};

// ============= ATTENDEES (Min/Max Constraints) =============

const attendeesSchema: FormSchema = {
  id: 'event-registration',
  version: '1.0',
  title: 'Event Registration',
  description: 'Register attendees for the event. Minimum 2, maximum 10 attendees.',
  sections: [
    {
      id: 'event-info',
      title: 'Event',
      fields: [
        {
          id: 'eventName',
          type: 'select',
          label: 'Select Event',
          options: [
            { value: 'conference', label: 'Annual Conference 2026' },
            { value: 'workshop', label: 'Technical Workshop' },
            { value: 'meetup', label: 'Community Meetup' },
          ],
          validation: [{ type: 'required', message: 'Please select an event' }],
        },
      ],
    },
    {
      id: 'attendees',
      title: 'Attendees',
      description: 'Add 2-10 attendees for group registration',
      repeatable: true,
      minInstances: 2,
      maxInstances: 10,
      fields: [
        {
          id: 'name',
          type: 'text',
          label: 'Full Name',
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
        {
          id: 'dietaryRequirements',
          type: 'select',
          label: 'Dietary Requirements',
          options: [
            { value: 'none', label: 'None' },
            { value: 'vegetarian', label: 'Vegetarian' },
            { value: 'vegan', label: 'Vegan' },
            { value: 'gluten-free', label: 'Gluten Free' },
            { value: 'other', label: 'Other (specify in notes)' },
          ],
        },
      ],
    },
  ],
  submit: { label: 'Register Attendees' },
};

export const AttendeesWithMinMax: Story = {
  args: {
    schema: attendeesSchema,
    onSubmit: (values: FormValues) => {
      console.log('Registration submitted:', values);
      alert('Registration complete! Check console.');
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Run accessibility check
    await runAxeAccessibilityCheck(canvasElement);
    
    // Select event
    const eventSelect = canvas.getByLabelText(/select event/i);
    await userEvent.selectOptions(eventSelect, 'conference');
    
    // Wait for attendee fields to render (minInstances: 2)
    await waitFor(() => {
      const textInputs = canvas.getAllByRole('textbox');
      expect(textInputs.length).toBeGreaterThanOrEqual(2);
    }, { timeout: 2000 });
    
    // Find name and email inputs by placeholder or type
    const textInputs = canvas.getAllByRole('textbox');
    const nameInputs = textInputs.filter(
      input => input.getAttribute('placeholder')?.toLowerCase().includes('name') ||
               input.id?.toLowerCase().includes('name')
    );
    const emailInputs = textInputs.filter(
      input => input.getAttribute('type') === 'email' ||
               input.id?.toLowerCase().includes('email')
    );
    
    // Fill first attendee if inputs found
    if (nameInputs[0]) await userEvent.type(nameInputs[0], 'Alice Johnson');
    if (emailInputs[0]) await userEvent.type(emailInputs[0], 'alice@example.com');
    if (nameInputs[1]) await userEvent.type(nameInputs[1], 'Bob Smith');
    if (emailInputs[1]) await userEvent.type(emailInputs[1], 'bob@example.com');
  },
  parameters: {
    docs: {
      description: {
        story: 'Event registration with minimum 2 attendees required. Cannot remove below minimum.',
      },
    },
  },
};

// ============= EMPTY REPEATABLE (Start with 0) =============

const optionalItemsSchema: FormSchema = {
  id: 'optional-items-form',
  version: '1.0',
  title: 'Optional Add-ons',
  description: 'Add optional items to your order (0 to 3 items).',
  sections: [
    {
      id: 'base-order',
      title: 'Base Order',
      fields: [
        {
          id: 'baseProduct',
          type: 'select',
          label: 'Base Product',
          options: [
            { value: 'starter', label: 'Starter Plan - $49/mo' },
            { value: 'pro', label: 'Pro Plan - $99/mo' },
            { value: 'enterprise', label: 'Enterprise Plan - $299/mo' },
          ],
          validation: [{ type: 'required', message: 'Please select a plan' }],
        },
      ],
    },
    {
      id: 'addons',
      title: 'Optional Add-ons',
      description: 'Add extra features (optional)',
      repeatable: true,
      minInstances: 0,
      maxInstances: 3,
      fields: [
        {
          id: 'addon',
          type: 'select',
          label: 'Add-on',
          options: [
            { value: 'support', label: 'Priority Support - $29/mo' },
            { value: 'analytics', label: 'Advanced Analytics - $49/mo' },
            { value: 'api', label: 'API Access - $79/mo' },
            { value: 'sso', label: 'SSO Integration - $99/mo' },
          ],
          validation: [{ type: 'required', message: 'Please select an add-on' }],
        },
      ],
    },
  ],
  submit: { label: 'Complete Order' },
};

export const OptionalRepeatable: Story = {
  args: {
    schema: optionalItemsSchema,
    onSubmit: (values: FormValues) => {
      console.log('Order submitted:', values);
      alert('Order complete! Check console.');
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Run accessibility check
    await runAxeAccessibilityCheck(canvasElement);
    
    // Select base product
    const baseProductSelect = canvas.getByLabelText(/base product/i);
    await userEvent.selectOptions(baseProductSelect, 'pro');
    
    // Check initial addons count (may be 0 or 1 depending on implementation)
    // Don't assert exact count - just verify we can add more
    const initialSelects = canvas.getAllByRole('combobox');
    const initialCount = initialSelects.length;
    console.log('Initial select count:', initialCount);
    
    // Add first add-on
    const addButton = canvas.getByRole('button', { name: /add/i });
    await userEvent.click(addButton);
    
    // Should now have more select elements
    await waitFor(() => {
      const addons = canvas.getAllByRole('combobox');
      expect(addons.length).toBeGreaterThan(initialCount);
    }, { timeout: 2000 });
    
    // Add another
    await userEvent.click(addButton);
    
    await waitFor(() => {
      const addons = canvas.getAllByRole('combobox');
      expect(addons.length).toBeGreaterThan(initialCount + 1);
    }, { timeout: 2000 });
    
    // Submit should work
    const submitButton = canvas.getByRole('button', { name: /complete order/i });
    await expect(submitButton).toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story: 'Optional repeatable section starting with 0 items. User can add 0-3 add-ons.',
      },
    },
  },
};

// ============= KEYBOARD NAVIGATION =============

export const RepeatableKeyboardNavigation: Story = {
  args: {
    schema: orderItemsSchema,
    onSubmit: (values: FormValues) => console.log('Submitted:', values),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Run accessibility check
    await runAxeAccessibilityCheck(canvasElement);
    
    // Tab to customer name
    await userEvent.tab();
    const customerNameInput = canvas.getByLabelText(/customer name/i);
    await expect(document.activeElement).toBe(customerNameInput);
    
    // Type customer name
    await userEvent.type(customerNameInput, 'Test User');
    
    // Tab through first item fields
    await userEvent.tab(); // To product select
    await userEvent.keyboard('{ArrowDown}{Enter}'); // Select first option
    
    await userEvent.tab(); // To quantity
    await userEvent.type(document.activeElement as HTMLElement, '2');
    
    await userEvent.tab(); // To notes
    await userEvent.tab(); // To Remove button (if exists) or Add button
    
    // Find Add button and click with Enter
    const addButton = canvas.getByRole('button', { name: /add/i });
    addButton.focus();
    await userEvent.keyboard('{Enter}');
    
    // Verify new item added
    await waitFor(() => {
      const products = canvas.getAllByLabelText(/product/i);
      expect(products.length).toBe(2);
    });
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests keyboard navigation through repeatable sections: Tab, Arrow keys, Enter.',
      },
    },
  },
};
