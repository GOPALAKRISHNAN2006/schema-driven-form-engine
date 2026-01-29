/**
 * COMPREHENSIVE JOB APPLICATION FORM
 * 
 * Demonstrates all features of the schema-driven form engine:
 * - Multiple sections with descriptions
 * - All field types (text, number, select, checkbox, textarea)
 * - Conditional fields (showWhen with AND/OR conditions)
 * - Comprehensive validation rules
 * - Dependent dropdowns
 * - Dynamic field visibility
 */

import { FormRenderer } from '@/components/form';
import type { FormSchema, FormValues } from '@/schema/types';

const jobApplicationSchema: FormSchema = {
  id: 'job-application-form',
  version: '2.0',
  title: 'Job Application Form',
  description: 'Complete this application to join our team. All fields marked with validation are required.',
  sections: [
    // ============= SECTION 1: PERSONAL INFORMATION =============
    {
      id: 'personal-info',
      title: 'Personal Information',
      description: 'Tell us about yourself',
      fields: [
        {
          id: 'firstName',
          type: 'text',
          label: 'First Name',
          placeholder: 'John',
          helperText: 'Your legal first name',
          validation: [
            { type: 'required', message: 'First name is required' },
            { type: 'minLength', value: 2, message: 'First name must be at least 2 characters' },
            { type: 'maxLength', value: 50, message: 'First name cannot exceed 50 characters' }
          ]
        },
        {
          id: 'lastName',
          type: 'text',
          label: 'Last Name',
          placeholder: 'Doe',
          helperText: 'Your legal last name',
          validation: [
            { type: 'required', message: 'Last name is required' },
            { type: 'minLength', value: 2, message: 'Last name must be at least 2 characters' }
          ]
        },
        {
          id: 'email',
          type: 'text',
          label: 'Email Address',
          inputType: 'email',
          placeholder: 'john.doe@example.com',
          helperText: 'We will contact you at this email',
          validation: [
            { type: 'required', message: 'Email is required' },
            { type: 'email', message: 'Please enter a valid email address' }
          ]
        },
        {
          id: 'phone',
          type: 'text',
          label: 'Phone Number',
          inputType: 'tel',
          placeholder: '+1 (555) 123-4567',
          helperText: 'Include country code for international numbers',
          validation: [
            { type: 'required', message: 'Phone number is required' },
            { type: 'pattern', value: '^[+]?[\\d\\s()-]{10,}$', message: 'Please enter a valid phone number' }
          ]
        },
        {
          id: 'age',
          type: 'number',
          label: 'Age',
          placeholder: '25',
          helperText: 'You must be at least 18 years old',
          min: 18,
          max: 100,
          validation: [
            { type: 'required', message: 'Age is required' },
            { type: 'min', value: 18, message: 'You must be at least 18 years old' },
            { type: 'max', value: 100, message: 'Please enter a valid age' }
          ]
        }
      ]
    },

    // ============= SECTION 2: ADDRESS =============
    {
      id: 'address-info',
      title: 'Address',
      description: 'Your current residential address',
      fields: [
        {
          id: 'country',
          type: 'select',
          label: 'Country',
          placeholder: 'Select your country',
          options: [
            { value: 'us', label: 'United States' },
            { value: 'ca', label: 'Canada' },
            { value: 'uk', label: 'United Kingdom' },
            { value: 'de', label: 'Germany' },
            { value: 'fr', label: 'France' },
            { value: 'au', label: 'Australia' },
            { value: 'in', label: 'India' },
            { value: 'other', label: 'Other' }
          ],
          validation: [
            { type: 'required', message: 'Please select your country' }
          ]
        },
        {
          id: 'state',
          type: 'select',
          label: 'State / Province',
          placeholder: 'Select state',
          options: [
            { value: 'ca', label: 'California' },
            { value: 'ny', label: 'New York' },
            { value: 'tx', label: 'Texas' },
            { value: 'fl', label: 'Florida' },
            { value: 'wa', label: 'Washington' },
            { value: 'other', label: 'Other' }
          ],
          showWhen: {
            field: 'country',
            operator: 'equals',
            value: 'us'
          },
          validation: [
            { type: 'required', message: 'Please select your state' }
          ]
        },
        {
          id: 'city',
          type: 'text',
          label: 'City',
          placeholder: 'San Francisco',
          validation: [
            { type: 'required', message: 'City is required' }
          ]
        },
        {
          id: 'zipCode',
          type: 'text',
          label: 'ZIP / Postal Code',
          placeholder: '94102',
          validation: [
            { type: 'required', message: 'ZIP code is required' },
            { type: 'pattern', value: '^[A-Za-z0-9\\s-]{3,10}$', message: 'Please enter a valid postal code' }
          ]
        }
      ]
    },

    // ============= SECTION 3: POSITION DETAILS =============
    {
      id: 'position-info',
      title: 'Position Details',
      description: 'Tell us about the role you are applying for',
      fields: [
        {
          id: 'department',
          type: 'select',
          label: 'Department',
          placeholder: 'Select department',
          options: [
            { value: 'engineering', label: 'Engineering' },
            { value: 'design', label: 'Design' },
            { value: 'product', label: 'Product Management' },
            { value: 'marketing', label: 'Marketing' },
            { value: 'sales', label: 'Sales' },
            { value: 'hr', label: 'Human Resources' },
            { value: 'finance', label: 'Finance' }
          ],
          validation: [
            { type: 'required', message: 'Please select a department' }
          ]
        },
        {
          id: 'role',
          type: 'select',
          label: 'Role',
          placeholder: 'Select role',
          options: [
            { value: 'frontend', label: 'Frontend Developer' },
            { value: 'backend', label: 'Backend Developer' },
            { value: 'fullstack', label: 'Full Stack Developer' },
            { value: 'devops', label: 'DevOps Engineer' },
            { value: 'qa', label: 'QA Engineer' },
            { value: 'lead', label: 'Tech Lead' },
            { value: 'manager', label: 'Engineering Manager' }
          ],
          showWhen: {
            field: 'department',
            operator: 'equals',
            value: 'engineering'
          },
          validation: [
            { type: 'required', message: 'Please select a role' }
          ]
        },
        {
          id: 'experienceYears',
          type: 'number',
          label: 'Years of Experience',
          placeholder: '5',
          min: 0,
          max: 50,
          helperText: 'Total years of professional experience',
          validation: [
            { type: 'required', message: 'Experience is required' },
            { type: 'min', value: 0, message: 'Experience cannot be negative' }
          ]
        },
        {
          id: 'seniorityLevel',
          type: 'select',
          label: 'Seniority Level',
          placeholder: 'Select level',
          options: [
            { value: 'junior', label: 'Junior (0-2 years)' },
            { value: 'mid', label: 'Mid-Level (2-5 years)' },
            { value: 'senior', label: 'Senior (5-8 years)' },
            { value: 'staff', label: 'Staff (8-12 years)' },
            { value: 'principal', label: 'Principal (12+ years)' }
          ],
          validation: [
            { type: 'required', message: 'Please select your seniority level' }
          ]
        },
        {
          id: 'expectedSalary',
          type: 'number',
          label: 'Expected Annual Salary (USD)',
          placeholder: '120000',
          min: 30000,
          max: 500000,
          helperText: 'Your expected annual compensation',
          validation: [
            { type: 'required', message: 'Expected salary is required' },
            { type: 'min', value: 30000, message: 'Minimum salary is $30,000' }
          ]
        },
        {
          id: 'startDate',
          type: 'select',
          label: 'Available Start Date',
          placeholder: 'Select availability',
          options: [
            { value: 'immediate', label: 'Immediately' },
            { value: '2weeks', label: 'In 2 weeks' },
            { value: '1month', label: 'In 1 month' },
            { value: '2months', label: 'In 2 months' },
            { value: '3months', label: 'In 3+ months' }
          ],
          validation: [
            { type: 'required', message: 'Please select your availability' }
          ]
        }
      ]
    },

    // ============= SECTION 4: WORK PREFERENCES =============
    {
      id: 'work-preferences',
      title: 'Work Preferences',
      description: 'Your ideal work environment',
      fields: [
        {
          id: 'workType',
          type: 'select',
          label: 'Preferred Work Type',
          placeholder: 'Select work type',
          options: [
            { value: 'remote', label: 'Fully Remote' },
            { value: 'hybrid', label: 'Hybrid (Remote + Office)' },
            { value: 'onsite', label: 'On-site' }
          ],
          validation: [
            { type: 'required', message: 'Please select your work preference' }
          ]
        },
        {
          id: 'officeLocation',
          type: 'select',
          label: 'Preferred Office Location',
          placeholder: 'Select office',
          options: [
            { value: 'sf', label: 'San Francisco, CA' },
            { value: 'nyc', label: 'New York, NY' },
            { value: 'seattle', label: 'Seattle, WA' },
            { value: 'austin', label: 'Austin, TX' },
            { value: 'london', label: 'London, UK' }
          ],
          showWhen: {
            or: [
              { field: 'workType', operator: 'equals', value: 'hybrid' },
              { field: 'workType', operator: 'equals', value: 'onsite' }
            ]
          },
          validation: [
            { type: 'required', message: 'Please select an office location' }
          ]
        },
        {
          id: 'hybridDays',
          type: 'number',
          label: 'Days Per Week in Office',
          placeholder: '3',
          min: 1,
          max: 5,
          helperText: 'How many days would you prefer to be in the office?',
          showWhen: {
            field: 'workType',
            operator: 'equals',
            value: 'hybrid'
          },
          validation: [
            { type: 'required', message: 'Please specify office days' },
            { type: 'min', value: 1, message: 'Minimum 1 day required' },
            { type: 'max', value: 5, message: 'Maximum 5 days per week' }
          ]
        },
        {
          id: 'timezone',
          type: 'select',
          label: 'Your Timezone',
          placeholder: 'Select timezone',
          options: [
            { value: 'pst', label: 'Pacific Time (PT)' },
            { value: 'mst', label: 'Mountain Time (MT)' },
            { value: 'cst', label: 'Central Time (CT)' },
            { value: 'est', label: 'Eastern Time (ET)' },
            { value: 'gmt', label: 'GMT / UTC' },
            { value: 'cet', label: 'Central European Time (CET)' },
            { value: 'ist', label: 'India Standard Time (IST)' },
            { value: 'aest', label: 'Australian Eastern Time (AEST)' }
          ],
          showWhen: {
            field: 'workType',
            operator: 'equals',
            value: 'remote'
          },
          validation: [
            { type: 'required', message: 'Please select your timezone' }
          ]
        },
        {
          id: 'willingToRelocate',
          type: 'checkbox',
          label: 'I am willing to relocate if required'
        },
        {
          id: 'relocationAssistance',
          type: 'checkbox',
          label: 'I would need relocation assistance',
          showWhen: {
            field: 'willingToRelocate',
            operator: 'equals',
            value: true
          }
        }
      ]
    },

    // ============= SECTION 5: SKILLS & QUALIFICATIONS =============
    {
      id: 'skills-info',
      title: 'Skills & Qualifications',
      description: 'Your technical and professional skills',
      fields: [
        {
          id: 'primarySkill',
          type: 'select',
          label: 'Primary Technical Skill',
          placeholder: 'Select your main skill',
          options: [
            { value: 'react', label: 'React / React Native' },
            { value: 'vue', label: 'Vue.js' },
            { value: 'angular', label: 'Angular' },
            { value: 'node', label: 'Node.js' },
            { value: 'python', label: 'Python' },
            { value: 'java', label: 'Java' },
            { value: 'go', label: 'Go' },
            { value: 'rust', label: 'Rust' },
            { value: 'dotnet', label: '.NET / C#' },
            { value: 'other', label: 'Other' }
          ],
          validation: [
            { type: 'required', message: 'Please select your primary skill' }
          ]
        },
        {
          id: 'otherSkill',
          type: 'text',
          label: 'Specify Your Primary Skill',
          placeholder: 'e.g., Kubernetes, Terraform, etc.',
          showWhen: {
            field: 'primarySkill',
            operator: 'equals',
            value: 'other'
          },
          validation: [
            { type: 'required', message: 'Please specify your skill' }
          ]
        },
        {
          id: 'hasLeadershipExperience',
          type: 'checkbox',
          label: 'I have team leadership or management experience'
        },
        {
          id: 'teamSize',
          type: 'number',
          label: 'Largest Team Size Managed',
          placeholder: '5',
          min: 1,
          max: 100,
          helperText: 'Number of direct reports',
          showWhen: {
            field: 'hasLeadershipExperience',
            operator: 'equals',
            value: true
          },
          validation: [
            { type: 'required', message: 'Please enter team size' },
            { type: 'min', value: 1, message: 'Minimum team size is 1' }
          ]
        },
        {
          id: 'education',
          type: 'select',
          label: 'Highest Education Level',
          placeholder: 'Select education',
          options: [
            { value: 'highschool', label: 'High School' },
            { value: 'associate', label: 'Associate Degree' },
            { value: 'bachelor', label: 'Bachelor\'s Degree' },
            { value: 'master', label: 'Master\'s Degree' },
            { value: 'phd', label: 'Ph.D.' },
            { value: 'bootcamp', label: 'Coding Bootcamp' },
            { value: 'selftaught', label: 'Self-Taught' }
          ],
          validation: [
            { type: 'required', message: 'Please select your education level' }
          ]
        }
      ]
    },

    // ============= SECTION 6: ADDITIONAL INFORMATION =============
    {
      id: 'additional-info',
      title: 'Additional Information',
      description: 'Anything else you would like us to know',
      fields: [
        {
          id: 'portfolioUrl',
          type: 'text',
          label: 'Portfolio / GitHub URL',
          inputType: 'url',
          placeholder: 'https://github.com/username',
          helperText: 'Link to your portfolio, GitHub, or personal website',
          validation: [
            { type: 'url', message: 'Please enter a valid URL' }
          ]
        },
        {
          id: 'linkedinUrl',
          type: 'text',
          label: 'LinkedIn Profile',
          inputType: 'url',
          placeholder: 'https://linkedin.com/in/username',
          validation: [
            { type: 'url', message: 'Please enter a valid LinkedIn URL' }
          ]
        },
        {
          id: 'referralSource',
          type: 'select',
          label: 'How did you hear about us?',
          placeholder: 'Select source',
          options: [
            { value: 'linkedin', label: 'LinkedIn' },
            { value: 'indeed', label: 'Indeed' },
            { value: 'glassdoor', label: 'Glassdoor' },
            { value: 'referral', label: 'Employee Referral' },
            { value: 'website', label: 'Company Website' },
            { value: 'event', label: 'Career Fair / Event' },
            { value: 'other', label: 'Other' }
          ]
        },
        {
          id: 'referrerName',
          type: 'text',
          label: 'Referrer Name',
          placeholder: 'Name of the employee who referred you',
          showWhen: {
            field: 'referralSource',
            operator: 'equals',
            value: 'referral'
          },
          validation: [
            { type: 'required', message: 'Please enter the referrer\'s name' }
          ]
        },
        {
          id: 'coverLetter',
          type: 'textarea',
          label: 'Cover Letter / Additional Notes',
          placeholder: 'Tell us why you would be a great fit for this role...',
          rows: 6,
          maxLength: 2000,
          helperText: 'Maximum 2000 characters'
        },
        {
          id: 'agreeToTerms',
          type: 'checkbox',
          label: 'I agree to the Terms of Service and Privacy Policy',
          validation: [
            { type: 'required', message: 'You must agree to the terms to submit' }
          ]
        },
        {
          id: 'agreeToContact',
          type: 'checkbox',
          label: 'I agree to be contacted about future opportunities'
        }
      ]
    }
  ],
  submit: {
    label: 'Submit Application',
    loadingLabel: 'Submitting...'
  },
  reset: {
    label: 'Clear Form',
    show: true
  }
};

function MyForm() {
  const handleSubmit = async (values: FormValues) => {
    // Simulate API call
    console.log('📝 Form submitted with values:', values);
    
    // Show success message
    alert(`✅ Application submitted successfully!\n\nApplicant: ${values.firstName} ${values.lastName}\nEmail: ${values.email}\nDepartment: ${values.department}\n\nCheck the console for full details.`);
  };

  const handleChange = (values: FormValues) => {
    console.log('Form values changed:', values);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 Join Our Team
          </h1>
          <p className="text-lg text-gray-600">
            We're always looking for talented people to join us
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-xl p-8 md:p-10">
          <FormRenderer
            schema={jobApplicationSchema}
            onSubmit={handleSubmit}
            onChange={handleChange}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            This form demonstrates the schema-driven form engine capabilities:
          </p>
          <ul className="mt-2 space-y-1">
            <li>✅ Multiple sections with descriptions</li>
            <li>✅ All field types (text, number, select, checkbox, textarea)</li>
            <li>✅ Conditional fields with AND/OR logic</li>
            <li>✅ Comprehensive validation rules</li>
            <li>✅ Dynamic field visibility</li>
            <li>✅ Full accessibility support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MyForm;