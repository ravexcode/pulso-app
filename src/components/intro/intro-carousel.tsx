import { useRef, useState } from 'react';
import {
  FlatList,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IntroSlideView } from '@/components/intro/intro-slide-view';
import { PageIndicator } from '@/components/intro/page-indicator';
import { Button } from '@/components/ui/button';
import { INTRO_SLIDES, type IntroSlide } from '@/constants/intro-slides';

type IntroCarouselProps = {
  /** Called when the user skips the intro or presses the button on the last slide. */
  onFinish: () => void;
  slides?: readonly IntroSlide[];
};

export function IntroCarousel({ onFinish, slides = INTRO_SLIDES }: IntroCarouselProps) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<IntroSlide>>(null);
  const [current, setCurrent] = useState(0);
  const isLastSlide = current === slides.length - 1;

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setCurrent(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  const handleNext = () => {
    if (isLastSlide) {
      onFinish();
      return;
    }
    const next = current + 1;
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setCurrent(next);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="h-14 flex-row items-center justify-end px-6">
        {!isLastSlide && <Button title="Omitir" variant="secondary" size="small" onPress={onFinish} />}
      </View>

      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(slide) => slide.key}
        renderItem={({ item }) => <IntroSlideView slide={item} width={width} />}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
      />

      <View className="gap-6 px-6 pb-6">
        <PageIndicator count={slides.length} current={current} />
        <Button title={isLastSlide ? 'Comenzar' : 'Siguiente'} onPress={handleNext} />
      </View>
    </SafeAreaView>
  );
}
