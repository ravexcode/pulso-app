import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { TextField } from '@/components/ui/text-field';
import { RequirementTags } from '@/components/workout/requirement-tags';
import { EXERCISE_CATALOG } from '@/constants/exercises';
import { EQUIPMENT_LABELS } from '@/constants/labels';
import { EQUIPMENT, type Equipment } from '@/types/workout';
import { filterExercises } from '@/utils/exercise-filter';

type ExercisePickerProps = {
  selectedIds: readonly string[];
  onToggle: (exerciseId: string) => void;
  /** `true` when no more exercises fit in the routine. */
  isFull: boolean;
};

/** Exercise catalog with equipment filters and a search field. */
export function ExercisePicker({ selectedIds, onToggle, isFull }: ExercisePickerProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [query, setQuery] = useState('');
  const exercises = filterExercises(EXERCISE_CATALOG, { equipment, query });

  const toggleEquipment = (item: Equipment) =>
    setEquipment((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item]
    );

  return (
    <View className="gap-4">
      <TextField
        label="Buscar ejercicio"
        value={query}
        onChangeText={setQuery}
        placeholder="Ej.: sentadilla, espalda, tríceps"
        hint="Busca por nombre o por músculo."
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      <View className="gap-2">
        <Text className="text-sm font-semibold text-foreground-muted">Equipo</Text>
        <View className="flex-row flex-wrap gap-2">
          <Chip label="Todo" selected={equipment.length === 0} onPress={() => setEquipment([])} />
          {EQUIPMENT.map((item) => (
            <Chip
              key={item}
              label={EQUIPMENT_LABELS[item]}
              selected={equipment.includes(item)}
              onPress={() => toggleEquipment(item)}
            />
          ))}
        </View>
        <Text className="text-sm text-foreground-subtle">
          Elige uno o varios. Las etiquetas de cada ejercicio muestran lo que necesitas.
        </Text>
      </View>

      <Text className="text-sm text-foreground-subtle">
        {exercises.length} {exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
      </Text>

      {exercises.length === 0 && (
        <Text className="text-base text-foreground-muted">
          Ningún ejercicio coincide con la búsqueda y los filtros.
        </Text>
      )}

      {exercises.map((exercise) => {
        const isSelected = selectedIds.includes(exercise.id);
        return (
          <View key={exercise.id} className="gap-3 rounded-3xl bg-background-600 p-4">
            <View className="flex-row items-center gap-3">
              <View className="flex-1 gap-1">
                <Text className="text-base font-semibold text-foreground">{exercise.name}</Text>
                <Text className="text-sm text-foreground-subtle">
                  {exercise.muscles} ·{' '}
                  {exercise.kind === 'compound' ? 'Multiarticular' : 'Aislamiento'}
                </Text>
              </View>
              <Button
                title={isSelected ? 'Quitar' : 'Añadir'}
                accessibilityLabel={`${isSelected ? 'Quitar' : 'Añadir'} ${exercise.name}`}
                variant={isSelected ? 'primary' : 'secondary'}
                size="small"
                disabled={!isSelected && isFull}
                onPress={() => onToggle(exercise.id)}
              />
            </View>
            <RequirementTags requirements={exercise.requires} />
          </View>
        );
      })}
    </View>
  );
}
