/**
 * Sets, repetitions and rest for each exercise, based on the user's goal and level.
 *
 * Sources:
 * - ACSM Position Stand "Progression Models in Resistance Training for Healthy Adults" (2009):
 *   novices use 8–12 RM and 1–3 sets; strength uses at least 2–3 min of rest for core
 *   (multi-joint) exercises and 1–2 min for assistance exercises, with 3–5 min for heavy loads
 *   in advanced lifters; hypertrophy uses 1–2 min for novice and intermediate lifters and 2–3 min
 *   for heavy core exercises in advanced lifters; muscular endurance uses 10–25 repetitions with
 *   less than 1 min of rest for 10–15 repetitions and 1–2 min for 15–20 or more.
 * - NSCA (Essentials of Strength Training and Conditioning): 2–5 min for strength,
 *   30–90 s for hypertrophy, 30 s or less for muscular endurance.
 * - Schoenfeld et al. 2016 (J Strength Cond Res 30(7):1805–12): 3 min rests gave more strength
 *   and muscle growth than 1 min rests in trained men, so compound rests here lean long.
 */

import { getExercise } from '@/constants/exercises';
import type { Goal, Level } from '@/types/user';
import type {
  Effort,
  Exercise,
  ExerciseKind,
  Prescription,
  RestRange,
  Routine,
  SetTarget,
} from '@/types/workout';

type RepRange = { min: number; max: number };

const REPS: Record<Goal, Record<ExerciseKind, RepRange>> = {
  performance: { compound: { min: 4, max: 6 }, isolation: { min: 8, max: 12 } },
  'build-muscle': { compound: { min: 8, max: 12 }, isolation: { min: 10, max: 15 } },
  'lose-fat': { compound: { min: 12, max: 15 }, isolation: { min: 15, max: 20 } },
  maintain: { compound: { min: 8, max: 12 }, isolation: { min: 10, max: 15 } },
};

/** ACSM: novices train with 8–12 RM loads until they learn the movements. */
const BEGINNER_REPS: Record<ExerciseKind, RepRange> = {
  compound: { min: 8, max: 12 },
  isolation: { min: 10, max: 15 },
};

const SETS: Record<Level, Record<ExerciseKind, number>> = {
  beginner: { compound: 2, isolation: 2 },
  intermediate: { compound: 3, isolation: 3 },
  advanced: { compound: 4, isolation: 3 },
};

/** Seconds to hold a `time` exercise, like a plank. */
const HOLD_SECONDS: Record<Level, number> = {
  beginner: 30,
  intermediate: 45,
  advanced: 60,
};

const REST: Record<Goal, Record<ExerciseKind, RestRange>> = {
  performance: {
    compound: { min: 120, base: 180, max: 300 },
    isolation: { min: 60, base: 90, max: 120 },
  },
  'build-muscle': {
    compound: { min: 90, base: 120, max: 180 },
    isolation: { min: 60, base: 75, max: 120 },
  },
  'lose-fat': {
    compound: { min: 45, base: 60, max: 90 },
    isolation: { min: 30, base: 45, max: 60 },
  },
  maintain: {
    compound: { min: 60, base: 90, max: 150 },
    isolation: { min: 45, base: 60, max: 90 },
  },
};

/** Advanced lifters move heavier loads on core exercises, so they start from a longer rest. */
const ADVANCED_COMPOUND_BASE: Partial<Record<Goal, number>> = {
  performance: 240,
  'build-muscle': 150,
};

/** How much each effort changes the base rest. A harder set needs more recovery. */
const EFFORT_FACTOR: Record<Effort, number> = {
  easy: 0.75,
  moderate: 1,
  hard: 1.25,
};

/** About 3 s per repetition: 1–2 s lifting and 1–2 s lowering, as the ACSM suggests. */
const SECONDS_PER_REP = 3;

export function getPrescription(exercise: Exercise, goal: Goal, level: Level): Prescription {
  const { kind } = exercise;
  const reps = level === 'beginner' && goal !== 'lose-fat' ? BEGINNER_REPS[kind] : REPS[goal][kind];
  const target: SetTarget =
    exercise.tracking === 'time'
      ? { kind: 'time', seconds: HOLD_SECONDS[level] }
      : { kind: 'reps', ...reps };

  const range = REST[goal][kind];
  const advancedBase =
    kind === 'compound' && level === 'advanced' ? ADVANCED_COMPOUND_BASE[goal] : undefined;
  const rest = advancedBase ? { ...range, base: Math.min(advancedBase, range.max) } : range;

  return { sets: SETS[level][kind], target, rest };
}

function roundTo5(seconds: number) {
  return Math.round(seconds / 5) * 5;
}

/**
 * Rest before the next set. A hard set, or a set that missed the target repetitions, gets more
 * rest; an easy set gets less. The result always stays inside the range of the exercise.
 */
export function calculateRest(
  prescription: Prescription,
  result: { effort: Effort; reps?: number }
): number {
  const { rest, target } = prescription;
  const missedTarget =
    target.kind === 'reps' && result.reps !== undefined && result.reps < target.min;
  const factor = missedTarget
    ? Math.max(EFFORT_FACTOR[result.effort], EFFORT_FACTOR.hard)
    : EFFORT_FACTOR[result.effort];

  return Math.min(rest.max, Math.max(rest.min, roundTo5(rest.base * factor)));
}

/** Estimated duration of a whole routine in minutes, with the base rest between sets. */
export function estimateRoutineMinutes(routine: Routine, goal: Goal, level: Level): number {
  let seconds = 0;
  routine.exerciseIds.forEach((id) => {
    const { sets, target, rest } = getPrescription(getExercise(id), goal, level);
    const setSeconds =
      target.kind === 'time' ? target.seconds : ((target.min + target.max) / 2) * SECONDS_PER_REP;
    seconds += sets * (setSeconds + rest.base);
  });
  return Math.round(seconds / 60);
}
