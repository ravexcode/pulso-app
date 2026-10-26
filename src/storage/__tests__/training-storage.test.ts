import * as fileSystem from 'expo-file-system';

import {
  deleteTraining,
  EMPTY_TRAINING_DATA,
  loadTraining,
  saveTraining,
  TRAINING_FILE_NAME,
} from '@/storage/training-storage';
import type { WorkoutLog } from '@/types/workout';

// Helpers from the in-memory mock in __mocks__/expo-file-system.ts.
const { __getFileContent, __resetFiles, __setFileContent } =
  fileSystem as unknown as typeof import('../../../__mocks__/expo-file-system');

const fileUri = `file:///document/${TRAINING_FILE_NAME}`;

const log: WorkoutLog = {
  id: '1',
  routineId: 'full-body-home',
  routineName: 'Full Body en casa',
  startedAt: '2026-10-25T10:00:00.000Z',
  endedAt: '2026-10-25T10:40:00.000Z',
  durationSec: 2400,
  sets: [
    {
      exerciseId: 'push-up',
      exerciseName: 'Flexiones',
      setNumber: 1,
      reps: 12,
      workSec: 30,
      effort: 'moderate',
      restSuggestedSec: 90,
    },
  ],
};

beforeEach(() => {
  __resetFiles();
});

describe('training storage', () => {
  it('returns empty data when nothing is saved', async () => {
    await expect(loadTraining()).resolves.toEqual(EMPTY_TRAINING_DATA);
  });

  it('saves and loads the active routine and the history', async () => {
    const data = { activeRoutineId: 'full-body-home', history: [log] };

    await saveTraining(data);

    expect(JSON.parse(__getFileContent(fileUri) ?? '')).toEqual(data);
    await expect(loadTraining()).resolves.toEqual(data);
  });

  it('returns empty data when the file is corrupted', async () => {
    __setFileContent(fileUri, '{ not json');

    await expect(loadTraining()).resolves.toEqual(EMPTY_TRAINING_DATA);
  });

  it('drops only the invalid workouts', async () => {
    __setFileContent(
      fileUri,
      JSON.stringify({ activeRoutineId: 7, history: [log, { ...log, durationSec: 'long' }] })
    );

    await expect(loadTraining()).resolves.toEqual({ activeRoutineId: null, history: [log] });
  });

  it('deletes the file', async () => {
    await saveTraining({ activeRoutineId: 'full-body-a', history: [] });

    deleteTraining();

    expect(__getFileContent(fileUri)).toBeUndefined();
  });
});
