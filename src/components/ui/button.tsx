import { Pressable, Text, View, type PressableProps } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Colors } from '@/constants/theme';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  title: string;
  /**
   * `primary` is a filled accent button for the main action of a screen. `secondary` is a gray
   * filled button, like the iOS "gray" style. `plain` has no background, for minor actions.
   */
  variant?: 'primary' | 'secondary' | 'plain';
  size?: 'small' | 'medium';
  /** Decorative icon before the title. */
  icon?: IconName;
  className?: string;
};

const containerVariants = {
  primary: 'bg-accent',
  secondary: 'bg-background-300',
  plain: 'bg-transparent',
} as const;

const textVariants = {
  primary: 'text-foreground-inverse',
  secondary: 'text-foreground',
  plain: 'text-foreground',
} as const;

const iconColors = {
  primary: Colors.dark.textOnAccent,
  secondary: Colors.dark.text,
  plain: Colors.dark.text,
} as const;

// Both sizes keep the 44 pt minimum touch target of the iOS guidelines.
const containerSizes = {
  small: 'min-h-11 px-4 py-2',
  medium: 'min-h-14 px-6 py-4',
} as const;

const textSizes = {
  small: 'text-sm',
  medium: 'text-base',
} as const;

/** Pill-shaped button: the corners are always fully rounded. */
export function Button({
  title,
  variant = 'primary',
  size = 'medium',
  icon,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      className={`items-center justify-center rounded-full active:opacity-70 ${containerVariants[variant]} ${containerSizes[size]} ${disabled ? 'opacity-40' : ''} ${className}`}
      {...rest}>
      <View className="flex-row items-center gap-2">
        {icon && <Icon name={icon} size="small" color={iconColors[variant]} />}
        <Text className={`font-semibold ${textVariants[variant]} ${textSizes[size]}`}>{title}</Text>
      </View>
    </Pressable>
  );
}
