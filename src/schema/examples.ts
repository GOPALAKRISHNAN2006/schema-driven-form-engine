/**
 * EXAMPLE SCHEMAS
 * 
 * These demonstrate the schema format and serve as test fixtures.
 * Each example showcases different features of the form builder.
 */

import { FormSchema } from './types';

/**
 * EXAMPLE 1: Simple Contact Form
 * Features: Basic fields, required validation, email validation
 */
export const contactFormSchema: FormSchema = {
  id: 'contact-form',
  title: 'Contact Us',
  description: 'Fill out this form and we\'ll get back to you within 24 hours.',
  
  sections: [
    {
      id: 'personal-info',
      title: 'Personal Information',
      fields: [
        {
          id: 'firstName',
          type: 'text',
          label: 'First Name',
          placeholder: 'Enter your first name',
          validation: [
            { type: 'required', message: 'First name is required' },
            { type: 'minLength', value: 2, message: 'Must be at least 2 characters' }
          ]
        },
        {
          id: 'lastName',
          type: 'text',
          label: 'Last Name',
          placeholder: 'Enter your last name',
          validation: [
            { type: 'required', message: 'Last name is required' }
          ]
        },
        {
          id: 'email',
          type: 'text',
          label: 'Email Address',
          placeholder: 'you@example.com',
          validation: [
            { type: 'required', message: 'Email is required' },
            { type: 'email', message: 'Please enter a valid email address' }
          ]
        }
      ]
    },
    {
      id: 'message-section',
      title: 'Your Message',
      fields: [
        {
          id: 'subject',
          type: 'select',
          label: 'Subject',
          placeholder: 'Select a topic',
          options: [
            { label: 'General Inquiry', value: 'general' },
            { label: 'Technical Support', value: 'support' },
            { label: 'Sales Question', value: 'sales' },
            { label: 'Partnership', value: 'partnership' }
          ],
          validation: [
            { type: 'required', message: 'Please select a subject' }
          ]
        },
        {
          id: 'message',
          type: 'textarea',
          label: 'Message',
          placeholder: 'Tell us how we can help...',
          rows: 5,
          validation: [
            { type: 'required', message: 'Message is required' },
            { type: 'minLength', value: 20, message: 'Please provide more details (at least 20 characters)' }
          ]
        },
        {
          id: 'subscribe',
          type: 'checkbox',
          label: 'Subscribe to our newsletter',
          defaultValue: false,
          helpText: 'We send updates about once a month. No spam!'
        }
      ]
    }
  ],
  
  submit: {
    label: 'Send Message',
    loadingLabel: 'Sending...'
  }
};

/**
 * EXAMPLE 2: Registration Form with Conditional Fields
 * Features: Conditional visibility, dependent fields, async validation
 */
