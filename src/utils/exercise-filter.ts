import { getExercise } from '@/constants/exercises';
import { REQUIREMENT_LABELS } from '@/constants/labels';
import type { BodyPart, Equipment, Exercise, Requirement } from '@/types/workout';

/** Lowercase and without accents, so "jalon" finds "Jalón". */
function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/** Things most homes have. A pull-up bar is not one of them. */
export const HOME_REQUIREMENTS: readonly Requirement[] = ['mat', 'chair', 'table'];

/** Bodyweight exercise that needs nothing beyond `HOME_REQUIREMENTS`. */
export function isHomeExercise(exercise: Exercise) {
  return (
    exercise.equipment === 'bodyweight' &&
    exercise.requires.every((requirement) => HOME_REQUIREMENTS.includes(requirement))
  );
}

export type ExerciseFilter = {
  /** Equipment to show. An empty list shows every exercise. */
  equipment: readonly Equipment[];
  /** Body parts to show. An empty list shows every body part. */
  bodyParts?: readonly BodyPart[];
  /** Text to look for in the name or the muscles. */
  query: string;
  /** Shows only exercises that can be done at home. */
  homeOnly?: boolean;
};

export function filterExercises(
  exercises: readonly Exercise[],
  { equipment, bodyParts = [], query, homeOnly = false }: ExerciseFilter
): Exercise[] {
  const search = normalize(query);
  return exercises.filter(
    (exercise) =>
      (!homeOnly || isHomeExercise(exercise)) &&
      (equipment.length === 0 || equipment.includes(exercise.equipment)) &&
      (bodyParts.length === 0 || bodyParts.includes(exercise.bodyPart)) &&
      (search === '' ||
        normalize(exercise.name).includes(search) ||
        normalize(exercise.muscles).includes(search))
  );
}

const REQUIREMENT_ORDER = Object.keys(REQUIREMENT_LABELS) as Requirement[];

/** Everything a list of exercises needs, without repeats and in a stable order. */
export function getRequirements(exerciseIds: readonly string[]): Requirement[] {
  const needed = new Set(exerciseIds.flatMap((id) => getExercise(id).requires));
  return REQUIREMENT_ORDER.filter((requirement) => needed.has(requirement));
}
