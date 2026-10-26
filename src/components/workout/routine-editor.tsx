import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { ExercisePicker } from '@/components/workout/exercise-picker';
import { RequirementTags } from '@/components/workout/requirement-tags';
import { getExercise } from '@/constants/exercises';
import {
  CUSTOM_ROUTINE_LIMITS,
  sortByGuidelines,
  type CustomRoutineInput,
} from '@/utils/custom-routine';
import { getRequirements } from '@/utils/exercise-filter';

type RoutineEditorProps = {
  initial?: CustomRoutineInput;
  onSave: (input: CustomRoutineInput) => Promise<unknown>;
  /** Shown only when editing a saved routine. */
  onDelete?: () => Promise<unknown>;
};

function IconButton({
  label,
  symbol,
  disabled,
  onPress,
}: {
  label: string;
  symbol: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`h-9 w-9 items-center justify-center rounded-full border border-accent-800 active:opacity-70 ${disabled ? 'opacity-30' : ''}`}>
      <Text className="text-base font-bold text-foreground">{symbol}</Text>
    </Pressable>
  );
}

export function RoutineEditor({ initial, onSave, onDelete }: RoutineEditorProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [exerciseIds, setExerciseIds] = useState<string[]>(initial?.exerciseIds ?? []);
  const [showErrors, setShowErrors] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isFull = exerciseIds.length >= CUSTOM_ROUTINE_LIMITS.maxExercises;
  const nameError = showErrors && name.trim() === '' ? 'Ponle un nombre a tu rutina.' : undefined;
  const exercisesError =
    showErrors && exerciseIds.length === 0 ? 'Añade al menos un ejercicio.' : undefined;
  const isSorted = sortByGuidelines(exerciseIds).every((id, index) => id === exerciseIds[index]);

  const toggle = (id: string) =>
    setExerciseIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );

  const move = (index: number, offset: -1 | 1) =>
    setExerciseIds((current) => {
      const next = [...current];
      [next[index], next[index + offset]] = [next[index + offset], next[index]];
      return next;
    });

  const run = async (action: () => Promise<unknown>) => {
    setIsSaving(true);
    try {
      await action();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    setShowErrors(true);
    if (name.trim() === '' || exerciseIds.length === 0) return;
    void run(() => onSave({ name, exerciseIds }));
  };

  return (
    <View className="gap-6">
      <TextField
        label="Nombre de la rutina"
        value={name}
        onChangeText={setName}
        placeholder="Ej.: Pierna y espalda"
        hint={`Máximo ${CUSTOM_ROUTINE_LIMITS.nameMaxLength} caracteres.`}
        maxLength={CUSTOM_ROUTINE_LIMITS.nameMaxLength}
        autoCapitalize="sentences"
        error={nameError}
      />

      <View className="gap-3">
        <Text className="text-xl font-bold text-foreground">
          Tus ejercicios ({exerciseIds.length}/{CUSTOM_ROUTINE_LIMITS.maxExercises})
        </Text>
        {exerciseIds.length === 0 ? (
          <Text
            className={`text-base ${exercisesError ? 'text-foreground' : 'text-foreground-muted'}`}>
            {exercisesError ?? 'Todavía no hay ejercicios. Añádelos desde el catálogo de abajo.'}
          </Text>
        ) : (
          <Card>
            <Text className="text-sm font-semibold text-foreground-muted">Necesitas</Text>
            <RequirementTags requirements={getRequirements(exerciseIds)} />
          </Card>
        )}

        {exerciseIds.map((id, index) => {
          const exercise = getExercise(id);
          return (
            <View
              key={id}
              className="flex-row items-center gap-3 rounded-3xl bg-background-500 p-4">
              <Text className="w-6 text-center text-sm font-bold text-foreground-muted">
                {index + 1}
              </Text>
              <Text className="flex-1 text-base font-semibold text-foreground" numberOfLines={2}>
                {exercise.name}
              </Text>
              <IconButton
                label={`Subir ${exercise.name}`}
                symbol="↑"
                disabled={index === 0}
                onPress={() => move(index, -1)}
              />
              <IconButton
                label={`Bajar ${exercise.name}`}
                symbol="↓"
                disabled={index === exerciseIds.length - 1}
                onPress={() => move(index, 1)}
              />
              <IconButton
                label={`Quitar ${exercise.name} de la rutina`}
                symbol="✕"
                onPress={() => toggle(id)}
              />
            </View>
          );
        })}

        {exerciseIds.length > 1 && !isSorted && (
          <View className="gap-2">
            <Text className="text-sm text-foreground-subtle">
              Las guías recomiendan hacer primero los ejercicios multiarticulares y después los de
              aislamiento.
            </Text>
            <Button
              title="Ordenar según las guías"
              variant="secondary"
              onPress={() => setExerciseIds(sortByGuidelines)}
            />
          </View>
        )}
      </View>

      <View className="gap-2">
        <Button title="Guardar rutina" onPress={handleSave} disabled={isSaving} />
        {onDelete && (
          <Button
            title="Eliminar rutina"
            variant="secondary"
            onPress={() => void run(onDelete)}
            disabled={isSaving}
          />
        )}
      </View>

      <View className="gap-3">
        <Text className="text-xl font-bold text-foreground">Catálogo de ejercicios</Text>
        {isFull && (
          <Text className="text-sm text-foreground-muted">
            Llegaste al máximo de {CUSTOM_ROUTINE_LIMITS.maxExercises} ejercicios. Quita alguno para
            añadir otro.
          </Text>
        )}
        <ExercisePicker selectedIds={exerciseIds} onToggle={toggle} isFull={isFull} />
      </View>
    </View>
  );
}
