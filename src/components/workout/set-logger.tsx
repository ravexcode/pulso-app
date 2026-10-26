import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { usesWeight } from '@/constants/exercises';
import { EFFORT_LABELS } from '@/constants/labels';
import type { Units } from '@/types/user';
import { EFFORTS, type Effort, type Exercise, type SetTarget } from '@/types/workout';
import {
  formatDuration,
  fromDisplayWeight,
  parseDecimal,
  toDisplayWeight,
  weightUnit,
} from '@/utils/format';

/** Which weight to write, so every set of an exercise is logged the same way. */
const WEIGHT_HINTS: Record<Exercise['equipment'], string> = {
  barbell: 'Total: barra y discos.',
  dumbbell: 'De una sola mancuerna.',
  machine: 'El que marca la máquina.',
  cable: 'El que marca la polea.',
  bodyweight: '',
};

export type SetResult = { effort: Effort; reps?: number; weightKg?: number };

type SetLoggerProps = {
  exercise: Exercise;
  target: SetTarget;
  workSec: number;
  units: Units;
  /** Weight to pre-fill, from the last time the user did this exercise. */
  initialWeightKg?: number;
  onSave: (result: SetResult) => void;
};

export function SetLogger({
  exercise,
  target,
  workSec,
  units,
  initialWeightKg,
  onSave,
}: SetLoggerProps) {
  const tracksReps = exercise.tracking === 'reps';
  const hasWeight = usesWeight(exercise);
  const [reps, setReps] = useState(target.kind === 'reps' ? String(target.max) : '');
  const [weight, setWeight] = useState(
    initialWeightKg === undefined ? '' : String(toDisplayWeight(initialWeightKg, units))
  );
  const [effort, setEffort] = useState<Effort>();

  const repsValue = parseDecimal(reps);
  const weightValue = parseDecimal(weight);
  const repsError =
    tracksReps && (repsValue === undefined || !Number.isInteger(repsValue) || repsValue < 0)
      ? 'Escribe un número entero de repeticiones.'
      : undefined;
  const weightError =
    hasWeight && weight.trim() !== '' && (weightValue === undefined || weightValue < 0)
      ? `Escribe el peso en ${weightUnit(units)}, por ejemplo 42,5.`
      : undefined;
  const canSave = effort !== undefined && !repsError && !weightError;

  const handleSave = () => {
    if (!effort || !canSave) return;
    onSave({
      effort,
      reps: tracksReps ? repsValue : undefined,
      weightKg:
        hasWeight && weightValue !== undefined ? fromDisplayWeight(weightValue, units) : undefined,
    });
  };

  return (
    <View className="gap-5">
      <Text className="text-base text-foreground-muted">
        Duración de la serie: {formatDuration(workSec)}
      </Text>

      {(tracksReps || hasWeight) && (
        <View className="flex-row gap-3">
          {tracksReps && (
            <View className="flex-1">
              <TextField
                label="Repeticiones"
                value={reps}
                onChangeText={setReps}
                placeholder={target.kind === 'reps' ? `${target.min}–${target.max}` : undefined}
                hint={
                  target.kind === 'reps'
                    ? `Solo las completas, con buena técnica. Objetivo: ${target.min}–${target.max}.`
                    : undefined
                }
                keyboardType="number-pad"
                maxLength={3}
                selectTextOnFocus
                error={repsError}
              />
            </View>
          )}
          {hasWeight && (
            <View className="flex-1">
              <TextField
                label="Peso"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder="Ej.: 40"
                hint={`${WEIGHT_HINTS[exercise.equipment]} Vacío si no lo sabes.`}
                maxLength={6}
                selectTextOnFocus
                suffix={weightUnit(units)}
                error={weightError}
              />
            </View>
          )}
        </View>
      )}

      <View className="gap-2">
        <Text className="text-sm font-semibold text-foreground-muted">¿Cómo se sintió?</Text>
        {EFFORTS.map((option) => {
          const selected = option === effort;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={EFFORT_LABELS[option].title}
              onPress={() => setEffort(option)}
              className={`rounded-full px-5 py-3 active:opacity-70 ${selected ? 'bg-accent' : 'border border-accent-800'}`}>
              <Text
                className={`text-base font-semibold ${selected ? 'text-foreground-inverse' : 'text-foreground'}`}>
                {EFFORT_LABELS[option].title}
              </Text>
              <Text
                className={`text-sm ${selected ? 'text-foreground-inverse' : 'text-foreground-subtle'}`}>
                {EFFORT_LABELS[option].hint}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Button title="Guardar serie" onPress={handleSave} disabled={!canSave} />
    </View>
  );
}
