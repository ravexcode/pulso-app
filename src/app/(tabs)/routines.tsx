import { useRouter } from 'expo-router';

import { Screen } from '@/components/ui/screen';
import { RoutineCard } from '@/components/workout/routine-card';
import { ROUTINES } from '@/constants/routines';
import { useTraining } from '@/hooks/use-training';
import { useUser } from '@/hooks/use-user';

export default function RoutinesScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { activeRoutineId } = useTraining();

  if (!user) return null;

  return (
    <Screen
      title="Rutinas"
      subtitle="Entrenamientos de cuerpo completo. Elige el que vas a usar."
      hasTabBar>
      {ROUTINES.map((routine) => (
        <RoutineCard
          key={routine.id}
          routine={routine}
          goal={user.goal}
          level={user.level}
          isActive={routine.id === activeRoutineId}
          isRecommended={routine.level === user.level}
          onPress={() => router.push({ pathname: '/routine/[id]', params: { id: routine.id } })}
        />
      ))}
    </Screen>
  );
}
