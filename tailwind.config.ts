import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A1A1A',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#D4830A',
          foreground: '#FFFFFF',
          soft: '#FBEDD6',
          deep: '#B86E08',
        },
        background: '#FFFFFF',
        muted: {
          DEFAULT: '#F5F5F5',
          foreground: '#666666',
        },
        success: {
          DEFAULT: '#27AE60',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#F39C12',
          foreground: '#FFFFFF',
        },
        error: {
          DEFAULT: '#C0392B',
          foreground: '#FFFFFF',
        },
        info: {
          DEFAULT: '#2980B9',
          foreground: '#FFFFFF',
        },
        textPrimary: '#1A1A1A',
        textMuted: '#666666',
        textDisabled: '#B0B0B0',
        line: '#E7E4DF',
        fill: {
          DEFAULT: '#F1EFEB',
          soft: '#F7F5F2',
        },
        card: {
          DEFAULT: '#F5F5F5',
          foreground: '#1A1A1A',
        },
        border: '#E7E4DF',
        input: '#E7E4DF',
        ring: '#D4830A',
        foreground: '#1A1A1A',
        secondary: {
          DEFAULT: '#F5F5F5',
          foreground: '#1A1A1A',
        },
        destructive: {
          DEFAULT: '#C0392B',
          foreground: '#FFFFFF',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        mono: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '12px',
        md: '10px',
        sm: '8px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(26,26,26,0.06), 0 1px 2px rgba(26,26,26,0.04)',
        DEFAULT: '0 4px 6px rgba(26,26,26,0.07), 0 2px 4px rgba(26,26,26,0.05)',
        lg: '0 12px 32px rgba(26,26,26,0.14)',
      },
    },
  },
  plugins: [],
}

export default config
