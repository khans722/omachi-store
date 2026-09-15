/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: '#FFD1DC',
          pinkDark: '#FF85A1',
          rose: '#FFAAA6',
          lavender: '#E8D7FF',
          purpleDark: '#B197FC',
          mint: '#D1F2EB',
          mintDark: '#70D6BC',
          yellow: '#FFF3B0',
          yellowDark: '#FFD166',
          blue: '#D0E8FF',
          blueDark: '#74C0FC',
          cream: '#FFFDF9',
          card: '#FFFFFF',
          dark: '#4A4453'
        }
      },
      fontFamily: {
        sans: ['"Quicksand"', '"Nunito"', 'sans-serif'],
        rounded: ['"Quicksand"', 'sans-serif'],
        cute: ['"Nunito"', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 8px rgba(255, 133, 161, 0.6))' },
          '50%': { opacity: '.8', filter: 'drop-shadow(0 0 2px rgba(255, 133, 161, 0.2))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
