/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          espresso: '#2E2E2E',
          deep: '#181818',
          darker: '#121212',
          surface: '#242424',
          border: 'rgba(240, 230, 216, 0.12)'
        },
        greige: {
          DEFAULT: '#DDD5CD',
          glass: 'rgba(221, 213, 205, 0.08)',
          glassHover: 'rgba(221, 213, 205, 0.14)',
          glassActive: 'rgba(221, 213, 205, 0.20)',
          border: 'rgba(240, 230, 216, 0.15)'
        },
        limestone: {
          DEFAULT: '#F0E6D8',
          muted: '#C4B9AD',
          dark: '#9E9387'
        },
        racing: {
          red: '#DD0200',
          glow: 'rgba(221, 2, 0, 0.4)'
        },
        rosewood: {
          DEFAULT: '#7D4047',
          glow: 'rgba(125, 64, 71, 0.4)'
        },
        olive: {
          DEFAULT: '#6F7F5F',
          glow: 'rgba(111, 127, 95, 0.4)'
        },
        terracotta: {
          DEFAULT: '#B5543A',
          glow: 'rgba(181, 84, 58, 0.4)'
        },
        phyzo: {
          cyan: '#19E3F5',
          violet: '#9A5BFF',
          dark: '#0D1117'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Revoid', 'Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-glow': '0 0 25px rgba(25, 227, 245, 0.15)',
        'red-glow': '0 0 20px rgba(221, 2, 0, 0.35)',
        'olive-glow': '0 0 20px rgba(111, 127, 95, 0.35)',
        'rosewood-glow': '0 0 20px rgba(125, 64, 71, 0.35)'
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '16px'
      }
    },
  },
  plugins: [],
}
