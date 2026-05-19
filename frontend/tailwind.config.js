/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        copper: {
          50: '#fffbf0',
          100: '#fef3d6',
          200: '#fce3aa',
          300: '#f9cb73',
          400: '#f5ab3e',
          500: '#ea8416', // Core Metallic Copper Gold
          600: '#d1660d',
          700: '#ae4a0d',
          800: '#8c3a10',
          900: '#733110',
          950: '#411705',
        },
        slate: {
          950: '#070a13', // Ultra dark blue-slate for deep aesthetics
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'copper-glow': '0 0 15px rgba(234, 132, 22, 0.15)',
        'copper-glow-lg': '0 0 30px rgba(234, 132, 22, 0.3)',
      }
    },
  },
  plugins: [],
}
