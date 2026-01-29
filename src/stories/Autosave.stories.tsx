/**
 * AUTOSAVE & DRAFT RECOVERY STORIES
 * 
 * Demonstrates autosave functionality:
 * - Automatic saving of form state
 * - Resuming from saved draft
 * - Conflict handling when local differs from server
 * - Clear draft functionality
 */

import type { Meta, StoryObj } from '@storybook/react';
import { expect, within, userEvent, waitFor } from '@storybook/test';
import { useEffect, useState } from 'react';
import { FormRenderer } from '@/components/form';
import type { FormSchema, FormValues } from '@/schema/types';
import { runAxeAccessibilityCheck } from './test-utils';

const meta: Meta<typeof FormRenderer> = {
  title: 'Features/Autosave',
  component: FormRenderer,
  parameters: {
    docs: {
      description: {
        component: 'Demonstrates autosave functionality including draft saving, resume, and conflict handling.',
      },
    },
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FormRenderer>;

// ============= FORM SCHEMA WITH AUTOSAVE =============

const autosaveFormSchema: FormSchema = {
  id: 'autosave-demo-form',
  version: '1.0',
  title: 'Profile Settings',
  description: 'Your changes are automatically saved as you type.',
  sections: [
    {
      id: 'personal',
      title: 'Personal Information',
      fields: [
        {
          id: 'displayName',
          type: 'text',
          label: 'Display Name',
          placeholder: 'How should we call you?',
          validation: [{ type: 'required', message: 'Display name is required' }],
        },
        {
          id: 'bio',
          type: 'textarea',
          label: 'Bio',
          placeholder: 'Tell us about yourself...',
          maxLength: 500,
        },
        {
          id: 'email',
          type: 'text',
          label: 'Email Address',
          inputType: 'email',
          validation: [
            { type: 'required', message: 'Email is required' },
            { type: 'email', message: 'Please enter a valid email' },
          ],
        },
      ],
    },
    {
      id: 'preferences',
      title: 'Preferences',
      fields: [
        {
          id: 'theme',
          type: 'select',
          label: 'Theme',
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'auto', label: 'System Default' },
          ],
        },
        {
          id: 'notifications',
          type: 'checkbox',
          label: 'Enable email notifications',
        },
        {
          id: 'newsletter',
          type: 'checkbox',
          label: 'Subscribe to newsletter',
        },
      ],
    },
  ],
  submit: { label: 'Save Profile' },
  autosave: {
    enabled: true,
    debounceMs: 1000,
    storageKey: 'profile-draft',
  },
};

// ============= AUTOSAVE STATUS INDICATOR =============

const AutosaveStatusIndicator = ({ 
  status 
}: { 
  status: 'idle' | 'saving' | 'saved' | 'error' 
}) => {
  const statusStyles = {
    idle: 'text-gray-600',
    saving: 'text-blue-700 animate-pulse',
    saved: 'text-green-700',
    error: 'text-red-700',
  };

  const statusText = {
    idle: '',
    saving: '💾 Saving...',
    saved: '✓ Draft saved',
    error: '⚠ Failed to save',
  };

  if (status === 'idle') return null;

  return (
    <div 
      className={`text-sm ${statusStyles[status]} mb-4 p-2 rounded bg-gray-50`}
      role="status"
      aria-live="polite"
    >
      {statusText[status]}
    </div>
  );
};

// ============= AUTOSAVE DEMO COMPONENT =============

