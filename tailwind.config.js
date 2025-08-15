/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'assistant': ['Assistant', 'sans-serif'],
        'fredoka': ['Fredoka', 'sans-serif'],
        'heebo': ['Heebo', 'sans-serif'],
        'rubik-scribble': ['Rubik Scribble', 'cursive'],
        'sans': ['Assistant', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}