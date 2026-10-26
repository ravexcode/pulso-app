import { Pressable, Text, View } from 'react-native';

import { RequirementTags } from '@/components/workout/requirement-tags';
import { LEVEL_LABELS, PLACE_LABELS } from '@/constants/labels';
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
    <View className={`rounded-full px-3 py-1 ${filled ? 'bg-accent' : 'border border-accent-800'}`}>
      <Text
        className={`text-xs font-semibold ${filled ? 'text-foreground-inverse' : 'text-foreground'}`}>
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

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${routine.name}${isActive ? ', rutina activa' : ''}`}
      onPress={onPress}
      className={`gap-3 rounded-3xl p-5 active:opacity-70 ${isActive ? 'border border-accent bg-background-500' : 'bg-background-600'}`}>
      <View className="flex-row flex-wrap gap-2">
        {isActive && <Badge label="Activa" filled />}
        {isRecommended && <Badge label="Recomendada" />}
        {routine.isCustom && <Badge label="Personalizada" />}
        <Badge label={PLACE_LABELS[routine.place]} />
        {routine.level && <Badge label={LEVEL_LABELS[routine.level]} />}
      </View>
      <Text className="text-xl font-bold text-foreground">{routine.name}</Text>
      <Text className="text-base text-foreground-muted">{routine.description}</Text>
      <Text className="text-sm text-foreground-subtle">
        {dayCount > 1 ? `${dayCount} días · ` : ''}
        {exerciseIds.length} ejercicios · ~{minutes} min por sesión
      </Text>
      <RequirementTags requirements={getRequirements(exerciseIds)} />
    </Pressable>
  );
}
