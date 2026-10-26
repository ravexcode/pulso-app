import {
  GOALS,
  LEVELS,
  SEXES,
  UNITS,
  type UserProfile,
  type UserProfileInput,
} from '@/types/user';

export const USER_LIMITS = {
  nameMaxLength: 50,
  heightCm: { min: 50, max: 272 },
  weightKg: { min: 20, max: 400 },
  trainingDaysPerWeek: { min: 1, max: 7 },
} as const;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isOneOf<T extends string>(options: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && (options as readonly string[]).includes(value);
}

function isInRange(value: unknown, range: { min: number; max: number }): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= range.min && value <= range.max;
}

function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

/** A real calendar date in `YYYY-MM-DD` format that is not in the future. */
export function isValidBirthDate(value: unknown, now = new Date()): value is string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  // Rejects dates like 2024-02-31, which `Date` silently rolls over.
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return false;
  }
  return date.getTime() <= now.getTime();
}

/** Returns the names of the invalid fields. An empty list means the input is valid. */
export function validateUserProfileInput(input: Record<string, unknown>, now = new Date()) {
  const errors: (keyof UserProfileInput)[] = [];
  const name = typeof input.name === 'string' ? input.name.trim() : '';

  if (name.length === 0 || name.length > USER_LIMITS.nameMaxLength) errors.push('name');
  if (!isValidBirthDate(input.birthDate, now)) errors.push('birthDate');
  if (!isOneOf(SEXES, input.sex)) errors.push('sex');
  if (!isInRange(input.heightCm, USER_LIMITS.heightCm)) errors.push('heightCm');
  if (!isInRange(input.weightKg, USER_LIMITS.weightKg)) errors.push('weightKg');
  if (!isOneOf(GOALS, input.goal)) errors.push('goal');
  if (!isOneOf(LEVELS, input.level)) errors.push('level');
  if (!isOneOf(UNITS, input.units)) errors.push('units');
  if (
    !Number.isInteger(input.trainingDaysPerWeek) ||
    !isInRange(input.trainingDaysPerWeek, USER_LIMITS.trainingDaysPerWeek)
  ) {
    errors.push('trainingDaysPerWeek');
  }

  return errors;
}

/** Checks data read from disk, which may be outdated or corrupted. */
export function isUserProfile(value: unknown): value is UserProfile {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    validateUserProfileInput(record).length === 0 &&
    isTimestamp(record.createdAt) &&
    isTimestamp(record.updatedAt)
  );
}

export class InvalidUserProfileError extends Error {
  constructor(readonly fields: (keyof UserProfileInput)[]) {
    super(`Invalid user profile fields: ${fields.join(', ')}`);
    this.name = 'InvalidUserProfileError';
  }
}

function toProfileFields(input: UserProfileInput): UserProfileInput {
  return {
    name: input.name.trim(),
    birthDate: input.birthDate,
    sex: input.sex,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    goal: input.goal,
    level: input.level,
    units: input.units,
    trainingDaysPerWeek: input.trainingDaysPerWeek,
  };
}

export function createUserProfile(input: UserProfileInput, now = new Date()): UserProfile {
  const errors = validateUserProfileInput(input, now);
  if (errors.length > 0) {
    throw new InvalidUserProfileError(errors);
  }
  const timestamp = now.toISOString();
  return { ...toProfileFields(input), createdAt: timestamp, updatedAt: timestamp };
}

export function updateUserProfile(
  profile: UserProfile,
  changes: Partial<UserProfileInput>,
  now = new Date()
): UserProfile {
  const input = { ...toProfileFields(profile), ...changes };
  const errors = validateUserProfileInput(input, now);
  if (errors.length > 0) {
    throw new InvalidUserProfileError(errors);
  }
  return { ...toProfileFields(input), createdAt: profile.createdAt, updatedAt: now.toISOString() };
}
