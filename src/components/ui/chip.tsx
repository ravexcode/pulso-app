import { Pressable, Text, type PressableProps } from 'react-native';

export type ChipProps = Omit<PressableProps, 'children'> & {
  label: string;
  selected?: boolean;
  className?: string;
};

/** Pill-shaped option. Selected chips are filled with the accent color. */
export function Chip({ label, selected = false, className = '', ...rest }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`items-center justify-center rounded-full px-4 py-2 active:opacity-70 ${selected ? 'bg-accent' : 'border border-accent-800'} ${className}`}
      {...rest}>
      <Text
        className={`text-sm font-semibold ${selected ? 'text-foreground-inverse' : 'text-foreground'}`}>
        {label}
      </Text>
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
