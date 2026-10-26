import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, Screen } from '@/components/ui/screen';
import { GOAL_LABELS } from '@/constants/labels';
import { useTraining } from '@/hooks/use-training';
import { useUser } from '@/hooks/use-user';
import { findRoutine } from '@/utils/custom-routine';
import { formatDuration } from '@/utils/format';
import { estimateRoutineMinutes } from '@/utils/prescription';
import { countWorkoutsThisWeek, summarizeWorkout } from '@/utils/workout-log';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { activeRoutineId, customRoutines, history } = useTraining();

  if (!user) return null;

  const routine = findRoutine(activeRoutineId ?? undefined, customRoutines);
  const doneThisWeek = countWorkoutsThisWeek(history);
  const weeklyGoal = user.trainingDaysPerWeek;
  const lastWorkout = history[0];

  return (
    <Screen title={`Hola, ${user.name}`} subtitle={`Objetivo: ${GOAL_LABELS[user.goal]}`} hasTabBar>
      <Card>
        <Text className="text-sm font-semibold text-foreground-muted">Esta semana</Text>
        <Text className="text-3xl font-bold text-foreground">
          {doneThisWeek} de {weeklyGoal} entrenamientos
        </Text>
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: weeklyGoal, now: Math.min(doneThisWeek, weeklyGoal) }}
          className="h-3 overflow-hidden rounded-full bg-background-400">
          <View
            className="h-full rounded-full bg-accent"
            style={{ width: `${Math.min(100, (doneThisWeek / weeklyGoal) * 100)}%` }}
          />
        </View>
      </Card>

      {routine ? (
        <Card>
          <Text className="text-sm font-semibold text-foreground-muted">Tu rutina</Text>
          <Text className="text-2xl font-bold text-foreground">{routine.name}</Text>
          <Text className="text-sm text-foreground-subtle">
            {routine.exerciseIds.length} ejercicios · ~
            {estimateRoutineMinutes(routine, user.goal, user.level)} min
          </Text>
          <View className="gap-3 pt-2">
            <Button
              title="Empezar entrenamiento"
              onPress={() =>
                router.push({ pathname: '/workout/[routineId]', params: { routineId: routine.id } })
              }
            />
            <Button
              title="Cambiar rutina"
              variant="secondary"
              onPress={() => router.push('/routines')}
            />
          </View>
        </Card>
      ) : (
        <Card>
          <Text className="text-2xl font-bold text-foreground">Elige tu rutina</Text>
          <Text className="text-base text-foreground-muted">
            Usa un plan full body o arma tu rutina eligiendo tus ejercicios.
          </Text>
          <Button title="Ver rutinas" onPress={() => router.push('/routines')} />
        </Card>
      )}

      {lastWorkout && (
        <Card>
          <Text className="text-sm font-semibold text-foreground-muted">Último entrenamiento</Text>
          <Text className="text-xl font-bold text-foreground">{lastWorkout.routineName}</Text>
          <Text className="text-sm text-foreground-subtle">
            {new Date(lastWorkout.startedAt).toLocaleDateString('es')} ·{' '}
            {formatDuration(lastWorkout.durationSec)} · {summarizeWorkout(lastWorkout).setCount}{' '}
            series
          </Text>
        </Card>
      )}
    </Screen>
  );
}