export const registrationFormSchema: FormSchema = {
  id: 'registration-form',
  title: 'Create Your Account',
  
  sections: [
    {
      id: 'account-type',
      title: 'Account Type',
      fields: [
        {
          id: 'accountType',
          type: 'select',
          label: 'I am signing up as',
          options: [
            { label: 'Individual', value: 'individual' },
            { label: 'Business', value: 'business' }
          ],
          defaultValue: 'individual',
          validation: [
            { type: 'required', message: 'Please select account type' }
          ]
        }
      ]
    },
    {
      id: 'business-info',
      title: 'Business Information',
      // This section only shows when accountType is 'business'
      showWhen: {
        field: 'accountType',
        operator: 'equals',
        value: 'business'
      },
      fields: [
        {
          id: 'companyName',
          type: 'text',
          label: 'Company Name',
          validation: [
            { type: 'required', message: 'Company name is required' }
          ]
        },
        {
          id: 'companySize',
          type: 'select',
          label: 'Company Size',
          options: [
            { label: '1-10 employees', value: 'small' },
            { label: '11-50 employees', value: 'medium' },
            { label: '51-200 employees', value: 'large' },
            { label: '200+ employees', value: 'enterprise' }
          ]
        },
        {
          id: 'taxId',
          type: 'text',
          label: 'Tax ID (optional)',
          helpText: 'Required for invoicing'
        }
      ]
    },
    {
      id: 'credentials',
      title: 'Login Credentials',
      fields: [
        {
          id: 'username',
          type: 'text',
          label: 'Username',
          validation: [
            { type: 'required', message: 'Username is required' },
            { type: 'minLength', value: 3, message: 'Username must be at least 3 characters' },
            { type: 'pattern', value: '^[a-zA-Z0-9_]+$', message: 'Only letters, numbers, and underscores allowed' },
            // Async validation to check username availability
            { 
              type: 'async', 
              url: '/api/check-username',
              debounceMs: 500,
              message: 'This username is already taken',
              trigger: 'blur'
            }
          ]
        },
        {
          id: 'email',
          type: 'text',
          label: 'Email Address',
          validation: [
            { type: 'required', message: 'Email is required' },
            { type: 'email', message: 'Please enter a valid email' }
          ]
        },
        {
          id: 'password',
          type: 'text', // Would be password type in real implementation
          label: 'Password',
          validation: [
            { type: 'required', message: 'Password is required' },
            { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' },
            { type: 'pattern', value: '(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])', message: 'Must contain uppercase, lowercase, and number' }
          ]
        }
      ]
    },
    {
      id: 'terms',
      fields: [
        {
          id: 'acceptTerms',
          type: 'checkbox',
          label: 'I agree to the Terms of Service and Privacy Policy',
          validation: [
            { type: 'required', message: 'You must accept the terms to continue' }
          ]
        },
        {
          id: 'acceptMarketing',
          type: 'checkbox',
          label: 'Send me product updates and marketing emails',
          defaultValue: false
        }
      ]
    }
  ],
  
  submit: {
    label: 'Create Account',
    loadingLabel: 'Creating account...'
  },
  
  autosave: {
    enabled: true,
    debounceMs: 2000,
    storageKey: 'registration-draft',
    conflictStrategy: 'prompt'
  }
};

/**
 * EXAMPLE 3: Order Form with Repeatable Sections
 * Features: Repeatable sections, dependent dropdowns, calculations
 */
export const orderFormSchema: FormSchema = {
  id: 'order-form',
  title: 'Place Your Order',
  
  sections: [
    {
      id: 'customer',
      title: 'Customer Information',
      fields: [
        {
          id: 'customerName',
          type: 'text',
          label: 'Full Name',
          validation: [{ type: 'required', message: 'Name is required' }]
        },
        {
          id: 'phone',
          type: 'text',
          label: 'Phone Number',
          validation: [
            { type: 'required', message: 'Phone is required' },
            { type: 'pattern', value: '^[0-9-+() ]+$', message: 'Invalid phone number' }
          ]
        }
      ]
    },
    {
      id: 'shipping',
      title: 'Shipping Address',
      fields: [
        {
          id: 'country',
          type: 'select',
          label: 'Country',
          // Async options fetched from API
          asyncOptions: {
            url: '/api/countries',
            labelKey: 'name',
            valueKey: 'code',
            cacheDuration: 86400000 // 24 hours
          },
          validation: [{ type: 'required', message: 'Country is required' }]
        },
        {
          id: 'state',
          type: 'select',
          label: 'State/Province',
          // Dependent dropdown - refetches when country changes
          asyncOptions: {
            url: '/api/states',
            dependsOn: ['country'],
            labelKey: 'name',
            valueKey: 'code'
          },
          // Only show when country is selected
          showWhen: {
            field: 'country',
            operator: 'isNotEmpty'
          }
        },
        {
          id: 'city',
          type: 'text',
          label: 'City',
          validation: [{ type: 'required', message: 'City is required' }]
        },
        {
          id: 'zipCode',
          type: 'text',
          label: 'Postal/ZIP Code',
          validation: [{ type: 'required', message: 'ZIP code is required' }]
        },
        {
          id: 'address',
          type: 'textarea',
          label: 'Street Address',
          rows: 2,
          validation: [{ type: 'required', message: 'Address is required' }]
        }
      ]
    },
    {
      id: 'items',
      title: 'Order Items',
      // REPEATABLE SECTION - user can add/remove items
      repeatable: true,
      minInstances: 1,
      maxInstances: 10,
      fields: [
        {
          id: 'productId',
          type: 'select',
          label: 'Product',
          asyncOptions: {
            url: '/api/products',
            labelKey: 'name',
            valueKey: 'id'
          },
          validation: [{ type: 'required', message: 'Select a product' }]
        },
        {
          id: 'quantity',
          type: 'number',
          label: 'Quantity',
          defaultValue: 1,
          min: 1,
          max: 100,
          validation: [
            { type: 'required', message: 'Quantity is required' },
            { type: 'min', value: 1, message: 'Minimum quantity is 1' }
          ]
        }
      ]
    },
    {
      id: 'payment',
      title: 'Payment Method',
      fields: [
        {
          id: 'paymentMethod',
          type: 'select',
          label: 'Payment Method',
          options: [
            { label: 'Credit Card', value: 'card' },
            { label: 'PayPal', value: 'paypal' },
            { label: 'Bank Transfer', value: 'bank' }
          ],
          validation: [{ type: 'required', message: 'Select payment method' }]
        },
        {
          id: 'cardNumber',
          type: 'text',
          label: 'Card Number',
          // Only show for credit card payments
          showWhen: {
            field: 'paymentMethod',
            operator: 'equals',
            value: 'card'
          },
          validation: [
            { type: 'required', message: 'Card number is required' },
            { type: 'pattern', value: '^[0-9]{16}$', message: 'Enter 16-digit card number' }
          ]
        }
      ]
    },
    {
      id: 'notes',
      title: 'Additional Notes',
      fields: [
        {
          id: 'orderNotes',
          type: 'textarea',
          label: 'Special Instructions (optional)',
          placeholder: 'Any special delivery instructions...',
          rows: 3
        }
      ]
    }
  ],
  
  submit: {
    label: 'Place Order',
    loadingLabel: 'Processing...'
  },
  
  autosave: {
    enabled: true,
    debounceMs: 3000,
    storageKey: 'order-draft',
    conflictStrategy: 'local'
  }
};

/**
 * EXAMPLE 4: Complex Conditional Logic
 * Features: AND/OR/NOT conditions, deeply nested conditions
 */
export const surveyFormSchema: FormSchema = {
  id: 'survey-form',
  title: 'Customer Satisfaction Survey',
  
  sections: [
    {
      id: 'rating',
      fields: [
        {
          id: 'overallRating',
          type: 'select',
          label: 'How would you rate your overall experience?',
          options: [
            { label: '⭐ Very Poor', value: 1 },
            { label: '⭐⭐ Poor', value: 2 },
            { label: '⭐⭐⭐ Average', value: 3 },
            { label: '⭐⭐⭐⭐ Good', value: 4 },
            { label: '⭐⭐⭐⭐⭐ Excellent', value: 5 }
          ],
          validation: [{ type: 'required', message: 'Please provide a rating' }]
        },
        {
          id: 'wouldRecommend',
          type: 'checkbox',
          label: 'Would you recommend us to a friend?'
        }
      ]
    },
    {
      id: 'negative-feedback',
      title: 'We\'re sorry to hear that',
      description: 'Please help us understand what went wrong.',
      // Show when rating is 1 or 2
      showWhen: {
        or: [
          { field: 'overallRating', operator: 'equals', value: 1 },
          { field: 'overallRating', operator: 'equals', value: 2 }
        ]
      },
      fields: [
        {
          id: 'issueCategory',
          type: 'select',
          label: 'What was the main issue?',
          options: [
            { label: 'Product Quality', value: 'quality' },
            { label: 'Customer Service', value: 'service' },
            { label: 'Delivery/Shipping', value: 'delivery' },
            { label: 'Pricing', value: 'pricing' },
            { label: 'Website/App Issues', value: 'technical' },
            { label: 'Other', value: 'other' }
          ]
        },
        {
          id: 'issueDetails',
          type: 'textarea',
          label: 'Please describe the issue',
          validation: [
            { type: 'required', message: 'Please describe the issue' },
            { type: 'minLength', value: 20, message: 'Please provide more details' }
          ]
        }
      ]
    },
    {
      id: 'positive-feedback',
      title: 'Thank you!',
      description: 'We\'d love to know what we did right.',
      // Show when rating is 4 or 5 AND would recommend
      showWhen: {
        and: [
          {
            or: [
              { field: 'overallRating', operator: 'equals', value: 4 },
              { field: 'overallRating', operator: 'equals', value: 5 }
            ]
          },
          { field: 'wouldRecommend', operator: 'equals', value: true }
        ]
      },
      fields: [
        {
          id: 'testimonial',
          type: 'textarea',
          label: 'Would you like to leave a testimonial?',
          helpText: 'We may feature this on our website (with your permission)',
          placeholder: 'Tell us what you loved about your experience...'
        },
        {
          id: 'canPublish',
          type: 'checkbox',
          label: 'You may publish my testimonial',
          // Only show if they wrote something
          showWhen: {
            field: 'testimonial',
            operator: 'isNotEmpty'
          }
        }
      ]
    },
    {
      id: 'contact',
      title: 'Follow-up',
      fields: [
        {
          id: 'wantsFollowUp',
          type: 'checkbox',
          label: 'I would like someone to follow up with me'
        },
        {
          id: 'contactEmail',
          type: 'text',
          label: 'Email for follow-up',
          showWhen: {
            field: 'wantsFollowUp',
            operator: 'equals',
            value: true
          },
          validation: [
            { type: 'required', message: 'Email is required for follow-up' },
            { type: 'email', message: 'Please enter a valid email' }
          ]
        },
        {
          id: 'preferredContactTime',
          type: 'select',
          label: 'Preferred contact time',
          options: [
            { label: 'Morning (9am-12pm)', value: 'morning' },
            { label: 'Afternoon (12pm-5pm)', value: 'afternoon' },
            { label: 'Evening (5pm-8pm)', value: 'evening' }
          ],
          showWhen: {
            field: 'wantsFollowUp',
            operator: 'equals',
            value: true
          }
        }
      ]
    }
  ],
  
  submit: {
    label: 'Submit Feedback',
    loadingLabel: 'Submitting...'
  }
};
