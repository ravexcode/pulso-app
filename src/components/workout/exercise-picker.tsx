import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { TextField } from '@/components/ui/text-field';
import { RequirementTags } from '@/components/workout/requirement-tags';
import { EXERCISE_CATALOG } from '@/constants/exercises';
import { EQUIPMENT_ICONS, ICONS } from '@/constants/icons';
import { BODY_PART_LABELS, EQUIPMENT_LABELS } from '@/constants/labels';
import { Colors } from '@/constants/theme';
import { BODY_PARTS, EQUIPMENT, type BodyPart, type Equipment } from '@/types/workout';
import { filterExercises } from '@/utils/exercise-filter';

type ExercisePickerProps = {
  /** Exercises already in the day. */
  selectedIds: readonly string[];
  onToggle: (exerciseId: string) => void;
  /** Body parts selected when the picker opens, usually the focus of the day. */
  initialBodyParts?: readonly BodyPart[];
};

const PLACES = ['any', 'home'] as const;
type Place = (typeof PLACES)[number];
const PLACE_LABELS: Record<Place, string> = { any: 'Cualquier lugar', home: 'En casa' };

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
  const [place, setPlace] = useState<Place>('any');
  const exercises = filterExercises(EXERCISE_CATALOG, {
    equipment,
    bodyParts,
    query,
    homeOnly: place === 'home',
  });

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
        <Text className="text-sm font-semibold text-foreground-muted">Lugar</Text>
        <SegmentedControl
          accessibilityLabel="Lugar"
          options={PLACES}
          labels={PLACE_LABELS}
          value={place}
          onChange={setPlace}
        />
        {place === 'home' && (
          <Text className="text-sm text-foreground-subtle">
            Solo tu peso corporal, con una silla, una mesa o una esterilla como mucho.
          </Text>
        )}
      </View>

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

      {exercises.length > 0 && (
        <View className="overflow-hidden rounded-2xl bg-background-600">
          {exercises.map((exercise, index) => {
            const isSelected = selectedIds.includes(exercise.id);
            const action = isSelected ? 'Quitar' : 'Añadir';
            return (
              <View key={exercise.id}>
                {index > 0 && <View className="ml-16 h-px bg-background-300" />}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${action} ${exercise.name}`}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => onToggle(exercise.id)}
                  className="min-h-14 flex-row items-center gap-3 px-4 py-3 active:bg-background-500">
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-background-400">
                    <Icon name={EQUIPMENT_ICONS[exercise.equipment]} size="small" />
                  </View>
                  <View className="flex-1 gap-2">
                    <View className="gap-0.5">
                      <Text className="text-base font-semibold text-foreground">
                        {exercise.name}
                      </Text>
                      <Text className="text-sm text-foreground-subtle">
                        {BODY_PART_LABELS[exercise.bodyPart]} · {exercise.muscles} ·{' '}
                        {exercise.kind === 'compound' ? 'Multiarticular' : 'Aislamiento'}
                      </Text>
                    </View>
                    <RequirementTags requirements={exercise.requires} />
                  </View>
                  <Icon
                    name={isSelected ? ICONS.checkCircle : ICONS.add}
                    color={isSelected ? Colors.dark.accent : Colors.dark.textSecondary}
                  />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
