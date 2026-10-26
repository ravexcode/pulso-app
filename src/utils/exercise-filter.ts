import { getExercise } from '@/constants/exercises';
import { REQUIREMENT_LABELS } from '@/constants/labels';
import type { Equipment, Exercise, Requirement } from '@/types/workout';

/** Lowercase and without accents, so "jalon" finds "Jalón". */
function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export type ExerciseFilter = {
  /** Equipment to show. An empty list shows every exercise. */
  equipment: readonly Equipment[];
  /** Text to look for in the name or the muscles. */
  query: string;
};

export function filterExercises(
  exercises: readonly Exercise[],
  { equipment, query }: ExerciseFilter
): Exercise[] {
  const search = normalize(query);
  return exercises.filter(
    (exercise) =>
      (equipment.length === 0 || equipment.includes(exercise.equipment)) &&
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
