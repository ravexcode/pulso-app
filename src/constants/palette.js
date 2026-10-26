/**
 * Grayscale palette shared by Tailwind (NativeWind) and `constants/theme.ts`.
 * Kept as CommonJS so `tailwind.config.js` can require it.
 *
 * Both scales go from lighter (100) to darker (900), like Tailwind's defaults:
 * - accent:     starts at the accent color #FAFAFA (100) and darkens to a mid gray.
 * - background: ends at the background color #010101 (900); lighter steps are elevated surfaces.
 *
 * Every accent step keeps at least 4.5:1 contrast on `background` (WCAG AA).
 */
const accent = {
  DEFAULT: '#FAFAFA',
  100: '#FAFAFA',
  200: '#E9E9E9',
  300: '#D9D9D9',
  400: '#C8C8C8',
  500: '#B8B8B8',
  600: '#A7A7A7',
  700: '#969696',
  800: '#868686',
  900: '#757575',
};

const background = {
  DEFAULT: '#010101',
  100: '#3D3D3D',
  200: '#363636',
  300: '#2E2E2E',
  400: '#272727',
  500: '#1F1F1F',
  600: '#181818',
  700: '#101010',
  800: '#090909',
  900: '#010101',
};

/**
 * Text adapts to the surface it sits on:
 * - On `background` surfaces use `foreground` (light text).
 * - On `accent` surfaces use `foreground.inverse` (dark text).
 */
const foreground = {
  DEFAULT: accent[100],
  muted: accent[400],
  subtle: accent[700],
  inverse: background[900],
};

module.exports = { accent, background, foreground };
