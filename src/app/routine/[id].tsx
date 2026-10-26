import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, Screen } from '@/components/ui/screen';
import { RequirementTags } from '@/components/workout/requirement-tags';
import { getExercise } from '@/constants/exercises';
import { BODY_PART_LABELS, GOAL_LABELS, LEVEL_LABELS, PLACE_LABELS } from '@/constants/labels';
import { useTraining } from '@/hooks/use-training';
import { useUser } from '@/hooks/use-user';
import type { Prescription } from '@/types/workout';
import { findRoutine, getRoutineExerciseIds } from '@/utils/custom-routine';
import { getRequirements } from '@/utils/exercise-filter';
import { formatRest } from '@/utils/format';
import { estimateDayMinutes, getPrescription } from '@/utils/prescription';
import { getNextDayIndex } from '@/utils/workout-log';

function describeTarget({ sets, target }: Prescription) {
  return target.kind === 'time'
    ? `${sets} × ${target.seconds} s`
    : `${sets} × ${target.min}–${target.max} reps`;
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
      <Text className="text-sm text-foreground-subtle">
        {routine.isCustom ? 'Personalizada' : LEVEL_LABELS[routine.level ?? user.level]} ·{' '}
        {PLACE_LABELS[routine.place]}
        {isWeekPlan ? ` · ${routine.days.length} días por semana` : ' · Se repite cada día'}
      </Text>

      <View className="gap-2">
        <Text className="text-sm font-semibold text-foreground-muted">Necesitas</Text>
        <RequirementTags requirements={getRequirements(getRoutineExerciseIds(routine))} />
      </View>

      <Card>
        <Text className="text-sm text-foreground-muted">
          Series, repeticiones y descansos ajustados a tu objetivo ({GOAL_LABELS[user.goal]}) y
          nivel ({LEVEL_LABELS[user.level]}). El descanso cambia según el esfuerzo de cada serie.
        </Text>
      </Card>

      {routine.days.map((day, dayIndex) => (
        <View key={dayIndex} className="gap-3">
          {isWeekPlan && (
            <View className="gap-1">
              <Text accessibilityRole="header" className="text-xl font-bold text-foreground">
                Día {dayIndex + 1}
                {dayIndex === nextDay && day.exerciseIds.length > 0 ? ' · Siguiente' : ''}
              </Text>
              <Text className="text-sm text-foreground-subtle">
                {day.focus.length > 0
                  ? `Foco: ${day.focus.map((part) => BODY_PART_LABELS[part]).join(', ')}`
                  : 'Sin foco'}
                {day.exerciseIds.length > 0 &&
                  ` · ~${estimateDayMinutes(day.exerciseIds, user.goal, user.level)} min`}
              </Text>
            </View>
          )}

          {day.exerciseIds.length === 0 && (
            <Text className="text-base text-foreground-muted">Día de descanso: sin ejercicios.</Text>
          )}

          {day.exerciseIds.map((exerciseId, index) => {
            const exercise = getExercise(exerciseId);
            const prescription = getPrescription(exercise, user.goal, user.level);
            return (
              <Card key={exerciseId}>
                <View className="flex-row items-center gap-3">
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-background-400">
                    <Text className="text-sm font-bold text-foreground">{index + 1}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">{exercise.name}</Text>
                    <Text className="text-sm text-foreground-subtle">{exercise.muscles}</Text>
                  </View>
                </View>
                <Text className="text-sm text-foreground-muted">
                  {describeTarget(prescription)} · Descanso {formatRest(prescription.rest.base)}
                </Text>
                <RequirementTags requirements={exercise.requires} />
              </Card>
            );
          })}

          {day.exerciseIds.length > 0 && (
            <Button
              title={isWeekPlan ? `Empezar día ${dayIndex + 1}` : 'Empezar entrenamiento'}
              variant={dayIndex === nextDay ? 'primary' : 'secondary'}
              onPress={() => void startWorkout(dayIndex)}
            />
          )}
        </View>
      ))}

      <View className="gap-3">
        <Button
          title={isActive ? 'Es tu rutina activa' : 'Usar esta rutina'}
          variant="secondary"
          disabled={isActive}
          onPress={() => void selectRoutine(routine.id)}
        />
        {routine.isCustom && (
          <Button
            title="Editar rutina"
            variant="secondary"
            onPress={() => router.push({ pathname: '/routine-editor', params: { id: routine.id } })}
          />
        )}
      </View>
    </Screen>
  );
}
