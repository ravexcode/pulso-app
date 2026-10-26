/**
 * Week plans: the training days of a custom routine, with their focus and exercises.
 *
 * The automatic split follows the ACSM Position Stand (2009): total-body workouts for 1–3 days
 * per week, upper/lower splits for 4 days and body-part splits for 5–6 days, with multi-joint
 * exercises before single-joint ones. The ACSM also advises against training the same muscle
 * group on consecutive days (about 48 h of recovery), so repeated exercises are spread apart.
 */

import { getExercise } from '@/constants/exercises';
import { BODY_PARTS, type BodyPart, type RoutineDay } from '@/types/workout';
import { sortByGuidelines } from '@/utils/custom-routine';

export const WEEK_LIMITS = { minDays: 1, maxDays: 7 } as const;

const UPPER: BodyPart[] = ['chest', 'back', 'shoulders', 'biceps', 'triceps'];
const LOWER: BodyPart[] = ['legs', 'glutes', 'core'];
const PUSH: BodyPart[] = ['chest', 'shoulders', 'triceps'];
const PULL: BodyPart[] = ['back', 'biceps'];
const LEGS: BodyPart[] = ['legs', 'glutes', 'core'];

export type SplitTemplate = {
  name: string;
  /** Body parts of each day. */
  days: BodyPart[][];
};

/** Recommended split for a number of training days per week. */
export function getSplitTemplate(dayCount: number): SplitTemplate {
  switch (dayCount) {
    case 1:
      return { name: 'Cuerpo completo', days: [[...BODY_PARTS]] };
    case 2:
      return { name: 'Superior / Inferior', days: [UPPER, LOWER] };
    case 3:
      return { name: 'Empuje / Tirón / Pierna', days: [PUSH, PULL, LEGS] };
    case 4:
      return { name: 'Superior / Inferior, dos veces', days: [UPPER, LOWER, UPPER, LOWER] };
    case 5:
      return {
        name: 'Empuje / Tirón / Pierna / Superior / Inferior',
        days: [PUSH, PULL, LEGS, UPPER, LOWER],
      };
    case 6:
      return {
        name: 'Empuje / Tirón / Pierna, dos veces',
        days: [PUSH, PULL, LEGS, PUSH, PULL, LEGS],
      };
    default:
      return {
        name: 'Empuje / Tirón / Pierna, dos veces, y un día de core',
        days: [PUSH, PULL, LEGS, PUSH, PULL, LEGS, ['core']],
      };
  }
}

export function createEmptyDays(count: number): RoutineDay[] {
  return Array.from({ length: count }, () => ({ focus: [], exerciseIds: [] }));
}

function unique<T>(items: readonly T[]): T[] {
  return [...new Set(items)];
}

/**
 * Changes the number of days. New days start empty. When days are removed, their focus and
 * exercises move to the last day that stays, so nothing is lost.
 */
export function setDayCount(days: readonly RoutineDay[], count: number): RoutineDay[] {
  const target = Math.min(WEEK_LIMITS.maxDays, Math.max(WEEK_LIMITS.minDays, count));
  if (target >= days.length) {
    return [...days, ...createEmptyDays(target - days.length)];
  }
  const kept = days.slice(0, target);
  const removed = days.slice(target);
  const last = kept[target - 1];
  kept[target - 1] = {
    focus: unique([...last.focus, ...removed.flatMap((day) => day.focus)]),
    exerciseIds: unique([...last.exerciseIds, ...removed.flatMap((day) => day.exerciseIds)]),
  };
  return kept;
}

function updateDay(
  days: readonly RoutineDay[],
  index: number,
  change: (day: RoutineDay) => RoutineDay
): RoutineDay[] {
  return days.map((day, dayIndex) => (dayIndex === index ? change(day) : day));
}

export function addFocus(days: readonly RoutineDay[], index: number, part: BodyPart) {
  return updateDay(days, index, (day) =>
    day.focus.includes(part) ? day : { ...day, focus: [...day.focus, part] }
  );
}

export function removeFocus(days: readonly RoutineDay[], index: number, part: BodyPart) {
  return updateDay(days, index, (day) => ({
    ...day,
    focus: day.focus.filter((item) => item !== part),
  }));
}

