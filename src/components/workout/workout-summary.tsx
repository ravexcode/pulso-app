import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ListRow, ListSection } from '@/components/ui/list';
import { StatTile } from '@/components/ui/stat-tile';
import { ICONS } from '@/constants/icons';
import { EFFORT_LABELS } from '@/constants/labels';
import { Colors } from '@/constants/theme';
import type { Units } from '@/types/user';
import type { LoggedSet, WorkoutLog } from '@/types/workout';
import { formatDuration, toDisplayWeight, weightUnit } from '@/utils/format';
import { summarizeWorkout } from '@/utils/workout-log';

type WorkoutSummaryProps = {
  log: WorkoutLog;
  units: Units;
  isSaving: boolean;
  onSave: () => void;
  onDiscard: () => void;
};

/** Sets of the same exercise together, in the order the exercises were done. */
function groupByExercise(sets: readonly LoggedSet[]) {
  const groups = new Map<string, LoggedSet[]>();
  for (const set of sets) {
    groups.set(set.exerciseId, [...(groups.get(set.exerciseId) ?? []), set]);
  }
  return [...groups.values()];
}

export function WorkoutSummary({ log, units, isSaving, onSave, onDiscard }: WorkoutSummaryProps) {
  const summary = summarizeWorkout(log);
  const hasSets = summary.setCount > 0;

  return (
    <View className="gap-6">
      <View className="items-center gap-2 pt-4">
        <Icon
          name={hasSets ? ICONS.checkCircle : ICONS.info}
          size="xlarge"
          color={hasSets ? Colors.dark.accent : Colors.dark.textSecondary}
        />
        <Text
          accessibilityRole="header"
          className="text-center text-3xl font-bold text-foreground">
          {hasSets ? '¡Entrenamiento completado!' : 'Entrenamiento sin series'}
        </Text>
        <Text className="text-center text-base text-foreground-muted">{log.routineName}</Text>
      </View>

      <View className="flex-row flex-wrap gap-3">
        <StatTile icon={ICONS.clock} label="Duración total" value={formatDuration(log.durationSec)} />
        <StatTile icon={ICONS.sets} label="Series" value={String(summary.setCount)} />
        <StatTile icon={ICONS.timer} label="Trabajo" value={formatDuration(summary.workSec)} />
        <StatTile icon={ICONS.rest} label="Descanso" value={formatDuration(summary.restSec)} />
        {summary.volumeKg > 0 && (
          <StatTile
            icon={ICONS.weight}
            label="Volumen"
            value={`${Math.round(toDisplayWeight(summary.volumeKg, units))} ${weightUnit(units)}`}
          />
        )}
      </View>

      {groupByExercise(log.sets).map((sets) => (
        <ListSection key={sets[0].exerciseId} title={sets[0].exerciseName}>
          {sets.map((set) => (
            <ListRow
              key={set.setNumber}
              badge={String(set.setNumber)}
              title={set.reps !== undefined ? `${set.reps} reps` : formatDuration(set.workSec)}
              subtitle={EFFORT_LABELS[set.effort].title}
              value={
                set.weightKg !== undefined
                  ? `${toDisplayWeight(set.weightKg, units)} ${weightUnit(units)}`
                  : undefined
              }
            />
          ))}
        </ListSection>
      ))}

      <View className="gap-3">
        {hasSets && (
          <Button title="Guardar entrenamiento" icon={ICONS.check} onPress={onSave} disabled={isSaving} />
        )}
        <Button
          title={hasSets ? 'Descartar' : 'Salir'}
          variant="secondary"
          onPress={onDiscard}
          disabled={isSaving}
        />
      </View>
    </View>
  );
}
