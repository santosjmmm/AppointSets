/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-teal': '#1cb9d0',
        'brand-gold': '#c5a043',
        'sidebar-light': '#e1f1ee',
      },
      backgroundImage: {
        'login-gradient': "linear-gradient(180deg, #b7e4d9 0%, #fefbe0 100%)",
      }
    },
  },
  plugins: [],
}