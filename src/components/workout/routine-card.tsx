import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { RequirementTags } from '@/components/workout/requirement-tags';
import { ICONS, PLACE_ICONS } from '@/constants/icons';
import { LEVEL_LABELS, PLACE_LABELS } from '@/constants/labels';
import { Colors } from '@/constants/theme';
import type { Goal, Level } from '@/types/user';
import type { Routine } from '@/types/workout';
import { getRoutineExerciseIds } from '@/utils/custom-routine';
import { getRequirements } from '@/utils/exercise-filter';
import { estimateRoutineMinutes } from '@/utils/prescription';

type RoutineCardProps = {
  routine: Routine;
  goal: Goal;
  level: Level;
  isActive: boolean;
  isRecommended: boolean;
  onPress: () => void;
};

function Badge({ label, filled = false }: { label: string; filled?: boolean }) {
  return (
    <View className={`rounded-full px-2.5 py-1 ${filled ? 'bg-accent' : 'border border-background-100'}`}>
      <Text
        className={`text-xs font-semibold ${filled ? 'text-foreground-inverse' : 'text-foreground-muted'}`}>
        {label}
      </Text>
    </View>
  );
}

export function RoutineCard({
  routine,
  goal,
  level,
  isActive,
  isRecommended,
  onPress,
}: RoutineCardProps) {
  const minutes = estimateRoutineMinutes(routine, goal, level);
  const exerciseIds = getRoutineExerciseIds(routine);
  const dayCount = routine.days.length;
  const badges = [
    isRecommended && 'Recomendada',
    routine.isCustom && 'Personalizada',
    PLACE_LABELS[routine.place],
    routine.level && LEVEL_LABELS[routine.level],
  ].filter((label): label is string => typeof label === 'string');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${routine.name}${isActive ? ', rutina activa' : ''}`}
      onPress={onPress}
      className={`gap-3 rounded-2xl p-4 active:opacity-70 ${isActive ? 'border border-accent bg-background-500' : 'bg-background-600'}`}>
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-background-400">
          <Icon name={PLACE_ICONS[routine.place]} />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-lg font-bold text-foreground" numberOfLines={2}>
            {routine.name}
          </Text>
          <Text className="text-sm text-foreground-subtle">
            {dayCount > 1 ? `${dayCount} días · ` : ''}
            {exerciseIds.length} ejercicios · ~{minutes} min
          </Text>
        </View>
        {isActive ? (
          <Badge label="Activa" filled />
        ) : (
          <Icon name={ICONS.chevron} size="small" color={Colors.dark.textSubtle} />
        )}
      </View>
      <Text className="text-base text-foreground-muted">{routine.description}</Text>
      <View className="flex-row flex-wrap gap-2">
        {badges.map((label) => (
          <Badge key={label} label={label} />
        ))}
      </View>
      <RequirementTags requirements={getRequirements(exerciseIds)} />
    </Pressable>
  );
}
