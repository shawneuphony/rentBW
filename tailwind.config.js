/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand colors from guidelines
        primary: {
          DEFAULT: '#0F766E', // Deep Teal
          hover: '#115E59',
          light: '#D1FAF5',
          dark: '#0D5C55',
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E', // Primary
          800: '#115E59',
          900: '#134E4A',
        },
        trust: {
          DEFAULT: '#2563EB', // Trust Blue
          light: '#DBEAFE',
          dark: '#1D4ED8',
        },
        accent: {
          DEFAULT: '#F59E0B', // Amber
          light: '#FEF3C7',
          dark: '#D97706',
        },
        // Background colors
        background: '#F9FAFB',
        card: '#FFFFFF',
        // Text colors
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          tertiary: '#9CA3AF',
        },
        // Border colors
        border: {
          DEFAULT: '#E5E7EB',
          light: '#F3F4F6',
          dark: '#D1D5DB',
        },
        // Status colors
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
      },
      fontSize: {
        // Typography scale from guidelines
        'app-title': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'page-heading': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'section-heading': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'meta': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      borderRadius: {
        'lg': '10px',
        'xl': '12px',
        '2xl': '16px',
      },
      minHeight: {
        '12': '48px', // For 48px minimum button height
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)',
        'gradient-trust': 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
        'gradient-accent': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}