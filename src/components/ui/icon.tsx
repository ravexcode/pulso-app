import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { Colors } from '@/constants/theme';

/** SF Symbol on iOS and Material Symbol on Android and web. */
export type IconName = Extract<SymbolViewProps['name'], object>;

/** Icon sizes, in points. */
const SIZES = {
  small: 16,
  medium: 22,
  large: 28,
  xlarge: 44,
} as const;

export type IconProps = {
  name: IconName;
  size?: keyof typeof SIZES;
  /** A color of `Colors`. Defaults to the main text color. */
  color?: string;
  /**
   * Text read by screen readers. Without it the icon is decorative and hidden from them, which
   * is right when a visible label sits next to it.
   */
  label?: string;
};

export function Icon({ name, size = 'medium', color = Colors.dark.text, label }: IconProps) {
  const isDecorative = label === undefined;
  return (
    <SymbolView
      name={{ ...name, web: name.web ?? name.android }}
      size={SIZES[size]}
      tintColor={color}
      accessible={!isDecorative}
      accessibilityLabel={label}
      accessibilityElementsHidden={isDecorative}
      importantForAccessibility={isDecorative ? 'no-hide-descendants' : 'yes'}
    />
  );
}
