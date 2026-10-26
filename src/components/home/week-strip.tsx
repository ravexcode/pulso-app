import { Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { ICONS } from '@/constants/icons';
import { Colors } from '@/constants/theme';

const DAY_LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const DAY_NAMES = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

type WeekStripProps = {
  /** Monday first: `true` for the days with a workout. */
  activity: readonly boolean[];
  /** Index of today, Monday first. */
  todayIndex: number;
};

/** The seven days of the week. Trained days are filled and today has a ring. */
export function WeekStrip({ activity, todayIndex }: WeekStripProps) {
  const trained = DAY_NAMES.filter((_, index) => activity[index]);
  return (
    <View
      accessible
      accessibilityLabel={
        trained.length === 0
          ? 'Aún no has entrenado esta semana'
          : `Entrenaste el ${trained.join(', ')}`
      }
      className="flex-row justify-between">
      {DAY_LETTERS.map((letter, index) => {
        const isDone = activity[index];
        const isToday = index === todayIndex;
        return (
          <View key={letter} className="items-center gap-2">
            <Text
              className={`text-xs font-semibold ${isToday ? 'text-foreground' : 'text-foreground-subtle'}`}>
              {letter}
            </Text>
            <View
              className={`h-9 w-9 items-center justify-center rounded-full ${isDone ? 'bg-accent' : 'bg-background-400'} ${isToday && !isDone ? 'border-2 border-accent' : ''}`}>
              {isDone && <Icon name={ICONS.check} size="small" color={Colors.dark.textOnAccent} />}
            </View>
          </View>
        );
      })}
    </View>
  );
}
