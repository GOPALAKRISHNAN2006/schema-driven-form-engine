import type { Preview } from "@storybook/react";
import "../src/index.css"; // Import Tailwind styles

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // A11y addon configuration
    a11y: {
      // Axe configuration
      config: {
        rules: [
          // Require color contrast ratio
          { id: 'color-contrast', enabled: true },
          // Require form labels
          { id: 'label', enabled: true },
        ],
      },
      // Show a11y violations in the panel
      manual: false,
    },
    // Viewport presets for responsive testing
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1280px', height: '800px' },
        },
      },
    },
    // Background options including high contrast
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'gray', value: '#f3f4f6' },
        { name: 'dark', value: '#1f2937' },
        { name: 'high-contrast', value: '#000000' },
      ],
    },
  },
  // Global decorators
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
  // Global tags for autodocs
  tags: ["autodocs"],
};

export default preview;
