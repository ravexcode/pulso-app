import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { TextField } from '@/components/ui/text-field';
import { RequirementTags } from '@/components/workout/requirement-tags';
import { EXERCISE_CATALOG } from '@/constants/exercises';
import { BODY_PART_LABELS, EQUIPMENT_LABELS } from '@/constants/labels';
import { BODY_PARTS, EQUIPMENT, type BodyPart, type Equipment } from '@/types/workout';
import { filterExercises } from '@/utils/exercise-filter';

type ExercisePickerProps = {
  /** Exercises already in the day. */
  selectedIds: readonly string[];
  onToggle: (exerciseId: string) => void;
  /** Body parts selected when the picker opens, usually the focus of the day. */
  initialBodyParts?: readonly BodyPart[];
};

function toggleItem<T>(items: readonly T[], item: T): T[] {
  return items.includes(item) ? items.filter((value) => value !== item) : [...items, item];
}

/** Exercise catalog with equipment and body part filters and a search field. */
export function ExercisePicker({
  selectedIds,
  onToggle,
  initialBodyParts = [],
}: ExercisePickerProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([...initialBodyParts]);
  const [query, setQuery] = useState('');
  const exercises = filterExercises(EXERCISE_CATALOG, { equipment, bodyParts, query });

  return (
    <View className="gap-4">
      <TextField
        label="Buscar ejercicio"
        value={query}
        onChangeText={setQuery}
        placeholder="Ej.: sentadilla, remo, tríceps"
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
              onPress={() => setEquipment((current) => toggleItem(current, item))}
            />
          ))}
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-sm font-semibold text-foreground-muted">Parte del cuerpo</Text>
        <View className="flex-row flex-wrap gap-2">
          <Chip
            label="Todas"
            selected={bodyParts.length === 0}
            onPress={() => setBodyParts([])}
          />
          {BODY_PARTS.map((part) => (
            <Chip
              key={part}
              label={BODY_PART_LABELS[part]}
              selected={bodyParts.includes(part)}
              onPress={() => setBodyParts((current) => toggleItem(current, part))}
            />
          ))}
        </View>
        <Text className="text-sm text-foreground-subtle">
          Elige uno o varios filtros. Las etiquetas de cada ejercicio muestran lo que necesitas.
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
                  {BODY_PART_LABELS[exercise.bodyPart]} · {exercise.muscles} ·{' '}
                  {exercise.kind === 'compound' ? 'Multiarticular' : 'Aislamiento'}
                </Text>
              </View>
              <Button
                title={isSelected ? 'Quitar' : 'Añadir'}
                accessibilityLabel={`${isSelected ? 'Quitar' : 'Añadir'} ${exercise.name}`}
                variant={isSelected ? 'primary' : 'secondary'}
                size="small"
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
