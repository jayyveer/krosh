/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        krosh: {
          lavender: '#E3D0FF',
          pink: '#FFC1CC',
          blue: '#A3D2CA',
          text: '#333333',
          background: '#FFFDFD',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      height: {
        'screen-minus-nav': 'calc(100vh - 4rem)',
      },
    },
  },
  plugins: [],
};