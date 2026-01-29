/**
 * FORM RENDERER STORIES
 * 
 * Complete form stories demonstrating all features.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { FormRenderer } from '@/components/form';
import { contactFormSchema, registrationFormSchema, surveyFormSchema } from '@/schema/examples';
import type { FormValues } from '@/schema/types';

const meta: Meta<typeof FormRenderer> = {
  title: 'Form/FormRenderer',
  component: FormRenderer,
  parameters: {
    docs: {
      description: {
        component: 'Top-level form component that renders a complete form from schema.',
      },
    },
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FormRenderer>;

// ============= CONTACT FORM =============

export const ContactForm: Story = {
  args: {
    schema: contactFormSchema,
    initialValues: {},
    onSubmit: (values: FormValues) => {
      console.log('Form submitted:', values);
      alert('Form submitted! Check console.');
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'A simple contact form with name, email, and message fields.',
      },
    },
  },
};

// ============= REGISTRATION FORM =============

export const RegistrationForm: Story = {
  args: {
    schema: registrationFormSchema,
    initialValues: {},
    onSubmit: (values: FormValues) => {
      console.log('Registration submitted:', values);
      alert('Registration submitted! Check console.');
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Registration form with conditional fields - company name appears when account type is "business".',
      },
    },
  },
};

// ============= SURVEY FORM =============

export const SurveyForm: Story = {
  args: {
    schema: surveyFormSchema,
    initialValues: {},
    onSubmit: (values: FormValues) => {
      console.log('Survey submitted:', values);
      alert('Survey submitted! Check console.');
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Survey form demonstrating complex conditional logic with AND/OR conditions.',
      },
    },
  },
};

// ============= WITH INITIAL VALUES =============

export const WithInitialValues: Story = {
  args: {
    schema: contactFormSchema,
    initialValues: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    onSubmit: (values: FormValues) => {
      console.log('Form submitted:', values);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Form pre-populated with initial values.',
      },
    },
  },
};

// ============= WITH CHANGE TRACKING =============

export const WithChangeTracking: Story = {
  args: {
    schema: contactFormSchema,
    initialValues: {},
    onChange: (values: FormValues) => {
      console.log('Values changed:', values);
    },
    onSubmit: (values: FormValues) => {
      console.log('Form submitted:', values);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with onChange callback - check console for value changes.',
      },
    },
  },
};

// ============= CUSTOM STYLED =============

export const CustomStyled: Story = {
  args: {
    schema: contactFormSchema,
    initialValues: {},
    className: 'max-w-lg mx-auto p-6 bg-gray-50 rounded-lg shadow-sm',
    onSubmit: (values: FormValues) => {
      console.log('Form submitted:', values);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with custom styling via className prop.',
      },
    },
  },
};
