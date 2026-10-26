/**
 * Keeps the chosen routine, the custom routines and the workout history as a JSON file on the
 * device, next to the user profile (see `file-store.ts`).
 */

import { readText, removeFile, writeText } from '@/storage/file-store';
import type { CustomRoutine, WorkoutLog } from '@/types/workout';
import { parseCustomRoutine } from '@/utils/custom-routine';
import { isWorkoutLog } from '@/utils/workout-log';

export const TRAINING_FILE_NAME = 'training.json';

export type TrainingData = {
  /** `null` until the user chooses a routine. */
  activeRoutineId: string | null;
  /** Routines the user built, sorted from newest to oldest. */
  customRoutines: CustomRoutine[];
  /** Sorted from newest to oldest. */
  history: WorkoutLog[];
};

export const EMPTY_TRAINING_DATA: TrainingData = {
  activeRoutineId: null,
  customRoutines: [],
  history: [],
};

/**
 * Returns empty data when there is no file or its content is invalid. Invalid routines and
 * workouts are dropped one by one, so a single corrupted entry does not erase the rest.
 */
export async function loadTraining(): Promise<TrainingData> {
  const text = await readText(TRAINING_FILE_NAME);
  if (text === null) {
    return EMPTY_TRAINING_DATA;
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return EMPTY_TRAINING_DATA;
  }
  if (typeof data !== 'object' || data === null) {
    return EMPTY_TRAINING_DATA;
  }

  const record = data as Record<string, unknown>;
  return {
    activeRoutineId: typeof record.activeRoutineId === 'string' ? record.activeRoutineId : null,
    customRoutines: Array.isArray(record.customRoutines)
      ? record.customRoutines.flatMap((item) => parseCustomRoutine(item) ?? [])
      : [],
    history: Array.isArray(record.history) ? record.history.filter(isWorkoutLog) : [],
  };
}

export async function saveTraining(data: TrainingData): Promise<void> {
  await writeText(TRAINING_FILE_NAME, JSON.stringify(data));
}

export function deleteTraining(): void {
  removeFile(TRAINING_FILE_NAME);
}