/** Adds the exercise to the day, or removes it if the day already has it. */
export function toggleExercise(days: readonly RoutineDay[], index: number, exerciseId: string) {
  return updateDay(days, index, (day) => ({
    ...day,
    exerciseIds: day.exerciseIds.includes(exerciseId)
      ? day.exerciseIds.filter((id) => id !== exerciseId)
      : [...day.exerciseIds, exerciseId],
  }));
}

/** Swaps an exercise with the one before (`-1`) or after (`1`) it in the same day. */
export function moveExercise(
  days: readonly RoutineDay[],
  index: number,
  position: number,
  offset: -1 | 1
) {
  return updateDay(days, index, (day) => {
    const target = position + offset;
    if (target < 0 || target >= day.exerciseIds.length) return day;
    const exerciseIds = [...day.exerciseIds];
    [exerciseIds[position], exerciseIds[target]] = [exerciseIds[target], exerciseIds[position]];
    return { ...day, exerciseIds };
  });
}

/** Indexes of the days that include the exercise. */
export function getExerciseDays(days: readonly RoutineDay[], exerciseId: string): number[] {
  return days.flatMap((day, index) => (day.exerciseIds.includes(exerciseId) ? [index] : []));
}

/** Body parts the exercises of a day train, in `BODY_PARTS` order. */
export function getTrainedParts(day: RoutineDay): BodyPart[] {
  const parts = new Set(day.exerciseIds.map((id) => getExercise(id).bodyPart));
  return BODY_PARTS.filter((part) => parts.has(part));
}

export function countExercises(days: readonly RoutineDay[]) {
  return days.reduce((total, day) => total + day.exerciseIds.length, 0);
}

/** Days are a cycle: after the last day of the week comes the first one again. */
function cyclicDistance(a: number, b: number, count: number) {
  const distance = Math.abs(a - b);
  return Math.min(distance, count - distance);
}

/**
 * Distributes the exercises over the days with the recommended split. Every exercise keeps how
 * many times it appears in the week; repeats go on days as far apart as possible. Inside each
 * day, multi-joint exercises go first. The focus of each day becomes its split body parts.
 */
export function autoSortWeek(days: readonly RoutineDay[]): RoutineDay[] {
  const count = days.length;
  const template = getSplitTemplate(count);
  const frequency = new Map<string, number>();
  days.forEach((day) =>
    day.exerciseIds.forEach((id) => frequency.set(id, (frequency.get(id) ?? 0) + 1))
  );

  // Exercises that repeat more, and multi-joint ones, get their days first.
  const order = sortByGuidelines([...frequency.keys()]).sort(
    (a, b) => (frequency.get(b) ?? 0) - (frequency.get(a) ?? 0)
  );

  const result: string[][] = createEmptyDays(count).map(() => []);
  for (const id of order) {
    const part = getExercise(id).bodyPart;
    const times = Math.min(frequency.get(id) ?? 1, count);
    const chosen: number[] = [];
    for (let time = 0; time < times; time++) {
      let best = -1;
      let bestScore = Infinity;
      for (let index = 0; index < count; index++) {
        if (chosen.includes(index)) continue;
        const fitsSplit = template.days[index].includes(part);
        const closest = chosen.length
          ? Math.min(...chosen.map((other) => cyclicDistance(index, other, count)))
          : count;
        // Lower is better: matching the split matters most, then spacing, then a light day.
        const score =
          (fitsSplit ? 0 : 1000) +
          (closest <= 1 && count > 2 ? 100 : 0) -
          closest * 10 +
          result[index].length;
        if (score < bestScore) {
          bestScore = score;
          best = index;
        }
      }
      chosen.push(best);
      result[best].push(id);
    }
  }

  return result.map((exerciseIds, index) => ({
    focus: [...template.days[index]],
    exerciseIds: sortByGuidelines(exerciseIds),
  }));
}

export type RecoveryWarning = { dayIndex: number; previousDayIndex: number; parts: BodyPart[] };

/** Body parts trained on a day and also on the day before it. */
export function getRecoveryWarnings(days: readonly RoutineDay[]): RecoveryWarning[] {
  if (days.length < 2) return [];
  const trained = days.map(getTrainedParts);
  return days.flatMap((_, index) => {
    // With 7 days the week has no rest day, so the last day also touches the first one.
    const previous = index === 0 ? (days.length === 7 ? days.length - 1 : -1) : index - 1;
    if (previous < 0) return [];
    const parts = trained[index].filter((part) => trained[previous].includes(part));
    return parts.length ? [{ dayIndex: index, previousDayIndex: previous, parts }] : [];
  });
}
