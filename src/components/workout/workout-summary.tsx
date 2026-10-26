import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/screen';
import type { Units } from '@/types/user';
import type { WorkoutLog } from '@/types/workout';
import { formatDuration, toDisplayWeight, weightUnit } from '@/utils/format';
import { summarizeWorkout } from '@/utils/workout-log';

type WorkoutSummaryProps = {
  log: WorkoutLog;
  units: Units;
  isSaving: boolean;
  onSave: () => void;
  onDiscard: () => void;
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[45%] flex-1 gap-1 rounded-3xl bg-background-600 p-4">
      <Text className="text-sm text-foreground-subtle">{label}</Text>
      <Text className="text-2xl font-bold text-foreground">{value}</Text>
    </View>
  );
}

export function WorkoutSummary({ log, units, isSaving, onSave, onDiscard }: WorkoutSummaryProps) {
  const summary = summarizeWorkout(log);
  const hasSets = summary.setCount > 0;

  return (
    <View className="gap-6">
      <View className="gap-1">
        <Text accessibilityRole="header" className="text-3xl font-bold text-foreground">
          {hasSets ? '¡Entrenamiento completado!' : 'Entrenamiento sin series'}
        </Text>
        <Text className="text-base text-foreground-muted">{log.routineName}</Text>
      </View>

      <View className="flex-row flex-wrap gap-3">
        <Stat label="Duración total" value={formatDuration(log.durationSec)} />
        <Stat label="Series" value={String(summary.setCount)} />
        <Stat label="Trabajo" value={formatDuration(summary.workSec)} />
        <Stat label="Descanso" value={formatDuration(summary.restSec)} />
        {summary.volumeKg > 0 && (
          <Stat
            label="Volumen"
            value={`${Math.round(toDisplayWeight(summary.volumeKg, units))} ${weightUnit(units)}`}
          />
        )}
      </View>

      {hasSets && (
        <Card>
          {log.sets.map((set, index) => (
            <View key={index} className="flex-row justify-between gap-3">
              <Text className="flex-1 text-sm text-foreground" numberOfLines={1}>
                {set.exerciseName} · {set.setNumber}
              </Text>
              <Text className="text-sm text-foreground-muted">
                {set.reps !== undefined ? `${set.reps} reps` : formatDuration(set.workSec)}
                {set.weightKg !== undefined &&
                  ` · ${toDisplayWeight(set.weightKg, units)} ${weightUnit(units)}`}
              </Text>
            </View>
          ))}
        </Card>
      )}

      <View className="gap-3">
        {hasSets && <Button title="Guardar entrenamiento" onPress={onSave} disabled={isSaving} />}
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
