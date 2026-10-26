const { accent, background, foreground } = require('./src/constants/palette');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        accent,
        background,
        foreground,
      },
    },
  },
  plugins: [],
};
