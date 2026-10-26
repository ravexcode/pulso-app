import { Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Colors } from '@/constants/theme';

type StatTileProps = {
  label: string;
  value: string;
  icon?: IconName;
  className?: string;
};

/** Small tile with one number, like the summary tiles of Apple Fitness. */
export function StatTile({ label, value, icon, className = '' }: StatTileProps) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      className={`min-w-[45%] flex-1 gap-2 rounded-2xl bg-background-600 p-4 ${className}`}>
      <View className="flex-row items-center gap-2">
        {icon && <Icon name={icon} size="small" color={Colors.dark.textSecondary} />}
        <Text className="text-sm font-semibold text-foreground-muted">{label}</Text>
      </View>
      <Text
        className="text-2xl font-bold text-foreground"
        style={{ fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
    </View>
  );
}
