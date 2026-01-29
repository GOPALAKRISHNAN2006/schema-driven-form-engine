/**
 * CHECKBOX STORIES
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox, ErrorMessage } from '@/components/primitives';

const meta: Meta<typeof Checkbox> = {
  title: 'Primitives/Checkbox',
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component: 'Custom styled checkbox with accessibility support.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

function CheckboxWrapper(props: Partial<React.ComponentProps<typeof Checkbox>>) {
  const [checked, setChecked] = useState(false);
  return (
    <Checkbox
      id="demo-checkbox"
      checked={checked}
      onChange={setChecked}
      {...props}
    />
  );
}

export const Default: Story = {
  render: () => <CheckboxWrapper label="Accept terms and conditions" />,
};

export const Checked: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return (
      <Checkbox
        id="checked"
        checked={checked}
        onChange={setChecked}
        label="This is checked by default"
      />
    );
  },
};

export const WithError: Story = {
  render: () => (
    <div>
      <CheckboxWrapper
        label="I agree to the terms"
        hasError
        errorId="checkbox-error"
      />
      <ErrorMessage id="checkbox-error" className="ml-6">
        You must agree to continue
      </ErrorMessage>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => <CheckboxWrapper label="Disabled checkbox" disabled />,
};

export const DisabledChecked: Story = {
  render: () => (
    <Checkbox
      id="disabled-checked"
      checked={true}
      onChange={() => {}}
      label="Disabled but checked"
      disabled
    />
  ),
};

export const WithoutLabel: Story = {
  render: () => <CheckboxWrapper />,
};

export const LongLabel: Story = {
  render: () => (
    <div className="max-w-md">
      <CheckboxWrapper
        label="I have read and agree to the Terms of Service, Privacy Policy, and Cookie Policy. I understand that my data will be processed in accordance with these policies."
      />
    </div>
  ),
};
