/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        matcha: {
          50: '#f3f7ed',
          100: '#e3eed6',
          200: '#c7dcb0',
          300: '#a4c485',
          400: '#82a85f',
          500: '#638c45',
          600: '#4c7035',
          700: '#3d592d',
          800: '#324827',
          900: '#2b3e23',
          950: '#16210f',
        },
        cream: {
          50: '#fdfcf8',
          100: '#faf8f3',
          200: '#f3f0e8',
          300: '#e9e4d6',
          400: '#d8d1bd',
        },
        clay: {
          400: '#c9a86a',
          500: '#b8915a',
          600: '#9c7846',
        },
        hanko: {
          400: '#d4574e',
          500: '#c43e35',
          600: '#a82e26',
          700: '#8a241d',
        },
        ink: {
          700: '#3d4a3a',
          800: '#2b3e23',
          900: '#1a2415',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        soft: '0 2px 12px rgba(45, 70, 35, 0.06)',
        card: '0 4px 24px rgba(45, 70, 35, 0.08), 0 1px 3px rgba(45, 70, 35, 0.04)',
        lift: '0 14px 44px rgba(45, 70, 35, 0.16), 0 2px 6px rgba(45, 70, 35, 0.06)',
        stamp: '0 2px 8px rgba(168, 46, 38, 0.18)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
