/**
 * PRIMITIVES STORIES
 * 
 * Stories for all UI primitives to demonstrate and test them in isolation.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Input, ErrorMessage } from '@/components/primitives';

// ============= INPUT STORIES =============

const inputMeta: Meta<typeof Input> = {
  title: 'Primitives/Input',
  component: Input,
  parameters: {
    docs: {
      description: {
        component: 'Base text input component with accessibility support.',
      },
    },
  },
  tags: ['autodocs'],
};

export default inputMeta;

type InputStory = StoryObj<typeof Input>;

// Wrapper for controlled input
function InputWrapper(props: Partial<React.ComponentProps<typeof Input>>) {
  const [value, setValue] = useState('');
  return (
    <Input
      id="demo-input"
      value={value}
      onChange={setValue}
      {...props}
    />
  );
}

export const Default: InputStory = {
  render: () => <InputWrapper placeholder="Enter text..." />,
};

export const WithError: InputStory = {
  render: () => (
    <div>
      <InputWrapper
        placeholder="Invalid input"
        hasError
        errorId="error-1"
      />
      <ErrorMessage id="error-1">This field has an error</ErrorMessage>
    </div>
  ),
};

export const Disabled: InputStory = {
  render: () => <InputWrapper placeholder="Disabled input" disabled />,
};

export const EmailType: InputStory = {
  render: () => <InputWrapper type="email" placeholder="you@example.com" />,
};

export const PasswordType: InputStory = {
  render: () => <InputWrapper type="password" placeholder="Enter password" />,
};
