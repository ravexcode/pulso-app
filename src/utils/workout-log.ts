import { EFFORTS, type LoggedSet, type Routine, type WorkoutLog } from '@/types/workout';

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isOptionalNonNegativeNumber(value: unknown) {
  return value === undefined || isNonNegativeNumber(value);
}

function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function isLoggedSet(value: unknown): value is LoggedSet {
  if (typeof value !== 'object' || value === null) return false;
  const set = value as Record<string, unknown>;
  return (
    typeof set.exerciseId === 'string' &&
    typeof set.exerciseName === 'string' &&
    Number.isInteger(set.setNumber) &&
    isOptionalNonNegativeNumber(set.reps) &&
    isOptionalNonNegativeNumber(set.weightKg) &&
    isNonNegativeNumber(set.workSec) &&
    (EFFORTS as readonly unknown[]).includes(set.effort) &&
    isNonNegativeNumber(set.restSuggestedSec) &&
    isOptionalNonNegativeNumber(set.restTakenSec)
  );
}

function isLogDay(value: unknown) {
  if (typeof value !== 'object' || value === null) return false;
  const { index, count } = value as Record<string, unknown>;
  return (
    Number.isInteger(index) &&
    Number.isInteger(count) &&
    (index as number) >= 0 &&
    (index as number) < (count as number)
  );
}

/** Checks data read from disk, which may be outdated or corrupted. */
export function isWorkoutLog(value: unknown): value is WorkoutLog {
  if (typeof value !== 'object' || value === null) return false;
  const log = value as Record<string, unknown>;
  return (
    typeof log.id === 'string' &&
    typeof log.routineId === 'string' &&
    typeof log.routineName === 'string' &&
    (log.day === undefined || isLogDay(log.day)) &&
    isTimestamp(log.startedAt) &&
    isTimestamp(log.endedAt) &&
    isNonNegativeNumber(log.durationSec) &&
    Array.isArray(log.sets) &&
    log.sets.every(isLoggedSet)
  );
}

export type WorkoutSummary = {
  setCount: number;
  workSec: number;
  restSec: number;
  /** Sum of weight × reps. */
  volumeKg: number;
};

export function summarizeWorkout(log: WorkoutLog): WorkoutSummary {
  return log.sets.reduce<WorkoutSummary>(
    (summary, set) => ({
      setCount: summary.setCount + 1,
      workSec: summary.workSec + set.workSec,
      restSec: summary.restSec + (set.restTakenSec ?? 0),
      volumeKg: summary.volumeKg + (set.weightKg ?? 0) * (set.reps ?? 0),
    }),
    { setCount: 0, workSec: 0, restSec: 0, volumeKg: 0 }
  );
}

/** Start of the current week (Monday 00:00, local time). */
export function getStartOfWeek(now: Date): Date {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const daysSinceMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - daysSinceMonday);
  return start;
}

export function countWorkoutsThisWeek(history: readonly WorkoutLog[], now = new Date()) {
  const start = getStartOfWeek(now).getTime();
  return history.filter((log) => Date.parse(log.startedAt) >= start).length;
}

/**
 * Weight of the last time the user did this exercise, to pre-fill the next set.
 * `history` is sorted from newest to oldest.
 */
export function getLastWeightKg(history: readonly WorkoutLog[], exerciseId: string) {
  for (const log of history) {
    for (let index = log.sets.length - 1; index >= 0; index--) {
      const set = log.sets[index];
      if (set.exerciseId === exerciseId && set.weightKg !== undefined) {
        return set.weightKg;
      }
    }
  }
  return undefined;
}

/**
 * Day of the routine to train next: the first day with exercises after the last trained day of
 * this routine, or the first day with exercises. `history` is sorted from newest to oldest.
 */
export function getNextDayIndex(history: readonly WorkoutLog[], routine: Routine): number {
  const count = routine.days.length;
  const last = history.find((log) => log.routineId === routine.id && log.day !== undefined);
  const start = last?.day && last.day.count === count ? last.day.index + 1 : 0;
  for (let step = 0; step < count; step++) {
    const index = (start + step) % count;
    if (routine.days[index].exerciseIds.length > 0) return index;
  }
  return 0;
}

/**
 * Days of the current week (Monday first) with at least one workout, to draw the week strip.
 */
export function getWeekActivity(history: readonly WorkoutLog[], now = new Date()): boolean[] {
  const start = getStartOfWeek(now);
  const days = Array.from({ length: 7 }, () => false);
  for (const log of history) {
    const date = new Date(log.startedAt);
    if (date < start) continue;
    const index = (date.getDay() + 6) % 7;
    days[index] = true;
  }
  return days;
}

/**
 * Weeks in a row in which the user reached the weekly goal. The current week only counts once
 * the goal is reached, so an unfinished week does not break the streak.
 */
export function getWeekStreak(
  history: readonly WorkoutLog[],
  weeklyGoal: number,
  now = new Date()
): number {
  if (weeklyGoal <= 0) return 0;
  const counts = new Map<number, number>();
  for (const log of history) {
    const week = getStartOfWeek(new Date(log.startedAt)).getTime();
    counts.set(week, (counts.get(week) ?? 0) + 1);
  }

  const week = getStartOfWeek(now);
  let streak = (counts.get(week.getTime()) ?? 0) >= weeklyGoal ? 1 : 0;
  for (;;) {
    week.setDate(week.getDate() - 7);
    if ((counts.get(week.getTime()) ?? 0) < weeklyGoal) return streak;
    streak++;
  }
}

/** Minutes and sets trained since Monday. */
export function summarizeWeek(history: readonly WorkoutLog[], now = new Date()) {
  const start = getStartOfWeek(now).getTime();
  return history
    .filter((log) => Date.parse(log.startedAt) >= start)
    .reduce(
      (total, log) => ({
        minutes: total.minutes + Math.round(log.durationSec / 60),
        setCount: total.setCount + log.sets.length,
      }),
      { minutes: 0, setCount: 0 }
    );
}

export type MonthGroup = {
  /** `YYYY-MM`, in local time. */
  key: string;
  logs: WorkoutLog[];
};

/** Splits the history by month, keeping its order (newest first). */
export function groupByMonth(history: readonly WorkoutLog[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const log of history) {
    const date = new Date(log.startedAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const last = groups.at(-1);
    if (last?.key === key) {
      last.logs.push(log);
    } else {
      groups.push({ key, logs: [log] });
    }
  }
  return groups;
}
