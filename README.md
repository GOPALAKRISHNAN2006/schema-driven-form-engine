# Schema-Driven Dynamic Form Builder(SDDFB)

A zero-dependency form engine built with React 18, TypeScript (strict mode), Vite, and Tailwind CSS. Fully accessible, tested via Storybook, and deployed via Chromatic.

[![Chromatic](https://img.shields.io/badge/Chromatic-View%20Storybook-ff4785)](https://www.chromatic.com/library?appId=697af24e6bd167be1e8765e7)

> **📚 Live Storybook**: [View on Chromatic](https://697af24e6bd167be1e8765e7-ikirlsakqe.chromatic.com/)

## 🎯 Project Goals

- **Schema-first**: Forms are defined as JSON schemas, not code
- **Zero form libraries**: No Formik, React Hook Form, or similar
- **Zero UI libraries**: All primitives built from scratch
- **Fully accessible**: WCAG 2.1 AA compliant
- **Type-safe**: Strict TypeScript throughout
- **Visual testing**: Storybook + Chromatic

---

## 📁 Project Structure

```
src/
├── components/
│   ├── primitives/         # Atomic UI components
│   │   ├── Input.tsx       # Base input element
│   │   ├── Select.tsx      # Base select element
│   │   ├── Checkbox.tsx    # Base checkbox element
│   │   ├── Button.tsx      # Button variants
│   │   ├── Label.tsx       # Form labels
│   │   └── ErrorMessage.tsx
│   │
│   ├── fields/             # Schema-aware field components
│   │   ├── TextField.tsx
│   │   ├── NumberField.tsx
│   │   ├── SelectField.tsx
│   │   ├── CheckboxField.tsx
│   │   └── FieldRenderer.tsx  # Factory component
│   │
│   ├── form/               # Form-level components
│   │   ├── FormRenderer.tsx   # Main entry point
│   │   ├── FormSection.tsx
│   │   ├── RepeatableSection.tsx
│   │   └── FormActions.tsx
│   │
│   └── feedback/           # User feedback
│       ├── AutosaveIndicator.tsx
│       ├── ConflictModal.tsx
│       └── LoadingSpinner.tsx
│
├── schema/                 # Schema definition layer
│   ├── types.ts           # TypeScript interfaces
│   ├── examples.ts        # Example schemas
│   ├── parser.ts          # Schema validation
│   └── resolver.ts        # Dependency resolution
│
├── state/                  # State management
│   ├── FormContext.tsx    # React Context + hooks
│   ├── actions.ts         # Action types & creators
│   └── reducer.ts         # State reducer
│
├── validation/             # Validation pipeline
│   ├── types.ts
│   ├── sync-validators.ts
│   ├── async-validators.ts
│   └── pipeline.ts
│
├── hooks/                  # Custom React hooks
│   ├── useField.ts
│   ├── useValidation.ts
│   ├── useAutosave.ts
│   ├── useAsyncOptions.ts
│   └── useConditional.ts
│
├── utils/                  # Pure utilities
│   ├── focus.ts
│   ├── a11y.ts
│   ├── storage.ts
│   └── deep-get-set.ts
│
└── stories/                # Storybook stories
    ├── primitives/
    ├── fields/
    ├── form/
    └── scenarios/
```

---

## 🏗️ Architecture Overview

### 1. Schema Layer (`src/schema/`)

Defines the structure of forms using TypeScript interfaces:

```typescript
// Example: Simple form schema
const schema: FormSchema = {
  id: 'contact-form',
  title: 'Contact Us',
  sections: [{
    id: 'info',
    fields: [{
      id: 'email',
      type: 'text',
      label: 'Email',
      validation: [
        { type: 'required', message: 'Required' },
        { type: 'email', message: 'Invalid email' }
      ]
    }]
  }]
};
```

Key types:
- `FormSchema` - Top-level form definition
- `SectionSchema` - Groups of fields (can be repeatable)
- `FieldSchema` - Individual field (discriminated union by `type`)
- `ValidationRule` - Declarative validation rules
- `Condition` - Conditional visibility expressions

### 2. State Layer (`src/state/`)

Uses React Context + useReducer pattern:

```
┌─────────────────────────────────────┐
│           FormProvider              │
│  ┌─────────────────────────────┐   │
│  │   FormContext (state)        │   │
│  │   - values                   │   │
│  │   - fields (touched/errors)  │   │
│  │   - autosave state           │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │   DispatchContext (actions)  │   │
│  │   - setFieldValue            │   │
│  │   - setFieldError            │   │
│  │   - resetForm                │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

Why two contexts? Prevents re-renders in components that only dispatch.

### 3. Component Hierarchy

```
FormRenderer
├── FormSection
│   ├── FieldRenderer (factory)
│   │   ├── TextField → Input (primitive)
│   │   ├── SelectField → Select (primitive)
│   │   └── CheckboxField → Checkbox (primitive)
│   └── RepeatableSection
│       └── [instances] → FieldRenderer...
├── FormActions
│   └── Button (primitive)
└── AutosaveIndicator
```

### 4. Validation Pipeline

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│ Field Input │───▶│ Sync Rules   │───▶│ Async Rules  │
│             │    │ (immediate)  │    │ (debounced)  │
└─────────────┘    └──────────────┘    └──────────────┘
                          │                    │
                          ▼                    ▼
                   ┌──────────────────────────────┐
                   │      State Update            │
                   │  dispatch(setFieldError())   │
                   └──────────────────────────────┘
```

### 5. Conditional Rendering Flow

```
1. User changes field value
2. Reducer updates state.values
3. FieldRenderer calls useConditional(field.showWhen)
4. Hook evaluates condition against state.values
5. If false: field not rendered (removed from DOM)
6. Resolver clears hidden field values to prevent
   required validation on invisible fields
```

---

## 🎨 Storybook Story Plan

### Primitives (`stories/primitives/`)
- **Input.stories.tsx**
  - Default, Disabled, Error state, With placeholder
  - Keyboard focus test
- **Select.stories.tsx**
  - Default, With options, Disabled, Loading
- **Checkbox.stories.tsx**
  - Unchecked, Checked, Indeterminate, Disabled
- **Button.stories.tsx**
  - Primary, Secondary, Loading, Disabled

### Fields (`stories/fields/`)
- **TextField.stories.tsx**
  - With label, With help text, With error, Required
- **NumberField.stories.tsx**
  - With min/max, Step increments
- **SelectField.stories.tsx**
  - Static options, Async loading, Dependent dropdown
- **FieldRenderer.stories.tsx**
  - Renders correct field type

### Forms (`stories/form/`)
- **FormRenderer.stories.tsx**
  - Contact form (basic)
  - Registration form (conditional)
  - Order form (repeatable sections)

### Scenarios (`stories/scenarios/`)
- **ConditionalFields.stories.tsx**
  - Show/hide based on selection
  - Complex AND/OR conditions
- **AsyncValidation.stories.tsx**
  - Username availability check
  - Debounced validation
- **AsyncSelect.stories.tsx**
  - Country → State cascade
  - Loading states
- **Autosave.stories.tsx**
  - Draft persistence
  - Conflict resolution modal
- **Accessibility.stories.tsx**
  - Keyboard-only navigation demo
  - Screen reader announcements
- **HighContrast.stories.tsx**
  - Windows High Contrast mode support

---

## ♿ Accessibility Features

1. **Keyboard Navigation**
   - Tab through all form fields
   - Arrow keys in select/radio groups
   - Escape to close modals
   - Focus management on section add/remove

2. **Screen Reader Support**
   - Proper `<label>` associations
   - `aria-describedby` for help text
   - `aria-invalid` and `aria-errormessage` for errors
   - `aria-live` regions for dynamic content
   - Form submission announcements

3. **Visual Accessibility**
   - Minimum 4.5:1 color contrast
   - Visible focus indicators
   - High contrast mode support
   - `prefers-reduced-motion` respected

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start Storybook
npm run storybook

# Build Storybook for deployment
npm run build-storybook

# Deploy to Chromatic
npm run chromatic
```

---

## 🔧 Implementation Phases

### Phase 1: Primitives
Build atomic UI components with accessibility baked in.

### Phase 2: State Management
Implement context, reducer, and core hooks.

### Phase 3: Field Components
Build schema-aware field wrappers.

### Phase 4: Form Renderer
Implement main form component with section rendering.

### Phase 5: Validation
Build sync and async validation pipeline.

### Phase 6: Conditional Logic
Implement showWhen condition evaluator.

### Phase 7: Repeatable Sections
Add/remove section instances.

### Phase 8: Autosave
Draft persistence and conflict detection.

### Phase 9: Storybook Stories
Create comprehensive story coverage.

### Phase 10: Chromatic Deployment
Visual regression testing setup.

---

## 📝 Design Decisions

| Decision | Rationale |
|----------|-----------|
| No form libraries | Educational, full control, no magic |
| Discriminated unions | Exhaustive type checking for fields |
| Declarative validation | Schema remains JSON-serializable |
| Separate contexts | Prevent unnecessary re-renders |
| Condition expressions | Support complex visibility logic |
| Debounced async validation | Prevent API spam |
| localStorage for drafts | Works offline, no backend needed |

---

## 🧪 Testing Strategy

1. **Unit Tests** (Vitest)
   - Schema parsing
   - Condition evaluation
   - Validation rules
   - Reducer logic

2. **Component Tests** (Testing Library)
   - Field interactions
   - Form submission
   - Error display

3. **Visual Tests** (Chromatic)
   - Capture every story
   - Detect visual regressions
   - Review in PR workflow

4. **A11y Tests** (Storybook addon)
   - Axe-core integration
   - Automated WCAG checks