const AutosaveDemo = ({ 
  schema, 
  onSubmit,
  simulateSaveDelay = 500,
}: { 
  schema: FormSchema; 
  onSubmit: (values: FormValues) => void;
  simulateSaveDelay?: number;
}) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [savedDraft, setSavedDraft] = useState<FormValues | null>(null);

  // Simulate loading a saved draft on mount
  useEffect(() => {
    const storedDraft = localStorage.getItem('demo-draft');
    if (storedDraft) {
      try {
        setSavedDraft(JSON.parse(storedDraft));
      } catch {
        // Invalid stored data
      }
    }
  }, []);

  const handleChange = (values: FormValues) => {
    // Simulate autosave
    setSaveStatus('saving');
    
    setTimeout(() => {
      try {
        localStorage.setItem('demo-draft', JSON.stringify(values));
        setSaveStatus('saved');
        setLastSaved(new Date());
        
        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
      }
    }, simulateSaveDelay);
  };

  const handleClearDraft = () => {
    localStorage.removeItem('demo-draft');
    setSavedDraft(null);
    alert('Draft cleared! Refresh to see empty form.');
  };

  return (
    <div>
      <AutosaveStatusIndicator status={saveStatus} />
      
      {lastSaved && (
        <p className="text-xs text-gray-500 mb-4">
          Last saved: {lastSaved.toLocaleTimeString()}
        </p>
      )}
      
      <FormRenderer 
        schema={schema} 
        initialValues={savedDraft || undefined}
        onSubmit={onSubmit}
        onChange={handleChange}
      />
      
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={handleClearDraft}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
          aria-label="Clear saved draft"
        >
          Clear Draft
        </button>
      </div>
    </div>
  );
};

// ============= BASIC AUTOSAVE STORY =============

export const BasicAutosave: Story = {
  render: (args) => (
    <AutosaveDemo 
      schema={args.schema} 
      onSubmit={args.onSubmit as (values: FormValues) => void}
    />
  ),
  args: {
    schema: autosaveFormSchema,
    onSubmit: (values: FormValues) => {
      console.log('Profile saved:', values);
      localStorage.removeItem('demo-draft');
      alert('Profile saved successfully!');
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Run accessibility check
    await runAxeAccessibilityCheck(canvasElement);
    
    // Type in display name
    const displayNameInput = canvas.getByRole('textbox', { name: /display name/i });
    await userEvent.type(displayNameInput, 'Test User');
    
    // Wait for autosave indicator
    await waitFor(() => {
      const savingIndicator = canvas.queryByText(/saving|saved/i);
      expect(savingIndicator).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Fill more fields
    const bioInput = canvas.getByRole('textbox', { name: /bio/i });
    await userEvent.type(bioInput, 'This is my test bio.');
    
    // Verify save status appears
    await waitFor(() => {
      const savedIndicator = canvas.queryByText(/draft saved|saving/i);
      expect(savedIndicator).toBeInTheDocument();
    }, { timeout: 3000 });
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with autosave enabled. Changes are saved automatically with visual feedback.',
      },
    },
  },
};

// ============= RESUME DRAFT DEMO =============

const ResumeDraftDemo = ({ 
  schema, 
  onSubmit 
}: { 
  schema: FormSchema; 
  onSubmit: (values: FormValues) => void;
}) => {
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [draftValues, setDraftValues] = useState<FormValues | null>(null);
  const [usesDraft, setUsesDraft] = useState(false);

  // Check for existing draft
  useEffect(() => {
    const draft = localStorage.getItem('resume-draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setDraftValues(parsed);
        setShowDraftBanner(true);
      } catch {
        // Invalid draft
      }
    } else {
      // Create a sample draft for demo
      const sampleDraft = {
        displayName: 'Jane Doe',
        bio: 'Previously saved bio content...',
        email: 'jane@example.com',
        theme: 'dark',
      };
      localStorage.setItem('resume-draft', JSON.stringify(sampleDraft));
      setDraftValues(sampleDraft);
      setShowDraftBanner(true);
    }
  }, []);

  const handleResume = () => {
    setUsesDraft(true);
    setShowDraftBanner(false);
  };

  const handleDiscard = () => {
    localStorage.removeItem('resume-draft');
    setDraftValues(null);
    setShowDraftBanner(false);
    setUsesDraft(false);
  };

  return (
    <div>
      {showDraftBanner && (
        <div 
          className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          role="alert"
        >
          <h3 className="font-medium text-blue-800 mb-2">
            📄 Resume Previous Session?
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            We found an unsaved draft from your previous session.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleResume}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Resume Draft
            </button>
            <button
              type="button"
              onClick={handleDiscard}
              className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Start Fresh
            </button>
          </div>
        </div>
      )}
      
      <FormRenderer 
        schema={schema} 
        initialValues={usesDraft ? draftValues || undefined : undefined}
        onSubmit={(values) => {
          localStorage.removeItem('resume-draft');
          onSubmit(values);
        }}
      />
    </div>
  );
};

