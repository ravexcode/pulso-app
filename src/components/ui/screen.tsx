import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
// Gesture-aware version, so dragging inside a screen does not fight with the scroll.
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

type ScreenProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  /** Adds space for the bottom tab bar. */
  hasTabBar?: boolean;
  /** The navigation header already covers the top safe area. */
  hasHeader?: boolean;
};

/** Scrollable page with the app background and an optional title. */
export function Screen({
  title,
  subtitle,
  children,
  hasTabBar = false,
  hasHeader = false,
}: ScreenProps) {
  return (
    <SafeAreaView
      edges={hasHeader ? ['left', 'right'] : ['top', 'left', 'right']}
      className="flex-1 bg-background">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: (hasTabBar ? BottomTabInset : 0) + Spacing.five,
          alignItems: 'center',
        }}>
        <View className="w-full gap-6 px-6 pt-6" style={{ maxWidth: MaxContentWidth }}>
          {title && (
            <View className="gap-1">
              <Text accessibilityRole="header" className="text-3xl font-bold text-foreground">
                {title}
              </Text>
              {subtitle && <Text className="text-base text-foreground-muted">{subtitle}</Text>}
            </View>
          )}
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Elevated surface for grouped content. */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <View className={`gap-3 rounded-3xl bg-background-600 p-5 ${className}`}>{children}</View>;
}
