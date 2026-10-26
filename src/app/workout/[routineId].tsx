import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { WorkoutSession } from '@/components/workout/workout-session';
import { useTraining } from '@/hooks/use-training';
import { useUser } from '@/hooks/use-user';
import { findRoutine } from '@/utils/custom-routine';
import { planRoutine } from '@/utils/workout-session';

export default function WorkoutScreen() {
  const { routineId, day } = useLocalSearchParams<{ routineId: string; day?: string }>();
  const router = useRouter();
  const { user } = useUser();
  const { history, customRoutines, addWorkout } = useTraining();
  const routine = findRoutine(routineId, customRoutines);
  const dayIndex = Number(day ?? 0) || 0;
  // The plan is fixed when the workout starts, even if the profile changes meanwhile.
  const [plan] = useState(() =>
    routine && user ? planRoutine(routine, dayIndex, user.goal, user.level) : []
  );

  const exit = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!user || !routine || plan.length === 0) {
    return (
      <Screen title="Rutina no encontrada">
        <Button title="Volver" variant="secondary" onPress={exit} />
      </Screen>
    );
  }

  return (
    <WorkoutSession
      routine={routine}
      dayIndex={dayIndex}
      plan={plan}
      units={user.units}
      history={history}
      onSave={addWorkout}
      onExit={exit}
    />
  );
}
