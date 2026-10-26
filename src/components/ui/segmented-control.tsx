import { Pressable, Text, View } from 'react-native';

type SegmentedControlProps<T extends string> = {
  options: readonly T[];
  labels: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
  /** Read by screen readers to describe the whole control. */
  accessibilityLabel: string;
};

/** iOS-style segmented control: picks one of a few mutually exclusive views. */
export function SegmentedControl<T extends string>({
  options,
  labels,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      className="flex-row rounded-xl bg-background-500 p-0.5">
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option)}
            className={`min-h-11 flex-1 items-center justify-center rounded-[10px] px-3 active:opacity-70 ${selected ? 'bg-background-200' : ''}`}>
            <Text
              className={`text-sm font-semibold ${selected ? 'text-foreground' : 'text-foreground-muted'}`}>
              {labels[option]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
