import { View } from 'react-native';

type ProgressBarProps = {
  value: number;
  max: number;
  /** Read by screen readers, like "Series completadas". */
  label: string;
  size?: 'small' | 'medium';
};

export function ProgressBar({ value, max, label, size = 'medium' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(value, max));
  const percent = max > 0 ? (clamped / max) * 100 : 0;
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max, now: clamped }}
      className={`overflow-hidden rounded-full bg-background-400 ${size === 'small' ? 'h-1.5' : 'h-3'}`}>
      <View className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
    </View>
  );
}
