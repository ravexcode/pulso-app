import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { ListRow, ListSection } from '@/components/ui/list';
import { Screen } from '@/components/ui/screen';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { RoutineCard } from '@/components/workout/routine-card';
import { ICONS } from '@/constants/icons';
import { ROUTINES } from '@/constants/routines';
import { Colors } from '@/constants/theme';
import { useTraining } from '@/hooks/use-training';
import { useUser } from '@/hooks/use-user';
import type { Routine } from '@/types/workout';
import { toRoutine } from '@/utils/custom-routine';

const PLACE_FILTERS = ['all', 'home', 'gym'] as const;
type PlaceFilter = (typeof PLACE_FILTERS)[number];

const PLACE_FILTER_LABELS: Record<PlaceFilter, string> = {
  all: 'Todas',
  home: 'Casa',
  gym: 'Gimnasio',
};

export default function RoutinesScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { activeRoutineId, customRoutines } = useTraining();
  const [place, setPlace] = useState<PlaceFilter>('all');

  if (!user) return null;

  const matchesPlace = (routine: Routine) => place === 'all' || routine.place === place;
  const custom = customRoutines.map(toRoutine).filter(matchesPlace);
  const plans = ROUTINES.filter(matchesPlace);

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
      <SegmentedControl
        accessibilityLabel="Lugar de entrenamiento"
        options={PLACE_FILTERS}
        labels={PLACE_FILTER_LABELS}
        value={place}
        onChange={setPlace}
      />

      <View className="gap-3">
        <ListSection title="Mis rutinas">
          <ListRow
            icon={ICONS.add}
            title="Crear rutina personalizada"
            subtitle="Elige tus ejercicios y filtra por el equipo que tienes."
            showChevron
            onPress={() => router.push('/routine-editor')}
          />
        </ListSection>
        {custom.map(renderCard)}
      </View>

      <View className="gap-3">
        <Text
          accessibilityRole="header"
          className="px-4 text-[13px] font-semibold uppercase tracking-wide text-foreground-subtle">
          {place === 'all' ? 'Planes' : `Planes · ${PLACE_FILTER_LABELS[place]}`}
        </Text>
        {plans.map(renderCard)}
        {plans.length === 0 && custom.length === 0 && (
          <View className="items-center gap-2 py-6">
            <Icon name={ICONS.list} size="large" color={Colors.dark.textSubtle} />
            <Text className="text-center text-base text-foreground-muted">
              No hay rutinas para este lugar.
            </Text>
          </View>
        )}
      </View>
    </Screen>
  );
}
