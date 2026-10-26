import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { TextField } from '@/components/ui/text-field';
import { usesWeight } from '@/constants/exercises';
import { EFFORT_ICONS, ICONS } from '@/constants/icons';
import { EFFORT_LABELS } from '@/constants/labels';
import { Colors } from '@/constants/theme';
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
      <View className="flex-row items-center gap-2">
        <Icon name={ICONS.timer} size="small" color={Colors.dark.textSecondary} />
        <Text className="text-base text-foreground-muted">
          Duración de la serie: {formatDuration(workSec)}
        </Text>
      </View>

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
        <View className="overflow-hidden rounded-2xl bg-background-600">
          {EFFORTS.map((option, index) => {
            const selected = option === effort;
            return (
              <View key={option}>
                {index > 0 && <View className="ml-16 h-px bg-background-300" />}
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={EFFORT_LABELS[option].title}
                  accessibilityHint={EFFORT_LABELS[option].hint}
                  onPress={() => setEffort(option)}
                  className={`min-h-14 flex-row items-center gap-3 px-4 py-3 active:bg-background-500 ${selected ? 'bg-background-400' : ''}`}>
                  <View
                    className={`h-9 w-9 items-center justify-center rounded-xl ${selected ? 'bg-accent' : 'bg-background-400'}`}>
                    <Icon
                      name={EFFORT_ICONS[option]}
                      size="small"
                      color={selected ? Colors.dark.textOnAccent : Colors.dark.text}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {EFFORT_LABELS[option].title}
                    </Text>
                    <Text className="text-sm text-foreground-subtle">
                      {EFFORT_LABELS[option].hint}
                    </Text>
                  </View>
                  {selected && <Icon name={ICONS.checkCircle} />}
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>

      <Button title="Guardar serie" icon={ICONS.check} onPress={handleSave} disabled={!canSave} />
    </View>
  );
}
