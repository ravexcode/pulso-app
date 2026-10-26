import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Icon, type IconName } from '@/components/ui/icon';
import { Card } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { BodyPartPalette, type DragPoint } from '@/components/workout/body-part-palette';
import { ExercisePicker } from '@/components/workout/exercise-picker';
import { RequirementTags } from '@/components/workout/requirement-tags';
import { getExercise } from '@/constants/exercises';
import { EQUIPMENT_ICONS, ICONS } from '@/constants/icons';
import { BODY_PART_LABELS } from '@/constants/labels';
import type { BodyPart, RoutineDay } from '@/types/workout';
import {
  CUSTOM_ROUTINE_LIMITS,
  getRoutineExerciseIds,
  type CustomRoutineInput,
} from '@/utils/custom-routine';
import { getRequirements } from '@/utils/exercise-filter';
import {
  addFocus,
  autoSortWeek,
  countExercises,
  createEmptyDays,
  getExerciseDays,
  getRecoveryWarnings,
  getSplitTemplate,
  moveExercise,
  removeFocus,
  setDayCount,
  toggleExercise,
} from '@/utils/week-plan';

type RoutineEditorProps = {
  initial?: CustomRoutineInput;
  /** Days of a new routine, usually the training days of the user's profile. */
  defaultDayCount?: number;
  onSave: (input: CustomRoutineInput) => Promise<unknown>;
  /** Shown only when editing a saved routine. */
  onDelete?: () => Promise<unknown>;
};

type Rect = { x: number; y: number; width: number; height: number };
type ViewRef = ComponentRef<typeof View>;

/** Round 44 pt button with only an icon. `label` is read by screen readers. */
function IconButton({
  label,
  icon,
  disabled,
  onPress,
}: {
  label: string;
  icon: IconName;
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
      className={`h-11 w-11 items-center justify-center rounded-full bg-background-300 active:opacity-70 ${disabled ? 'opacity-30' : ''}`}>
      <Icon name={icon} size="small" />
    </Pressable>
  );
}

function partsLabel(parts: readonly BodyPart[]) {
  return parts.map((part) => BODY_PART_LABELS[part]).join(', ');
}

