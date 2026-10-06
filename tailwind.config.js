/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        navy: '#0d2056',
        brand: '#1c44f2',
        'brand-dark': '#1636c4',
        ink: '#4d5b7c',
        muted: '#5c6b8a',
        faint: '#7b88a3',
        placeholder: '#93a0bb',
        line: '#d7deee',
        canvas: '#f4f7fd',
      },
    },
  },
  plugins: [],
};
