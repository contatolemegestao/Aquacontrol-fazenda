/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#bae0ff',
          500: '#1A56DB', // User primary accent color #1A56DB
          600: '#1e429f',
          700: '#1a365d',
          800: '#1e293b',
        }
      }
    },
  },
  plugins: [],
}
