/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        theme: {
          light: {
            primary: '#ffffff',
            secondary: '#f3f4f6',
            hover: '#e5e7eb',
            border: '#d1d5db',
            text: {
              primary: '#111827',
              secondary: '#4b5563'
            }
          },
          dark: {
            primary: '#141414',
            secondary: '#1a1a1a',
            hover: '#242424',
            border: '#2a2a2a',
            text: {
              primary: '#ffffff',
              secondary: '#9ca3af'
            }
          }
        }
      }
    }
  },
  plugins: [],
}