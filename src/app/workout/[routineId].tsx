import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { WorkoutSession } from '@/components/workout/workout-session';
import { getRoutine } from '@/constants/routines';
import { useTraining } from '@/hooks/use-training';
import { useUser } from '@/hooks/use-user';
import { planRoutine } from '@/utils/workout-session';

export default function WorkoutScreen() {
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const router = useRouter();
  const { user } = useUser();
  const { history, addWorkout } = useTraining();
  const routine = getRoutine(routineId);
  // The plan is fixed when the workout starts, even if the profile changes meanwhile.
  const [plan] = useState(() =>
    routine && user ? planRoutine(routine, user.goal, user.level) : []
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
      plan={plan}
      units={user.units}
      history={history}
      onSave={addWorkout}
      onExit={exit}
    />
  );
}
