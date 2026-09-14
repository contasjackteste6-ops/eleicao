/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'
import colors from 'tailwindcss/colors'

export default {
  darkMode: 'class',
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
        background: {
          light: '#ffffff',
          lightSecondary: '#fafafa',
          lightTertiary: '#f2f2f2',
          dark: '#000000',
          darkSecondary: '#0a0a0a',
          darkTertiary: '#111111',
        },
        foreground: {
          light: '#171717',
          lightSecondary: '#666666',
          lightMuted: '#888888',
          lightSubtle: '#a1a1a1',
          dark: '#ededed',
          darkSecondary: '#a1a1a1',
          darkMuted: '#888888',
          darkSubtle: '#666666',
        },
        primary: {
          50: '#e6fdf5',
          100: '#ccfbeb',
          200: '#99f7d7',
          300: '#66f3c3',
          400: '#33efaf',
          500: '#00DC81',
          600: '#00b067',
          700: '#00844d',
          800: '#005833',
          900: '#002c1a',
          950: '#001a0f',
        },
        secondary: {
          ...colors.indigo,
          DEFAULT: colors.indigo[600],
        },
        success: {
          ...colors.emerald,
          DEFAULT: colors.emerald[500],
        },
        danger: {
          ...colors.rose,
          DEFAULT: colors.rose[600],
        },
        warning: {
          ...colors.amber,
          DEFAULT: colors.amber[500],
        },
        info: {
          ...colors.sky,
          DEFAULT: colors.sky[500],
        },
        gray: colors.slate,
        surface: {
          DEFAULT: '#ffffff',
          muted: '#fafafa',
          raised: '#ffffff',
          hover: '#f2f2f2',
          inverted: '#000000',
          dark: '#0a0a0a',
          'dark-muted': '#111111',
          'dark-raised': '#111111',
          'dark-hover': '#1a1a1a',
        },
        border: {
          DEFAULT: '#eaeaea',
          muted: '#f2f2f2',
          strong: '#d4d4d4',
          dark: '#262626',
          'dark-muted': '#1a1a1a',
          'dark-strong': '#333333',
        },
        input: {
          DEFAULT: '#fafafa',
          hover: '#f2f2f2',
          disabled: '#f2f2f2',
          dark: '#111111',
          'dark-hover': '#1a1a1a',
          'dark-disabled': '#0a0a0a',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', ...defaultTheme.fontFamily.sans],
        mono: ['Geist Mono', ...defaultTheme.fontFamily.mono],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      spacing: {
        18: '4.5rem',
        112: '28rem',
        128: '32rem',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0, 0, 0, 0.04)',
        panel: '0 8px 20px rgba(0, 0, 0, 0.06)',
        focus: '0 0 0 3px rgba(0, 220, 129, 0.22)',
        'focus-danger': '0 0 0 3px rgba(225, 29, 72, 0.22)',
      },
      minHeight: {
        touch: '2.75rem',
      },
      maxWidth: {
        content: '72rem',
      },
    },
  },
  plugins: [],
}
