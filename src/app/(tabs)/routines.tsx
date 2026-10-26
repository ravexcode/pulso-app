import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { RoutineCard } from '@/components/workout/routine-card';
import { ROUTINES } from '@/constants/routines';
import { useTraining } from '@/hooks/use-training';
import { useUser } from '@/hooks/use-user';
import type { Routine } from '@/types/workout';
import { toRoutine } from '@/utils/custom-routine';

export default function RoutinesScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { activeRoutineId, customRoutines } = useTraining();

  if (!user) return null;

  const renderCard = (routine: Routine) => (
    <RoutineCard
      key={routine.id}
      routine={routine}
      goal={user.goal}
      level={user.level}
      isActive={routine.id === activeRoutineId}
      isRecommended={routine.level === user.level}
      onPress={() => router.push({ pathname: '/routine/[id]', params: { id: routine.id } })}
    />
  );

  return (
    <Screen
      title="Rutinas"
      subtitle="Usa un plan o arma tu rutina con los ejercicios que quieras."
      hasTabBar>
      <View className="gap-3">
        <Text className="text-xl font-bold text-foreground">Mis rutinas</Text>
        {customRoutines.length === 0 && (
          <Text className="text-base text-foreground-muted">
            Elige tus propios ejercicios y filtra por el equipo que tienes.
          </Text>
        )}
        {customRoutines.map((custom) => renderCard(toRoutine(custom)))}
        <Button title="Crear rutina personalizada" onPress={() => router.push('/routine-editor')} />
      </View>

      <View className="gap-3">
        <Text className="text-xl font-bold text-foreground">Planes full body</Text>
        {ROUTINES.map(renderCard)}
      </View>
    </Screen>
  );
}
