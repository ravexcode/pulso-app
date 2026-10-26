import { Pressable, Text, type PressableProps } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Colors } from '@/constants/theme';

export type ChipProps = Omit<PressableProps, 'children'> & {
  label: string;
  selected?: boolean;
  /** Decorative icon after the label, like a cross on removable chips. */
  trailingIcon?: IconName;
  className?: string;
};

/** Pill-shaped option. Selected chips are filled with the accent color. */
export function Chip({
  label,
  selected = false,
  trailingIcon,
  className = '',
  ...rest
}: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`min-h-11 flex-row items-center justify-center gap-1.5 rounded-full px-4 py-2 active:opacity-70 ${selected ? 'bg-accent' : 'bg-background-400'} ${className}`}
      {...rest}>
      <Text
        className={`text-sm font-semibold ${selected ? 'text-foreground-inverse' : 'text-foreground'}`}>
        {label}
      </Text>
      {trailingIcon && (
        <Icon
          name={trailingIcon}
          size="small"
          color={selected ? Colors.dark.textOnAccent : Colors.dark.text}
        />
      )}
    </Pressable>
  );
}

type ChipGroupProps<T extends string> = {
  options: readonly T[];
  labels: Record<T, string>;
  value: T | undefined;
  onChange: (value: T) => void;
};

export function ChipGroup<T extends string>({
  options,
  labels,
  value,
  onChange,
}: ChipGroupProps<T>) {
  return (
    <>
      {options.map((option) => (
        <Chip
          key={option}
          label={labels[option]}
          selected={option === value}
          onPress={() => onChange(option)}
        />
      ))}
    </>
  );
}
