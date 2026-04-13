/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      colors: {
        'c-accent':   'rgb(var(--ca) / <alpha-value>)',
        'c-accent-h': 'rgb(var(--ca-h) / <alpha-value>)',
        'c-body':     'rgb(var(--bg-body) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
