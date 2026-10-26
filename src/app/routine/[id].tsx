import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, Screen } from '@/components/ui/screen';
import { RequirementTags } from '@/components/workout/requirement-tags';
import { getExercise } from '@/constants/exercises';
import { GOAL_LABELS, LEVEL_LABELS, PLACE_LABELS } from '@/constants/labels';
import { useTraining } from '@/hooks/use-training';
import { useUser } from '@/hooks/use-user';
import type { Prescription } from '@/types/workout';
import { findRoutine } from '@/utils/custom-routine';
import { getRequirements } from '@/utils/exercise-filter';
import { formatRest } from '@/utils/format';
import { estimateRoutineMinutes, getPrescription } from '@/utils/prescription';

function describeTarget({ sets, target }: Prescription) {
  return target.kind === 'time'
    ? `${sets} × ${target.seconds} s`
    : `${sets} × ${target.min}–${target.max} reps`;
}

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const { activeRoutineId, customRoutines, selectRoutine } = useTraining();
  const routine = findRoutine(id, customRoutines);

  if (!user) return null;
  if (!routine) {
    return (
      <Screen title="Rutina no encontrada">
        <Button title="Volver" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  const isActive = routine.id === activeRoutineId;
  const minutes = estimateRoutineMinutes(routine, user.goal, user.level);

  const startWorkout = async () => {
    if (!isActive) await selectRoutine(routine.id);
    router.push({ pathname: '/workout/[routineId]', params: { routineId: routine.id } });
  };

  return (
    <Screen title={routine.name} subtitle={routine.description} hasHeader>
      <Text className="text-sm text-foreground-subtle">
        {routine.isCustom ? 'Personalizada' : LEVEL_LABELS[routine.level ?? user.level]} ·{' '}
        {PLACE_LABELS[routine.place]} · ~{minutes} min
      </Text>

      <View className="gap-2">
        <Text className="text-sm font-semibold text-foreground-muted">Necesitas</Text>
        <RequirementTags requirements={getRequirements(routine.exerciseIds)} />
      </View>

      <Card>
        <Text className="text-sm text-foreground-muted">
          Series, repeticiones y descansos ajustados a tu objetivo ({GOAL_LABELS[user.goal]}) y
          nivel ({LEVEL_LABELS[user.level]}). El descanso cambia según el esfuerzo de cada serie.
        </Text>
      </Card>

      <View className="gap-3">
        {routine.exerciseIds.map((exerciseId, index) => {
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
      </View>

      <View className="gap-3">
        <Button title="Empezar entrenamiento" onPress={() => void startWorkout()} />
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
