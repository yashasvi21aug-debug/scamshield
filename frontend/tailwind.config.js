/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          slate: '#464B71',
          'slate-dark': '#383C5A',
          'slate-light': '#5A608F',
          teal: '#118AB2',
          'teal-hover': '#0E7490',
          'teal-light': '#E0F2FE',
          mint: '#7CD5C7',
          'mint-light': '#E6F8F5',
          'mint-dark': '#0F766E',
          warm: '#F2F2ED',
          surface: '#FFFFFF',
          border: '#E2E2D9',
          text: '#2A2E45',
          muted: '#64748B'
        },
        cyber: {
          950: '#F2F2ED',
          900: '#FFFFFF',
          850: '#F9F9F6',
          800: '#E2E2D9',
          700: '#D1D1C7',
          600: '#464B71',
          accent: '#118AB2',
          cyan: '#7CD5C7',
          glow: '#118AB2'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace']
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'scan-line': 'scanLine 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.03)' },
        },
        scanLine: {
          '0%': { top: '0%' },
          '50%': { top: '95%' },
          '100%': { top: '0%' },
        }
      }
    },
  },
  plugins: [],
}
