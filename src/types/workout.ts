import type { Level } from '@/types/user';

/**
 * `compound` exercises (multi-joint, "core" exercises in the ACSM guidelines) move big loads
 * and need longer rest. `isolation` exercises ("assistance" exercises) need less.
 */
export type ExerciseKind = 'compound' | 'isolation';

/** `reps` sets count repetitions; `time` sets hold a position, like a plank. */
export type ExerciseTracking = 'reps' | 'time';

/** Main equipment of an exercise. The exercise filters use it. */
export const EQUIPMENT = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'] as const;
export type Equipment = (typeof EQUIPMENT)[number];

/** Everything an exercise needs, shown as tags. An empty list means no material at all. */
export type Requirement =
  | 'barbell'
  | 'plates'
  | 'rack'
  | 'bench'
  | 'incline-bench'
  | 'dumbbells'
  | 'leg-press'
  | 'chest-press'
  | 'leg-curl'
  | 'leg-extension'
  | 'cable'
  | 'pull-up-bar'
  | 'mat';

export type Exercise = {
  id: string;
  name: string;
  /** Main muscles, ready to display. */
  muscles: string;
  kind: ExerciseKind;
  tracking: ExerciseTracking;
  equipment: Equipment;
  requires: Requirement[];
};

export type Routine = {
  id: string;
  name: string;
  description: string;
  place: 'gym' | 'home';
  /** Level the routine is designed for. Any user can still choose it. Missing in custom routines. */
  level?: Level;
  /** `true` for routines the user built by choosing exercises. */
  isCustom?: boolean;
  /** Exercise ids in the order they are performed. */
  exerciseIds: string[];
};

/** Routine the user built. It is saved on the device; `toRoutine` turns it into a `Routine`. */
export type CustomRoutine = {
  id: string;
  name: string;
  exerciseIds: string[];
  /** ISO 8601 timestamp. */
  createdAt: string;
  /** ISO 8601 timestamp. */
  updatedAt: string;
};

/** How hard a set felt, measured as repetitions in reserve. */
export const EFFORTS = ['easy', 'moderate', 'hard'] as const;
export type Effort = (typeof EFFORTS)[number];

/** Rest between sets, in seconds. `base` is the starting point; effort moves it inside the range. */
export type RestRange = { min: number; base: number; max: number };

export type SetTarget =
  { kind: 'reps'; min: number; max: number } | { kind: 'time'; seconds: number };

export type Prescription = {
  sets: number;
  target: SetTarget;
  rest: RestRange;
};

export type LoggedSet = {
  exerciseId: string;
  exerciseName: string;
  /** 1-based. */
  setNumber: number;
  /** Repetitions done. Missing for `time` sets. */
  reps?: number;
  /** Missing for bodyweight exercises. */
  weightKg?: number;
  /** Seconds from the start to the end of the set. */
  workSec: number;
  effort: Effort;
  /** Rest the app suggested after this set. */
  restSuggestedSec: number;
  /** Rest the user really took before the next set. Missing after the last set. */
  restTakenSec?: number;
};

export type WorkoutLog = {
  id: string;
  routineId: string;
  routineName: string;
  /** ISO 8601 timestamp. */
  startedAt: string;
  /** ISO 8601 timestamp. */
  endedAt: string;
  durationSec: number;
  sets: LoggedSet[];
};
