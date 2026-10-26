import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { RoutineEditor } from '@/components/workout/routine-editor';
import { useTraining } from '@/hooks/use-training';
import { useUser } from '@/hooks/use-user';
import type { CustomRoutineInput } from '@/utils/custom-routine';

/** Creates a custom routine, or edits the one in the `id` param. */
export default function RoutineEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { user } = useUser();
  const { customRoutines, saveCustomRoutine, deleteCustomRoutine } = useTraining();
  const existing = id ? customRoutines.find((routine) => routine.id === id) : undefined;

  if (id && !existing) {
    return (
      <Screen title="Rutina no encontrada" hasHeader>
        <Button title="Volver" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  const handleSave = async (input: CustomRoutineInput) => {
    const routine = await saveCustomRoutine(input, existing?.id);
    if (existing) {
      router.back();
    } else {
      router.replace({ pathname: '/routine/[id]', params: { id: routine.id } });
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    await deleteCustomRoutine(existing.id);
    router.dismissTo('/routines');
  };

  return (
    <Screen
      title={existing ? 'Editar rutina' : 'Nueva rutina'}
      subtitle="Reparte tus ejercicios a lo largo de la semana. Series, repeticiones y descansos se ajustan a tu perfil."
      hasHeader>
      <RoutineEditor
        initial={existing}
        defaultDayCount={user?.trainingDaysPerWeek}
        onSave={handleSave}
        onDelete={existing ? handleDelete : undefined}
      />
    </Screen>
  );
}
