import { EXERCISES, getExercise } from '@/constants/exercises';
import { ROUTINES } from '@/constants/routines';
import { BODY_PARTS, type CustomRoutine, type Routine, type RoutineDay } from '@/types/workout';

export const CUSTOM_ROUTINE_LIMITS = {
  nameMaxLength: 40,
  minDays: 1,
  maxDays: 7,
} as const;

export type CustomRoutineInput = Pick<CustomRoutine, 'name' | 'days'>;

function isRoutineDay(value: unknown): value is RoutineDay {
  if (typeof value !== 'object' || value === null) return false;
  const { focus, exerciseIds } = value as Record<string, unknown>;
  return (
    Array.isArray(focus) &&
    focus.every((part) => (BODY_PARTS as readonly unknown[]).includes(part)) &&
    new Set(focus).size === focus.length &&
    Array.isArray(exerciseIds) &&
    exerciseIds.every((id) => typeof id === 'string' && id in EXERCISES) &&
    // An exercise may repeat on other days, but only once per day.
    new Set(exerciseIds).size === exerciseIds.length
  );
}

/** Returns the names of the invalid fields. An empty list means the input is valid. */
export function validateCustomRoutineInput(input: Record<string, unknown>) {
  const errors: (keyof CustomRoutineInput)[] = [];
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (name.length === 0 || name.length > CUSTOM_ROUTINE_LIMITS.nameMaxLength) errors.push('name');

  const { days } = input;
  if (
    !Array.isArray(days) ||
    days.length < CUSTOM_ROUTINE_LIMITS.minDays ||
    days.length > CUSTOM_ROUTINE_LIMITS.maxDays ||
    !days.every(isRoutineDay) ||
    !days.some((day) => day.exerciseIds.length > 0)
  ) {
    errors.push('days');
  }
  return errors;
}

function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

/**
 * Reads a routine from disk, which may be outdated or corrupted. Routines saved before week
 * plans had a single `exerciseIds` list; they become a one-day plan. Returns `null` when the
 * data is not valid.
 */
export function parseCustomRoutine(value: unknown): CustomRoutine | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  const days = Array.isArray(record.exerciseIds)
    ? [{ focus: [], exerciseIds: record.exerciseIds }]
    : record.days;
  const routine = { ...record, days };
  if (
    typeof record.id !== 'string' ||
    validateCustomRoutineInput(routine).length > 0 ||
    !isTimestamp(record.createdAt) ||
    !isTimestamp(record.updatedAt)
  ) {
    return null;
  }
  return {
    id: record.id,
    name: (record.name as string).trim(),
    days: days as RoutineDay[],
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export class InvalidCustomRoutineError extends Error {
  constructor(readonly fields: (keyof CustomRoutineInput)[]) {
    super(`Invalid custom routine fields: ${fields.join(', ')}`);
    this.name = 'InvalidCustomRoutineError';
  }
}

function copyDays(days: readonly RoutineDay[]): RoutineDay[] {
  return days.map((day) => ({ focus: [...day.focus], exerciseIds: [...day.exerciseIds] }));
}

export function createCustomRoutine(input: CustomRoutineInput, now = new Date()): CustomRoutine {
  const errors = validateCustomRoutineInput(input);
  if (errors.length > 0) {
    throw new InvalidCustomRoutineError(errors);
  }
  const timestamp = now.toISOString();
  return {
    id: `custom-${now.getTime()}`,
    name: input.name.trim(),
    days: copyDays(input.days),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function updateCustomRoutine(
  routine: CustomRoutine,
  input: CustomRoutineInput,
  now = new Date()
): CustomRoutine {
  const errors = validateCustomRoutineInput(input);
  if (errors.length > 0) {
    throw new InvalidCustomRoutineError(errors);
  }
  return {
    ...routine,
    name: input.name.trim(),
    days: copyDays(input.days),
    updatedAt: now.toISOString(),
  };
}

/**
 * Puts multi-joint exercises before single-joint ones, as the ACSM recommends, and keeps the
 * user's order inside each group.
 */
export function sortByGuidelines(exerciseIds: readonly string[]): string[] {
  const compound = exerciseIds.filter((id) => getExercise(id).kind === 'compound');
  const isolation = exerciseIds.filter((id) => getExercise(id).kind === 'isolation');
  return [...compound, ...isolation];
}

/** Every exercise of the routine, once, in the order it first appears. */
export function getRoutineExerciseIds(routine: Pick<Routine, 'days'>): string[] {
  return [...new Set(routine.days.flatMap((day) => day.exerciseIds))];
}

export function toRoutine(custom: CustomRoutine): Routine {
  const dayCount = custom.days.length;
  const ids = getRoutineExerciseIds(custom);
  return {
    id: custom.id,
    name: custom.name,
    description: `${dayCount} ${dayCount === 1 ? 'día' : 'días'} por semana, con ejercicios elegidos por ti.`,
    place: ids.every((id) => getExercise(id).equipment === 'bodyweight') ? 'home' : 'gym',
    isCustom: true,
    days: custom.days,
  };
}

/** Looks for a plan or a custom routine with this id. */
export function findRoutine(
  id: string | undefined,
  customRoutines: readonly CustomRoutine[]
): Routine | undefined {
  if (!id) return undefined;
  const plan = ROUTINES.find((routine) => routine.id === id);
  if (plan) return plan;
  const custom = customRoutines.find((routine) => routine.id === id);
  return custom ? toRoutine(custom) : undefined;
}
