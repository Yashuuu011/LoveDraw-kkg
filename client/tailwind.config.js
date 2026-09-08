/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          900: '#2A060B',
          800: '#3B0910',
          700: '#4A0E17',
          600: '#62121F',
          500: '#831B2C',
        },
        rose: {
          300: '#FFB7C5',
          400: '#F4A5B5',
          500: '#E87A90',
          600: '#D6546E',
        },
        blush: {
          50: '#FFF9F9',
          100: '#FFF0F2',
          200: '#FDE8E9',
          300: '#FAD2D4',
        },
        plum: {
          950: '#150312',
          900: '#1D0517',
          800: '#2D0B1E',
          700: '#3D102A',
        },
        gold: {
          300: '#F5E6AB',
          400: '#E6CA65',
          500: '#D4AF37',
          600: '#AA7C11',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Outfit', 'Inter', 'sans-serif'],
        romantic: ['Dancing Script', 'cursive'],
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s infinite alternate',
        'envelope-open': 'envelopeOpen 1s forwards ease-in-out',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(3deg)' },
        },
        pulseGlow: {
          '0%': { boxShadow: '0 0 15px rgba(232, 122, 144, 0.3)' },
          '100%': { boxShadow: '0 0 35px rgba(212, 175, 55, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
