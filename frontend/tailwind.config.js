/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ing: {
          orange: '#FF6200',
          navy: '#000066',
          slate: '#0C112B',
          lightBg: '#F8F9FA'
        }
      }
    },
  },
  plugins: [],
}
