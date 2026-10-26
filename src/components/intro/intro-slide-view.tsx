import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';

import type { IntroSlide } from '@/constants/intro-slides';
import { Colors } from '@/constants/theme';

const VISUAL_SIZE = 72;

type IntroSlideViewProps = {
  slide: IntroSlide;
  width: number;
};

export function IntroSlideView({ slide, width }: IntroSlideViewProps) {
  return (
    <View style={{ width }} className="flex-1 items-center justify-center gap-8 px-8">
      <View className="h-40 w-40 items-center justify-center rounded-full bg-background-500">
        {slide.visual.kind === 'logo' ? (
          <Image
            source={require('@/assets/logo.svg')}
            tintColor={Colors.dark.accent}
            contentFit="contain"
            style={{ width: VISUAL_SIZE, height: VISUAL_SIZE }}
            accessible={false}
          />
        ) : (
          <SymbolView name={slide.visual.name} size={VISUAL_SIZE} tintColor={Colors.dark.accent} />
        )}
      </View>
      <View className="items-center gap-3">
        <Text accessibilityRole="header" className="text-center text-3xl font-bold text-foreground">
          {slide.title}
        </Text>
        <Text className="text-center text-base text-foreground-muted">{slide.description}</Text>
      </View>
    </View>
  );
}
