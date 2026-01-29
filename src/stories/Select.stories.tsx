/**
 * SELECT STORIES
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Select, ErrorMessage } from '@/components/primitives';

const meta: Meta<typeof Select> = {
  title: 'Primitives/Select',
  component: Select,
  parameters: {
    docs: {
      description: {
        component: 'Native select element with custom styling and accessibility.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Select>;

const sampleOptions = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
];

function SelectWrapper(props: Partial<React.ComponentProps<typeof Select>>) {
  const [value, setValue] = useState('');
  return (
    <Select
      id="demo-select"
      value={value}
      onChange={setValue}
      options={sampleOptions}
      {...props}
    />
  );
}

export const Default: Story = {
  render: () => <SelectWrapper placeholder="Select a country" />,
};

export const WithPreselected: Story = {
  render: () => {
    const [value, setValue] = useState('uk');
    return (
      <Select
        id="preselected"
        value={value}
        onChange={setValue}
        options={sampleOptions}
      />
    );
  },
};

export const WithError: Story = {
  render: () => (
    <div>
      <SelectWrapper placeholder="Select a country" hasError errorId="select-error" />
      <ErrorMessage id="select-error">Please select a country</ErrorMessage>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => <SelectWrapper placeholder="Disabled select" disabled />,
};

export const WithDisabledOption: Story = {
  render: () => (
    <SelectWrapper
      placeholder="Select a country"
      options={[
        ...sampleOptions,
        { value: 'de', label: 'Germany (unavailable)', disabled: true },
      ]}
    />
  ),
};
