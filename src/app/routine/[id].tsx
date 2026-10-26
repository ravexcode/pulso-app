import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { ListRow, ListSection } from '@/components/ui/list';
import { Card, Screen } from '@/components/ui/screen';
import { RequirementTags } from '@/components/workout/requirement-tags';
import { getExercise } from '@/constants/exercises';
import { ICONS, PLACE_ICONS } from '@/constants/icons';
import { BODY_PART_LABELS, GOAL_LABELS, LEVEL_LABELS, PLACE_LABELS } from '@/constants/labels';
import { useTraining } from '@/hooks/use-training';
import { useUser } from '@/hooks/use-user';
import type { Prescription } from '@/types/workout';
import { findRoutine, getRoutineExerciseIds } from '@/utils/custom-routine';
import { getRequirements } from '@/utils/exercise-filter';
import { Colors } from '@/constants/theme';
import { formatRest } from '@/utils/format';
import { estimateDayMinutes, getPrescription } from '@/utils/prescription';
import { getNextDayIndex } from '@/utils/workout-log';

function describeTarget({ sets, target }: Prescription) {
  return target.kind === 'time'
    ? `${sets} × ${target.seconds} s`
    : `${sets} × ${target.min}–${target.max}`;
}

function MetaItem({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-full bg-background-500 px-3 py-1.5">
      <Icon name={icon} size="small" color={Colors.dark.textSecondary} />
      <Text className="text-sm font-semibold text-foreground-muted">{label}</Text>
    </View>
  );
}

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const { activeRoutineId, customRoutines, history, selectRoutine } = useTraining();
  const routine = findRoutine(id, customRoutines);

  if (!user) return null;
  if (!routine) {
    return (
      <Screen title="Rutina no encontrada" hasHeader>
        <Button title="Volver" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  const isActive = routine.id === activeRoutineId;
  const isWeekPlan = routine.days.length > 1;
  const nextDay = getNextDayIndex(history, routine);

  const startWorkout = async (dayIndex: number) => {
    if (!isActive) await selectRoutine(routine.id);
    router.push({
      pathname: '/workout/[routineId]',
      params: { routineId: routine.id, day: String(dayIndex) },
    });
  };

  return (
    <Screen title={routine.name} subtitle={routine.description} hasHeader>
      <View className="flex-row flex-wrap gap-2">
        <MetaItem icon={PLACE_ICONS[routine.place]} label={PLACE_LABELS[routine.place]} />
        <MetaItem
          icon={ICONS.strength}
          label={routine.isCustom ? 'Personalizada' : LEVEL_LABELS[routine.level ?? user.level]}
        />
        <MetaItem
          icon={ICONS.calendar}
          label={isWeekPlan ? `${routine.days.length} días por semana` : 'Se repite cada día'}
        />
      </View>

      <View className="gap-2">
        <Text className="text-sm font-semibold text-foreground-muted">Necesitas</Text>
        <RequirementTags requirements={getRequirements(getRoutineExerciseIds(routine))} />
      </View>

      <Card className="flex-row items-start">
        <Icon name={ICONS.info} size="small" color={Colors.dark.textSecondary} />
        <Text className="flex-1 text-sm text-foreground-muted">
          Series, repeticiones y descansos ajustados a tu objetivo ({GOAL_LABELS[user.goal]}) y
          nivel ({LEVEL_LABELS[user.level]}). El descanso cambia según el esfuerzo de cada serie.
        </Text>
      </Card>

      {routine.days.map((day, dayIndex) => {
        const minutes =
          day.exerciseIds.length > 0
            ? ` · ~${estimateDayMinutes(day.exerciseIds, user.goal, user.level)} min`
            : '';
        const title = isWeekPlan
          ? `Día ${dayIndex + 1}${dayIndex === nextDay && day.exerciseIds.length > 0 ? ' · Siguiente' : ''}`
          : `${day.exerciseIds.length} ejercicios${minutes}`;
        const footer = isWeekPlan
          ? `${day.focus.length > 0 ? `Foco: ${day.focus.map((part) => BODY_PART_LABELS[part]).join(', ')}` : 'Sin foco'}${minutes}`
          : undefined;
        return (
          <View key={dayIndex} className="gap-3">
            {day.exerciseIds.length === 0 ? (
              <ListSection title={title} footer={footer}>
                <ListRow icon={ICONS.rest} title="Día de descanso" subtitle="Sin ejercicios." />
              </ListSection>
            ) : (
              <ListSection title={title} footer={footer}>
                {day.exerciseIds.map((exerciseId, index) => {
                  const exercise = getExercise(exerciseId);
                  const prescription = getPrescription(exercise, user.goal, user.level);
                  return (
                    <ListRow
                      key={exerciseId}
                      badge={String(index + 1)}
                      title={exercise.name}
                      subtitle={`${exercise.muscles} · Descanso ${formatRest(prescription.rest.base)}`}
                      value={describeTarget(prescription)}>
                      <RequirementTags requirements={exercise.requires} />
                    </ListRow>
                  );
                })}
              </ListSection>
            )}

            {day.exerciseIds.length > 0 && (
              <Button
                title={isWeekPlan ? `Empezar día ${dayIndex + 1}` : 'Empezar entrenamiento'}
                icon={ICONS.play}
                variant={dayIndex === nextDay ? 'primary' : 'secondary'}
                onPress={() => void startWorkout(dayIndex)}
              />
            )}
          </View>
        );
      })}

      <View className="gap-3">
        <Button
          title={isActive ? 'Es tu rutina activa' : 'Usar esta rutina'}
          icon={isActive ? ICONS.checkCircle : ICONS.check}
          variant="secondary"
          disabled={isActive}
          onPress={() => void selectRoutine(routine.id)}
        />
        {routine.isCustom && (
          <Button
            title="Editar rutina"
            icon={ICONS.edit}
            variant="secondary"
            onPress={() => router.push({ pathname: '/routine-editor', params: { id: routine.id } })}
          />
        )}
      </View>
    </Screen>
  );
}
