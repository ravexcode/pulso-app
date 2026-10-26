import { useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ChipGroup } from '@/components/ui/chip';
import { TextField } from '@/components/ui/text-field';
import { GOAL_LABELS, LEVEL_LABELS, SEX_LABELS, UNIT_LABELS } from '@/constants/labels';
import {
  GOALS,
  LEVELS,
  SEXES,
  UNITS,
  type Goal,
  type Level,
  type Sex,
  type Units,
  type UserProfileInput,
} from '@/types/user';
import {
  formatDateInput,
  fromDisplayHeight,
  fromDisplayWeight,
  heightUnit,
  parseDecimal,
  toDisplayHeight,
  toDisplayWeight,
  weightUnit,
} from '@/utils/format';
import { USER_LIMITS, validateUserProfileInput } from '@/utils/user-profile';

const DAY_OPTIONS = ['1', '2', '3', '4', '5', '6', '7'] as const;
const DAY_LABELS = Object.fromEntries(DAY_OPTIONS.map((day) => [day, day])) as Record<
  (typeof DAY_OPTIONS)[number],
  string
>;

function formatLimit(value: number) {
  return String(Math.round(value * 10) / 10);
}

/** Valid range of height and weight, in the units the user chose. */
function getBodyLimits(units: Units) {
  const { heightCm, weightKg } = USER_LIMITS;
  return {
    height: `${formatLimit(toDisplayHeight(heightCm.min, units))}–${formatLimit(toDisplayHeight(heightCm.max, units))} ${heightUnit(units)}`,
    weight: `${formatLimit(toDisplayWeight(weightKg.min, units))}–${formatLimit(toDisplayWeight(weightKg.max, units))} ${weightUnit(units)}`,
  };
}

function getErrorMessages(units: Units): Record<keyof UserProfileInput, string> {
  const limits = getBodyLimits(units);
  return {
    name: `Escribe tu nombre (máximo ${USER_LIMITS.nameMaxLength} caracteres).`,
    birthDate: 'Escribe una fecha real y pasada, con el formato AAAA-MM-DD.',
    sex: 'Elige una opción.',
    heightCm: `Escribe tu altura entre ${limits.height}.`,
    weightKg: `Escribe tu peso entre ${limits.weight}.`,
    goal: 'Elige un objetivo.',
    level: 'Elige tu nivel.',
    units: 'Elige las unidades.',
    trainingDaysPerWeek: 'Elige cuántos días puedes entrenar.',
  };
}

type ProfileFormProps = {
  onSubmit: (input: UserProfileInput) => Promise<unknown>;
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-foreground-muted">{title}</Text>
      {children}
    </View>
  );
}

function ChipRow({ children }: { children: ReactNode }) {
  return <View className="flex-row flex-wrap gap-2">{children}</View>;
}

export function ProfileForm({ onSubmit }: ProfileFormProps) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [sex, setSex] = useState<Sex>();
  const [units, setUnits] = useState<Units>('metric');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState<Goal>();
  const [level, setLevel] = useState<Level>();
  const [days, setDays] = useState<(typeof DAY_OPTIONS)[number]>('3');
  const [errors, setErrors] = useState<(keyof UserProfileInput)[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const errorMessages = getErrorMessages(units);
  const limits = getBodyLimits(units);
  const errorFor = (field: keyof UserProfileInput) =>
    errors.includes(field) ? errorMessages[field] : undefined;

  const handleSubmit = async () => {
    const heightValue = parseDecimal(height);
    const weightValue = parseDecimal(weight);
    const input = {
      name,
      birthDate: birthDate.trim(),
      sex,
      heightCm: heightValue === undefined ? undefined : fromDisplayHeight(heightValue, units),
      weightKg: weightValue === undefined ? undefined : fromDisplayWeight(weightValue, units),
      goal,
      level,
      units,
      trainingDaysPerWeek: Number(days),
    };
    const fieldErrors = validateUserProfileInput(input);
    setErrors(fieldErrors);
    if (fieldErrors.length > 0) return;

    setIsSaving(true);
    try {
      await onSubmit(input as UserProfileInput);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="gap-6">
      <TextField
        label="Nombre"
        value={name}
        onChangeText={setName}
        placeholder="Ej.: Ana"
        hint="Así te saludaremos en la app."
        autoComplete="given-name"
        textContentType="givenName"
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="next"
        maxLength={USER_LIMITS.nameMaxLength}
        error={errorFor('name')}
      />
      <TextField
        label="Fecha de nacimiento"
        value={birthDate}
        onChangeText={(text) => setBirthDate(formatDateInput(text))}
        placeholder="AAAA-MM-DD"
        hint="Año, mes y día. Ej.: 1998-04-12."
        autoComplete="birthdate-full"
        keyboardType="number-pad"
        maxLength={10}
        error={errorFor('birthDate')}
      />

      <Section title="Sexo">
        <ChipRow>
          <ChipGroup options={SEXES} labels={SEX_LABELS} value={sex} onChange={setSex} />
        </ChipRow>
        {errorFor('sex') && <Text className="text-sm text-foreground">{errorFor('sex')}</Text>}
      </Section>

      <Section title="Unidades">
        <ChipRow>
          <ChipGroup options={UNITS} labels={UNIT_LABELS} value={units} onChange={setUnits} />
        </ChipRow>
      </Section>

      <TextField
        label="Altura"
        value={height}
        onChangeText={setHeight}
        placeholder={units === 'metric' ? 'Ej.: 175' : 'Ej.: 69'}
        hint={
          units === 'metric'
            ? `En centímetros, sin zapatos. Entre ${limits.height}.`
            : `En pulgadas, sin zapatos (5 ft 9 in = 69 in). Entre ${limits.height}.`
        }
        keyboardType="decimal-pad"
        suffix={heightUnit(units)}
        error={errorFor('heightCm')}
      />
      <TextField
        label="Peso corporal"
        value={weight}
        onChangeText={setWeight}
        placeholder={units === 'metric' ? 'Ej.: 70,5' : 'Ej.: 155'}
        hint={`Tu peso actual. Entre ${limits.weight}.`}
        keyboardType="decimal-pad"
        suffix={weightUnit(units)}
        error={errorFor('weightKg')}
      />

      <Section title="Objetivo">
        <ChipRow>
          <ChipGroup options={GOALS} labels={GOAL_LABELS} value={goal} onChange={setGoal} />
        </ChipRow>
        {errorFor('goal') && <Text className="text-sm text-foreground">{errorFor('goal')}</Text>}
      </Section>

      <Section title="Experiencia entrenando">
        <ChipRow>
          <ChipGroup options={LEVELS} labels={LEVEL_LABELS} value={level} onChange={setLevel} />
        </ChipRow>
        {errorFor('level') && <Text className="text-sm text-foreground">{errorFor('level')}</Text>}
      </Section>

      <Section title="Días por semana">
        <ChipRow>
          <ChipGroup options={DAY_OPTIONS} labels={DAY_LABELS} value={days} onChange={setDays} />
        </ChipRow>
        <Text className="text-sm text-foreground-subtle">
          Para empezar, 2–3 días de cuerpo completo por semana es lo recomendado.
        </Text>
      </Section>

      <Button title="Crear perfil" onPress={() => void handleSubmit()} disabled={isSaving} />
    </View>
  );
}
