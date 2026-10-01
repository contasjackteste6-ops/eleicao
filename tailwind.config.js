/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: [
    './app/components/**/*.{js,vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
    './app/error.vue',
    './nuxt.config.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e6f0fa',
          100: '#cce1f5',
          200: '#99c3eb',
          300: '#66a5e0',
          400: '#3387d6',
          500: '#0066cc',
          600: '#0052a3',
          700: '#003b70',
          800: '#002b54',
          900: '#001d40',
        },
        gov: {
          green: '#00A859',
          yellow: '#FFCC00',
          blue: '#003B70',
        }
      },
      fontFamily: {
        sans: ['"Bai Jamjuree"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}
