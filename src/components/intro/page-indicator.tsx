import { View } from 'react-native';

type PageIndicatorProps = {
  count: number;
  /** Zero-based index of the current page. */
  current: number;
};

export function PageIndicator({ count, current }: PageIndicatorProps) {
  return (
    <View
      accessible
      accessibilityLabel={`Paso ${current + 1} de ${count}`}
      className="flex-row items-center justify-center gap-2">
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          className={`h-2 rounded-full ${index === current ? 'w-6 bg-accent' : 'w-2 bg-background-100'}`}
        />
      ))}
    </View>
  );
}
