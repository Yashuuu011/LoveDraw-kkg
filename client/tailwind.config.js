/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        marvel: {
          red: '#E23636',
          gold: '#F78F3F',
          blue: '#518CCA',
          navy: '#05162A',
          black: '#000000',
          silver: '#C0C0C0',
          purple: '#6C4298',
          green: '#28A745',
        },
        background: 'var(--background)',
        'background-secondary': 'var(--background-secondary)',
        card: 'var(--card)',
        'card-elevated': 'var(--card-elevated)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        border: 'var(--border)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
      },
      fontFamily: {
        serif: ['Orbitron', 'Playfair Display', 'Georgia', 'serif'], // Futuristic
        sans: ['Rajdhani', 'Inter', 'sans-serif'], // Technical
        comic: ['Bangers', 'cursive'],
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s infinite alternate',
        'hologram-flicker': 'hologramFlicker 4s infinite',
        'scanline': 'scanline 6s linear infinite',
        'energy-flow': 'energyFlow 3s infinite linear',
        'portal-spin': 'portalSpin 10s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(2deg)' },
        },
        pulseGlow: {
          '0%': { boxShadow: '0 0 15px var(--glow-color)' },
          '100%': { boxShadow: '0 0 35px var(--glow-color)' },
        },
        hologramFlicker: {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: '1' },
          '20%, 24%, 55%': { opacity: '0.6' },
          '22%': { opacity: '0.9' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        energyFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
        portalSpin: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.05)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
