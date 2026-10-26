const { accent, background, foreground } = require('./src/constants/palette');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // NativeWind's web runtime throws on load with the default 'media' mode. The app is dark only.
  darkMode: 'class',
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
