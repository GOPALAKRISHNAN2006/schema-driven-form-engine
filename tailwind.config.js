/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom focus ring for accessibility
      ringWidth: {
        'focus': '2px',
      },
      ringOffsetWidth: {
        'focus': '2px',
      },
      // Animation for loading states
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'pulse-subtle': 'pulse 3s ease-in-out infinite',
      },
      // Custom colors for form states
      colors: {
        // Error state
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        // Success state
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
        },
        // Warning state
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
    },
  },
  plugins: [],
  // Ensure dark mode uses class strategy for better control
  darkMode: 'class',
}