export function RoutineEditor({
  initial,
  defaultDayCount = 3,
  onSave,
  onDelete,
}: RoutineEditorProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [days, setDays] = useState<RoutineDay[]>(initial?.days ?? createEmptyDays(defaultDayCount));
  const [pickerDay, setPickerDay] = useState<number>();
  /** Exercise whose "repeat on" day chips are open, as `day:exerciseId`. */
  const [repeatOpen, setRepeatOpen] = useState<string>();
  const [armedPart, setArmedPart] = useState<BodyPart>();
  const [hoveredDay, setHoveredDay] = useState<number>();
  const [showErrors, setShowErrors] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const dayViews = useRef<(ViewRef | null)[]>([]);
  const dayRects = useRef<(Rect | undefined)[]>([]);

  const exerciseCount = countExercises(days);
  const template = getSplitTemplate(days.length);
  const warnings = getRecoveryWarnings(days);
  const nameError = showErrors && name.trim() === '' ? 'Ponle un nombre a tu rutina.' : undefined;
  const exercisesError =
    showErrors && exerciseCount === 0 ? 'Añade al menos un ejercicio a algún día.' : undefined;

  // Drag & drop of body parts: the day cards are measured when a drag starts.
  const measureDays = () => {
    dayViews.current.forEach((view, index) =>
      view?.measureInWindow((x: number, y: number, width: number, height: number) => {
        dayRects.current[index] = { x, y, width, height };
      })
    );
  };

  const findDay = ({ x, y }: DragPoint) => {
    const index = dayRects.current.findIndex(
      (rect) =>
        rect && x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height
    );
    return index >= 0 && index < days.length ? index : undefined;
  };

  const handleDrop = (part: BodyPart, point: DragPoint) => {
    setHoveredDay(undefined);
    const index = findDay(point);
    if (index !== undefined) setDays((current) => addFocus(current, index, part));
  };

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
    if (name.trim() === '' || exerciseCount === 0) return;
    void run(() => onSave({ name, days }));
  };

  const changeDayCount = (count: number) => {
    setDays((current) => setDayCount(current, count));
    setPickerDay(undefined);
  };

  return (
    <View className="gap-6">
      <TextField
        label="Nombre de la rutina"
        value={name}
        onChangeText={setName}
        placeholder="Ej.: Mi semana de fuerza"
        hint={`Máximo ${CUSTOM_ROUTINE_LIMITS.nameMaxLength} caracteres.`}
        maxLength={CUSTOM_ROUTINE_LIMITS.nameMaxLength}
        autoCapitalize="sentences"
        error={nameError}
      />

      <View className="gap-2">
        <Text className="text-sm font-semibold text-foreground-muted">Días por semana</Text>
        <View className="flex-row items-center gap-4">
          <IconButton
            label="Quitar un día"
            icon={ICONS.remove}
            disabled={days.length <= CUSTOM_ROUTINE_LIMITS.minDays}
            onPress={() => changeDayCount(days.length - 1)}
          />
          <Text
            accessibilityLabel={`${days.length} días por semana`}
            className="text-3xl font-bold text-foreground">
            {days.length}
          </Text>
          <IconButton
            label="Añadir un día"
            icon={ICONS.add}
            disabled={days.length >= CUSTOM_ROUTINE_LIMITS.maxDays}
            onPress={() => changeDayCount(days.length + 1)}
          />
        </View>
        <Text className="text-sm text-foreground-subtle">
          Al quitar un día, sus ejercicios pasan al día anterior.
        </Text>
      </View>

      <Card>
        <Text className="text-sm font-semibold text-foreground-muted">
          Recomendado para {days.length} {days.length === 1 ? 'día' : 'días'}
        </Text>
        <Text className="text-lg font-bold text-foreground">{template.name}</Text>
        <Text className="text-sm text-foreground-muted">
          Reparte tus ejercicios con esta división, repite en días separados los que aparecen más de
          una vez y pone primero los multiarticulares. Deja unas 48 h antes de volver a entrenar el
          mismo grupo muscular.
        </Text>
        <Button
          title="Ordenar automáticamente"
          icon={ICONS.sparkles}
          disabled={exerciseCount === 0}
          onPress={() => setDays(autoSortWeek)}
        />
      </Card>

      <BodyPartPalette
        armedPart={armedPart}
        onArm={setArmedPart}
        onDragStart={() => {
          setArmedPart(undefined);
          measureDays();
        }}
        onDragMove={(point) => {
          const index = findDay(point);
          setHoveredDay((current) => (current === index ? current : index));
        }}
        onDrop={handleDrop}
      />

      {exercisesError && <Text className="text-base text-foreground">{exercisesError}</Text>}

      {days.map((day, dayIndex) => {
        const dayNumber = dayIndex + 1;
        const dayWarnings = warnings.filter((warning) => warning.dayIndex === dayIndex);
        return (
          <View
            key={dayIndex}
            ref={(view) => {
              dayViews.current[dayIndex] = view;
            }}
            collapsable={false}
            className={`gap-4 rounded-2xl border p-4 ${hoveredDay === dayIndex ? 'border-accent bg-background-500' : 'border-background-400 bg-background-700'}`}>
            <View className="flex-row items-center justify-between gap-3">
              <Text accessibilityRole="header" className="text-xl font-bold text-foreground">
                Día {dayNumber}
              </Text>
              <Text className="text-sm text-foreground-subtle">
                {day.exerciseIds.length === 0
                  ? 'Descanso'
                  : `${day.exerciseIds.length} ${day.exerciseIds.length === 1 ? 'ejercicio' : 'ejercicios'}`}
              </Text>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground-muted">Foco del día</Text>
              <View className="flex-row flex-wrap gap-2">
                {day.focus.length === 0 && (
                  <Text className="text-sm text-foreground-subtle">
                    Suelta aquí partes del cuerpo.
                  </Text>
                )}
                {day.focus.map((part) => (
                  <Chip
                    key={part}
                    label={BODY_PART_LABELS[part]}
                    trailingIcon={ICONS.close}
                    accessibilityLabel={`Quitar ${BODY_PART_LABELS[part]} del foco del día ${dayNumber}`}
                    selected
                    onPress={() => setDays((current) => removeFocus(current, dayIndex, part))}
                  />
                ))}
              </View>
              {armedPart && !day.focus.includes(armedPart) && (
                <Button
                  title={`Añadir ${BODY_PART_LABELS[armedPart]} al foco`}
                  accessibilityLabel={`Añadir ${BODY_PART_LABELS[armedPart]} al foco del día ${dayNumber}`}
                  variant="secondary"
                  size="small"
                  onPress={() => {
                    setDays((current) => addFocus(current, dayIndex, armedPart));
                    setArmedPart(undefined);
                  }}
                />
              )}
            </View>

            {day.exerciseIds.map((id, position) => {
              const exercise = getExercise(id);
              const repeatKey = `${dayIndex}:${id}`;
              const repeatDays = getExerciseDays(days, id);
              return (
                <View key={id} className="gap-3 rounded-2xl bg-background-500 p-3">
                  <View className="flex-row items-center gap-2">
                    <View className="h-9 w-9 items-center justify-center rounded-xl bg-background-300">
                      <Icon name={EQUIPMENT_ICONS[exercise.equipment]} size="small" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground" numberOfLines={2}>
                        {exercise.name}
                      </Text>
                      <Text className="text-sm text-foreground-subtle">
                        {BODY_PART_LABELS[exercise.bodyPart]}
                        {repeatDays.length > 1 && ` · ${repeatDays.length} veces por semana`}
                      </Text>
                    </View>
                    <IconButton
                      label={`Subir ${exercise.name} en el día ${dayNumber}`}
                      icon={ICONS.moveUp}
                      disabled={position === 0}
                      onPress={() =>
                        setDays((current) => moveExercise(current, dayIndex, position, -1))
                      }
                    />
                    <IconButton
                      label={`Bajar ${exercise.name} en el día ${dayNumber}`}
                      icon={ICONS.moveDown}
                      disabled={position === day.exerciseIds.length - 1}
                      onPress={() =>
                        setDays((current) => moveExercise(current, dayIndex, position, 1))
                      }
                    />
                    <IconButton
                      label={`Quitar ${exercise.name} del día ${dayNumber}`}
                      icon={ICONS.close}
                      onPress={() => setDays((current) => toggleExercise(current, dayIndex, id))}
                    />
                  </View>

                  {days.length > 1 && (
                    <Button
                      title={repeatOpen === repeatKey ? 'Listo' : 'Repetir en otros días'}
                      icon={repeatOpen === repeatKey ? ICONS.check : ICONS.repeat}
                      accessibilityLabel={`Repetir ${exercise.name} en otros días`}
                      variant="secondary"
                      size="small"
                      onPress={() =>
                        setRepeatOpen((current) => (current === repeatKey ? undefined : repeatKey))
                      }
                    />
                  )}
                  {repeatOpen === repeatKey && (
                    <View className="flex-row flex-wrap gap-2">
                      {days.map((_, otherIndex) => (
                        <Chip
                          key={otherIndex}
                          label={`Día ${otherIndex + 1}`}
                          accessibilityLabel={`${exercise.name} en el día ${otherIndex + 1}`}
                          selected={repeatDays.includes(otherIndex)}
                          onPress={() =>
                            setDays((current) => toggleExercise(current, otherIndex, id))
                          }
                        />
                      ))}
                    </View>
                  )}
                </View>
              );
            })}

            {dayWarnings.map((warning) => (
              <View
                key={warning.previousDayIndex}
                className="flex-row items-start gap-2 rounded-xl bg-background-500 p-3">
                <Icon name={ICONS.warning} size="small" />
                <Text className="flex-1 text-sm text-foreground">
                  {partsLabel(warning.parts)} también se entrena el día{' '}
                  {warning.previousDayIndex + 1}. Deja unas 48 h entre sesiones del mismo grupo.
                </Text>
              </View>
            ))}

            <Button
              title={pickerDay === dayIndex ? 'Cerrar catálogo' : 'Añadir ejercicios'}
              icon={pickerDay === dayIndex ? ICONS.close : ICONS.add}
              accessibilityLabel={
                pickerDay === dayIndex
                  ? `Cerrar catálogo del día ${dayNumber}`
                  : `Añadir ejercicios al día ${dayNumber}`
              }
              variant={pickerDay === dayIndex ? 'secondary' : 'primary'}
              size="small"
              onPress={() =>
                setPickerDay((current) => (current === dayIndex ? undefined : dayIndex))
              }
            />
            {pickerDay === dayIndex && (
              <ExercisePicker
                key={dayIndex}
                selectedIds={day.exerciseIds}
                initialBodyParts={day.focus}
                onToggle={(id) => setDays((current) => toggleExercise(current, dayIndex, id))}
              />
            )}
          </View>
        );
      })}

      {exerciseCount > 0 && (
        <Card>
          <Text className="text-sm font-semibold text-foreground-muted">
            Necesitas para toda la semana
          </Text>
          <RequirementTags requirements={getRequirements(getRoutineExerciseIds({ days }))} />
        </Card>
      )}

      <View className="gap-2">
        <Button title="Guardar rutina" icon={ICONS.check} onPress={handleSave} disabled={isSaving} />
        {onDelete && (
          <Button
            title="Eliminar rutina"
            icon={ICONS.trash}
            variant="plain"
            onPress={() => void run(onDelete)}
            disabled={isSaving}
          />
        )}
      </View>
    </View>
  );
}
