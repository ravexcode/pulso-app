import { Pressable, Text, type PressableProps } from 'react-native';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  title: string;
  /** `primary` is a filled accent button. `secondary` is an outlined button. */
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium';
  className?: string;
};

const containerVariants = {
  primary: 'bg-accent',
  secondary: 'border border-accent-800 bg-transparent',
} as const;

const textVariants = {
  primary: 'text-foreground-inverse',
  secondary: 'text-foreground',
} as const;

const containerSizes = {
  small: 'px-4 py-2',
  medium: 'px-6 py-4',
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
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      className={`items-center justify-center rounded-full active:opacity-70 ${containerVariants[variant]} ${containerSizes[size]} ${disabled ? 'opacity-50' : ''} ${className}`}
      {...rest}>
      <Text className={`font-semibold ${textVariants[variant]} ${textSizes[size]}`}>{title}</Text>
    </Pressable>
  );
}
