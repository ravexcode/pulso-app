/**
 * User profile stored on the device. Body measurements are always kept in metric units;
 * `units` only changes how they are displayed.
 */

export const SEXES = ['male', 'female', 'other'] as const;
export const GOALS = ['lose-fat', 'build-muscle', 'maintain', 'performance'] as const;
export const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export const UNITS = ['metric', 'imperial'] as const;

export type Sex = (typeof SEXES)[number];
export type Goal = (typeof GOALS)[number];
export type Level = (typeof LEVELS)[number];
export type Units = (typeof UNITS)[number];

export type UserProfile = {
  name: string;
  /** Calendar date in `YYYY-MM-DD` format. */
  birthDate: string;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  goal: Goal;
  level: Level;
  units: Units;
  trainingDaysPerWeek: number;
  /** ISO 8601 timestamp. */
  createdAt: string;
  /** ISO 8601 timestamp. */
  updatedAt: string;
};

/** Fields the user fills in. Timestamps are set by the app. */
export type UserProfileInput = Omit<UserProfile, 'createdAt' | 'updatedAt'>;
