/**
 * FIELD COMPONENT STORIES
 * 
 * Stories for schema-aware field components.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { FormProvider } from '@/state';
import { TextField } from '@/components/fields';
import type { FormSchema, TextFieldSchema, FormValues } from '@/schema/types';

// Wrapper that provides FormContext
function FieldStoryWrapper({
  children,
  initialValues = {},
}: {
  children: React.ReactNode;
  initialValues?: FormValues;
}) {
  const schema: FormSchema = {
    id: 'story-form',
    version: '1.0',
    title: 'Field Story',
    sections: [{
      id: 'main',
      fields: [],
    }],
  };

  return (
    <FormProvider schema={schema} initialValues={initialValues}>
      <div className="max-w-md">{children}</div>
    </FormProvider>
  );
}

// ============= TEXT FIELD =============

const textFieldMeta: Meta<typeof TextField> = {
  title: 'Fields/TextField',
  component: TextField,
  decorators: [
    (Story) => (
      <FieldStoryWrapper>
        <Story />
      </FieldStoryWrapper>
    ),
  ],
  tags: ['autodocs'],
};

export default textFieldMeta;

type TextFieldStory = StoryObj<typeof TextField>;

const basicTextSchema: TextFieldSchema = {
  id: 'name',
  type: 'text',
  label: 'Full Name',
  placeholder: 'Enter your name',
};

export const BasicTextField: TextFieldStory = {
  args: {
    schema: basicTextSchema,
  },
};

const emailSchema: TextFieldSchema = {
  id: 'email',
  type: 'text',
  label: 'Email Address',
  inputType: 'email',
  placeholder: 'you@example.com',
  helperText: 'We will never share your email.',
  validation: [
    { type: 'required', message: 'Email is required' },
    { type: 'email', message: 'Please enter a valid email' },
  ],
};

export const EmailField: TextFieldStory = {
  args: {
    schema: emailSchema,
  },
};

const passwordSchema: TextFieldSchema = {
  id: 'password',
  type: 'text',
  label: 'Password',
  inputType: 'password',
  placeholder: 'Enter password',
  validation: [
    { type: 'required', message: 'Password is required' },
    { type: 'minLength', value: 8, message: 'Minimum 8 characters' },
  ],
};

export const PasswordField: TextFieldStory = {
  args: {
    schema: passwordSchema,
  },
};

const disabledSchema: TextFieldSchema = {
  id: 'disabled',
  type: 'text',
  label: 'Disabled Field',
  disabled: true,
  placeholder: 'This field is disabled',
};

export const DisabledTextField: TextFieldStory = {
  args: {
    schema: disabledSchema,
  },
};
