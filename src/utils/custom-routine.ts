import { EXERCISES, getExercise } from '@/constants/exercises';
import { ROUTINES } from '@/constants/routines';
import type { CustomRoutine, Routine } from '@/types/workout';

export const CUSTOM_ROUTINE_LIMITS = {
  nameMaxLength: 40,
  maxExercises: 12,
} as const;

export type CustomRoutineInput = Pick<CustomRoutine, 'name' | 'exerciseIds'>;

/** Returns the names of the invalid fields. An empty list means the input is valid. */
export function validateCustomRoutineInput(input: Record<string, unknown>) {
  const errors: (keyof CustomRoutineInput)[] = [];
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (name.length === 0 || name.length > CUSTOM_ROUTINE_LIMITS.nameMaxLength) errors.push('name');

  const ids = input.exerciseIds;
  if (
    !Array.isArray(ids) ||
    ids.length === 0 ||
    ids.length > CUSTOM_ROUTINE_LIMITS.maxExercises ||
    new Set(ids).size !== ids.length ||
    !ids.every((id) => typeof id === 'string' && id in EXERCISES)
  ) {
    errors.push('exerciseIds');
  }
  return errors;
}

/** Checks data read from disk, which may be outdated or corrupted. */
export function isCustomRoutine(value: unknown): value is CustomRoutine {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    validateCustomRoutineInput(record).length === 0 &&
    typeof record.createdAt === 'string' &&
    !Number.isNaN(Date.parse(record.createdAt)) &&
    typeof record.updatedAt === 'string' &&
    !Number.isNaN(Date.parse(record.updatedAt))
  );
}

export class InvalidCustomRoutineError extends Error {
  constructor(readonly fields: (keyof CustomRoutineInput)[]) {
    super(`Invalid custom routine fields: ${fields.join(', ')}`);
    this.name = 'InvalidCustomRoutineError';
  }
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
    exerciseIds: [...input.exerciseIds],
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
    exerciseIds: [...input.exerciseIds],
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

export function toRoutine(custom: CustomRoutine): Routine {
  const count = custom.exerciseIds.length;
  return {
    id: custom.id,
    name: custom.name,
    description: `${count} ${count === 1 ? 'ejercicio elegido' : 'ejercicios elegidos'} por ti.`,
    place: custom.exerciseIds.every((id) => getExercise(id).equipment === 'bodyweight')
      ? 'home'
      : 'gym',
    isCustom: true,
    exerciseIds: custom.exerciseIds,
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
