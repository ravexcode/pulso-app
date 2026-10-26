/**
 * Colors used by the themed components. They come from the same grayscale palette as the
 * NativeWind classes (`bg-background`, `text-foreground`, `bg-accent-200`, ...).
 * The app is dark only, so both schemes share the same values.
 */

import { Platform } from 'react-native';

import { accent, background, foreground } from '@/constants/palette';

const darkColors = {
  text: foreground.DEFAULT,
  background: background.DEFAULT,
  backgroundElement: background[600],
  backgroundSelected: background[400],
  textSecondary: foreground.muted,
  accent: accent.DEFAULT,
  textOnAccent: foreground.inverse,
} as const;

export const Colors = {
  light: darkColors,
  dark: darkColors,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
