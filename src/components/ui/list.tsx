import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { ICONS } from '@/constants/icons';
import { Colors } from '@/constants/theme';

type ListSectionProps = {
  /** Short heading above the group, shown in capitals like iOS grouped lists. */
  title?: string;
  /** Explanation under the group. */
  footer?: string;
  /** Element at the right of the heading, like a small button. */
  action?: ReactNode;
  children: ReactNode;
};

/** Inset grouped list: rows share one rounded surface and are split by thin separators. */
export function ListSection({ title, footer, action, children }: ListSectionProps) {
  const rows = Children.toArray(children).filter(isValidElement);
  if (rows.length === 0) return null;
  return (
    <View className="gap-2">
      {(title || action) && (
        <View className="flex-row items-end justify-between gap-3 px-4">
          {title && (
            <Text
              accessibilityRole="header"
              className="flex-1 text-[13px] font-semibold uppercase tracking-wide text-foreground-subtle">
              {title}
            </Text>
          )}
          {action}
        </View>
      )}
      <View className="overflow-hidden rounded-2xl bg-background-600">
        {rows.map((row, index) => (
          <Fragment key={row.key ?? index}>
            {index > 0 && <View className="ml-4 h-px bg-background-300" />}
            {row}
          </Fragment>
        ))}
      </View>
      {footer && <Text className="px-4 text-[13px] text-foreground-subtle">{footer}</Text>}
    </View>
  );
}

type ListRowProps = {
  title: string;
  subtitle?: string;
  /** Short value at the right, like a duration. */
  value?: string;
  icon?: IconName;
  /** Text in the leading badge instead of an icon, like a position number. */
  badge?: string;
  /** Shows a chevron. Only for rows that open another screen. */
  showChevron?: boolean;
  /** Shows a check mark and marks the row as selected. */
  selected?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Extra content under the subtitle, like tags. */
  children?: ReactNode;
};

/** Row of a `ListSection`. It is a button when `onPress` is set. */
export function ListRow({
  title,
  subtitle,
  value,
  icon,
  badge,
  showChevron = false,
  selected,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  children,
}: ListRowProps) {
  const content = (
    <>
      {(icon || badge) && (
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-background-400">
          {icon ? (
            <Icon name={icon} size="small" />
          ) : (
            <Text className="text-sm font-bold text-foreground">{badge}</Text>
          )}
        </View>
      )}
      <View className="flex-1 gap-1">
        <Text className="text-base font-semibold text-foreground">{title}</Text>
        {subtitle && <Text className="text-sm text-foreground-subtle">{subtitle}</Text>}
        {children}
      </View>
      {value && (
        <Text
          className="text-sm text-foreground-muted"
          style={{ fontVariant: ['tabular-nums'] }}>
          {value}
        </Text>
      )}
      {selected && <Icon name={ICONS.check} size="small" />}
      {showChevron && <Icon name={ICONS.chevron} size="small" color={Colors.dark.textSubtle} />}
    </>
  );
  const className = 'min-h-14 flex-row items-center gap-3 px-4 py-3';

  if (!onPress) {
    return <View className={className}>{content}</View>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={selected === undefined ? undefined : { selected }}
      onPress={onPress}
      className={`${className} active:bg-background-500`}>
      {content}
    </Pressable>
  );
}
