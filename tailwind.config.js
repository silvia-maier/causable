/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./**/*.html"],
  theme: {
    extend: {
      backgroundColor: {
        'primary': '#3AA1BA',
        'secondary': '#C12C90',
        'tertiary': '#1D416D',
        'dark': '#0B1828',
        'neutral': '#F4F2F0'
      },
      textColor: {
        'primary': '#3AA1BA',
        'secondary': '#C12C90',
        'tertiary': '#1D416D',
        'neutral': '#F4F2F0'
      },
      fontFamily: {
        'serif': ['Lora', 'serif'],
        'sans': ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

