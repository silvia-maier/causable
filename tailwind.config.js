/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './**/*.html'],
  theme: {
    extend: {
      colors: {
        'clay3': '#DA928A',
        'secondary3': '#D50058'
      },
      backgroundColor: {
        'white': '#FFFCFC',
        'grey1': '#ECECEC',
        'grey4': '#646464',
        'black': '#000000',
        'primary1': '#CCDFF1',
        'primary2': '#005DB9',
        'primary3': '#004A88',
        'primary4': '#0C3B5D',
        'secondary1': '#FCEBF2',
        'secondary2': '#F7CCDE',
        'secondary3': '#D50058',
        'secondary4': '#701D45',
        'clay1': '#F9F1EF',
        'clay2': '#E4BAB4',
        'clay3': '#DA928A',
        'clay4': '#C76D61',
        'sage1': '#BECEC3',
        'sage2': '#A7BDB4',
        'sage3': '#7D9C91',
        'sage4': '#163029',
        'autumn1': '#F6E2D3'

      },
      textColor: {
        'primary3': '#004A88',
        'primary4': '#0C3B5D',
        'white': '#FFFCFC',
        'black': '#000000',
        'dark': '#646464',
        'link': '#C12C90'
      },
      fontFamily: {
        'serif': ['Crimson Pro', 'serif'],
        'sans': ['StabilGrotesk', 'Roboto', 'sans-serif']
      },
      rotate: {
        '-25': '-25deg',
        '-30': '-30deg'
      }
    }
  },
  plugins: [require('tailwind-hamburgers')]
}

