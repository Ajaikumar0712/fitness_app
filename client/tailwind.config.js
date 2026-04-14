/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#00D4AA', dark: '#00B894', light: '#00FFCC' },
        secondary: { DEFAULT: '#6366F1', dark: '#4F46E5', light: '#818CF8' },
        surface:   { DEFAULT: '#1E293B', hover: '#263449', card: '#162032' },
        bg:        { DEFAULT: '#0F172A', alt: '#0A1120' },
        danger:    '#EF4444',
        warning:   '#F97316',
        success:   '#10B981',
        info:      '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'spin-slow':  'spin 3s linear infinite',
        'count-up':   'countUp 1s ease-out',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseGlow: { '0%,100%': { boxShadow: '0 0 8px rgba(0,212,170,0.4)' }, '50%': { boxShadow: '0 0 24px rgba(0,212,170,0.8)' } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
