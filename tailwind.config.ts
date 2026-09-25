import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c5dbff',
          300: '#9bc4ff',
          400: '#6ea1ff',
          500: '#4376ff',
          600: '#264eff',
          700: '#1a37ec',
          800: '#1831be', // Dark blue from image
          900: '#192f96',
          950: '#111d5a',
        },
        accent: {
          500: '#f97316', // Orange from image
          600: '#ea580c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(24, 49, 190, 0.1)',
        'premium-lg': '0 20px 60px -15px rgba(24, 49, 190, 0.15)',
      }
    },
  },
  plugins: [],
}
export default config