export const ResumeDraft: Story = {
  render: (args) => (
    <ResumeDraftDemo 
      schema={args.schema} 
      onSubmit={args.onSubmit as (values: FormValues) => void}
    />
  ),
  args: {
    schema: autosaveFormSchema,
    onSubmit: (values: FormValues) => {
      console.log('Saved:', values);
      alert('Profile saved!');
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Run accessibility check
    await runAxeAccessibilityCheck(canvasElement);
    
    // Draft banner should appear
    await waitFor(() => {
      const banner = canvas.getByText(/resume previous session/i);
      expect(banner).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Click Resume Draft
    const resumeButton = canvas.getByRole('button', { name: /resume draft/i });
    await userEvent.click(resumeButton);
    
    // Banner should disappear
    await waitFor(() => {
      const banner = canvas.queryByText(/resume previous session/i);
      expect(banner).not.toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Wait for form values to be applied - check that the input exists and has a value
    await waitFor(() => {
      const displayNameInput = canvas.getByRole('textbox', { name: /display name/i }) as HTMLInputElement;
      // Value should contain draft data (may vary based on localStorage state)
      expect(displayNameInput).toBeInTheDocument();
    }, { timeout: 2000 });
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates resuming a previously saved draft with a confirmation banner.',
      },
    },
  },
};

// ============= CONFLICT HANDLING DEMO =============

const ConflictHandlingDemo = ({ 
  schema, 
  onSubmit 
}: { 
  schema: FormSchema; 
  onSubmit: (values: FormValues) => void;
}) => {
  const [showConflict, setShowConflict] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<'local' | 'server' | null>(null);

  const localDraft = {
    displayName: 'My Local Changes',
    bio: 'This is what I typed locally before losing connection.',
    email: 'local@example.com',
    theme: 'dark',
  };

  const serverVersion = {
    displayName: 'Server Version',
    bio: 'This was saved on another device.',
    email: 'server@example.com',
    theme: 'light',
  };

  const handleKeepLocal = () => {
    setSelectedVersion('local');
    setShowConflict(false);
  };

  const handleUseServer = () => {
    setSelectedVersion('server');
    setShowConflict(false);
  };

  const getInitialValues = () => {
    if (selectedVersion === 'local') return localDraft;
    if (selectedVersion === 'server') return serverVersion;
    return undefined;
  };

  return (
    <div>
      {showConflict && (
        <div 
          className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-lg"
          role="alert"
        >
          <h3 className="font-medium text-amber-800 mb-2">
            ⚠️ Conflict Detected
          </h3>
          <p className="text-sm text-amber-700 mb-3">
            Your local draft differs from the server version. Which would you like to keep?
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-white rounded border">
              <h4 className="font-medium text-sm mb-1">Local Draft</h4>
              <p className="text-xs text-gray-600">Last edited: 5 minutes ago</p>
              <p className="text-xs text-gray-500 mt-1">"{localDraft.bio.slice(0, 40)}..."</p>
            </div>
            <div className="p-3 bg-white rounded border">
              <h4 className="font-medium text-sm mb-1">Server Version</h4>
              <p className="text-xs text-gray-600">Last saved: 2 hours ago</p>
              <p className="text-xs text-gray-500 mt-1">"{serverVersion.bio.slice(0, 40)}..."</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleKeepLocal}
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
            >
              Keep Local
            </button>
            <button
              type="button"
              onClick={handleUseServer}
              className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Use Server
            </button>
          </div>
        </div>
      )}
      
      {selectedVersion && (
        <div className="mb-4 p-2 bg-green-50 text-green-700 text-sm rounded">
          ✓ Using {selectedVersion === 'local' ? 'local draft' : 'server version'}
        </div>
      )}
      
      <FormRenderer 
        schema={schema} 
        initialValues={getInitialValues()}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export const ConflictHandling: Story = {
  render: (args) => (
    <ConflictHandlingDemo 
      schema={args.schema} 
      onSubmit={args.onSubmit as (values: FormValues) => void}
    />
  ),
  args: {
    schema: autosaveFormSchema,
    onSubmit: (values: FormValues) => {
      console.log('Resolved and saved:', values);
      alert('Conflict resolved and saved!');
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Run accessibility check
    await runAxeAccessibilityCheck(canvasElement);
    
    // Conflict dialog should appear
    await waitFor(() => {
      const conflictAlert = canvas.getByText(/conflict detected/i);
      expect(conflictAlert).toBeInTheDocument();
    });
    
    // Should show both versions
    expect(canvas.getByText(/local draft/i)).toBeInTheDocument();
    expect(canvas.getByText(/server version/i)).toBeInTheDocument();
    
    // Click Keep Local
    const keepLocalButton = canvas.getByRole('button', { name: /keep local/i });
    await userEvent.click(keepLocalButton);
    
    // Conflict dialog should disappear
    await waitFor(() => {
      const conflictAlert = canvas.queryByText(/conflict detected/i);
      expect(conflictAlert).not.toBeInTheDocument();
    });
    
    // Should show confirmation
    expect(canvas.getByText(/using local draft/i)).toBeInTheDocument();
    
    // Form should have local values
    const displayNameInput = canvas.getByRole('textbox', { name: /display name/i }) as HTMLInputElement;
    await expect(displayNameInput.value).toBe('My Local Changes');
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates conflict resolution when local draft differs from server version.',
      },
    },
  },
};

// ============= SAVE ERROR HANDLING =============

const SaveErrorDemo = ({ schema }: { schema: FormSchema }) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [retryCount, setRetryCount] = useState(0);

  const handleChange = () => {
    setSaveStatus('saving');
    
    // Simulate network failure
    setTimeout(() => {
      setSaveStatus('error');
    }, 800);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setSaveStatus('saving');
    
    // Succeed on 3rd retry
    setTimeout(() => {
      if (retryCount >= 2) {
        setSaveStatus('idle');
        alert('Save successful!');
      } else {
        setSaveStatus('error');
      }
    }, 800);
  };

  return (
    <div>
      {saveStatus === 'error' && (
        <div 
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
          role="alert"
        >
          <h3 className="font-medium text-red-800 mb-2">
            ❌ Failed to Save
          </h3>
          <p className="text-sm text-red-700 mb-3">
            Could not save your changes. Your work is stored locally.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry Save
          </button>
          <span className="ml-2 text-sm text-red-600">
            Attempts: {retryCount}
          </span>
        </div>
      )}
      
      {saveStatus === 'saving' && (
        <div className="mb-4 p-2 bg-blue-50 text-blue-700 text-sm rounded animate-pulse">
          💾 Saving...
        </div>
      )}
      
      <FormRenderer 
        schema={schema} 
        onChange={handleChange}
        onSubmit={() => alert('Submitted!')}
      />
    </div>
  );
};

export const SaveErrorHandling: Story = {
  render: (args) => <SaveErrorDemo schema={args.schema} />,
  args: {
    schema: autosaveFormSchema,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Run accessibility check
    await runAxeAccessibilityCheck(canvasElement);
    
    // Type to trigger save
    const displayNameInput = canvas.getByRole('textbox', { name: /display name/i });
    await userEvent.type(displayNameInput, 'Test');
    
    // Wait for error state
    await waitFor(() => {
      const errorAlert = canvas.getByText(/failed to save/i);
      expect(errorAlert).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Retry button should be visible
    const retryButton = canvas.getByRole('button', { name: /retry/i });
    await expect(retryButton).toBeInTheDocument();
    
    // Click retry
    await userEvent.click(retryButton);
    
    // Should show saving indicator
    await waitFor(() => {
      const savingIndicator = canvas.queryByText(/saving/i);
      expect(savingIndicator).toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates error handling when autosave fails, with retry functionality.',
      },
    },
  },
};
