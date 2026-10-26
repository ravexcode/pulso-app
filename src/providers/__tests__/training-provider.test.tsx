import * as fileSystem from 'expo-file-system';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useTraining } from '@/hooks/use-training';
import { TrainingProvider } from '@/providers/training-provider';
import { loadTraining, saveTraining } from '@/storage/training-storage';
import type { WorkoutLog } from '@/types/workout';
import { InvalidCustomRoutineError } from '@/utils/custom-routine';

// Helpers from the in-memory mock in __mocks__/expo-file-system.ts.
const { __resetFiles } =
  fileSystem as unknown as typeof import('../../../__mocks__/expo-file-system');

function makeLog(id: string): WorkoutLog {
  return {
    id,
    routineId: 'full-body-a',
    routineName: 'Full Body A',
    startedAt: '2026-10-25T10:00:00.000Z',
    endedAt: '2026-10-25T11:00:00.000Z',
    durationSec: 3600,
    sets: [],
  };
}

function renderTrainingHook() {
  return renderHook(() => useTraining(), { wrapper: TrainingProvider });
}

beforeEach(() => {
  __resetFiles();
});

describe('TrainingProvider', () => {
  it('starts without a routine or history', async () => {
    const { result } = await renderTrainingHook();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.activeRoutineId).toBeNull();
    expect(result.current.history).toEqual([]);
  });

  it('loads the saved data', async () => {
    await saveTraining({
      activeRoutineId: 'full-body-b',
      customRoutines: [],
      history: [makeLog('1')],
    });

    const { result } = await renderTrainingHook();

    await waitFor(() => expect(result.current.activeRoutineId).toBe('full-body-b'));
    expect(result.current.history).toHaveLength(1);
  });

  it('selects a routine and adds workouts, newest first, on the device', async () => {
    const { result } = await renderTrainingHook();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(() => result.current.selectRoutine('full-body-home'));
    await act(() => result.current.addWorkout(makeLog('1')));
    await act(() => result.current.addWorkout(makeLog('2')));

    expect(result.current.activeRoutineId).toBe('full-body-home');
    expect(result.current.history.map((log) => log.id)).toEqual(['2', '1']);
    await expect(loadTraining()).resolves.toEqual({
      activeRoutineId: 'full-body-home',
      customRoutines: [],
      history: result.current.history,
    });
  });

  it('creates, updates and deletes custom routines on the device', async () => {
    const { result } = await renderTrainingHook();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const created = await act(() =>
      result.current.saveCustomRoutine({
        name: ' Brazos ',
        days: [{ focus: ['biceps'], exerciseIds: ['biceps-curl'] }],
      })
    );
    expect(result.current.customRoutines).toEqual([created]);
    expect(created.name).toBe('Brazos');

    await act(() => result.current.selectRoutine(created.id));
    await act(() =>
      result.current.saveCustomRoutine(
        {
          name: 'Brazos',
          days: [
            { focus: ['biceps'], exerciseIds: ['biceps-curl', 'hammer-curl'] },
            { focus: [], exerciseIds: ['biceps-curl'] },
          ],
        },
        created.id
      )
    );
    expect(result.current.customRoutines[0].days).toHaveLength(2);
    await expect(loadTraining()).resolves.toMatchObject({
      customRoutines: result.current.customRoutines,
    });

    await act(() => result.current.deleteCustomRoutine(created.id));
    expect(result.current.customRoutines).toEqual([]);
    // The deleted routine was active, so no routine stays active.
    expect(result.current.activeRoutineId).toBeNull();
  });

  it('does not save an invalid custom routine', async () => {
    const { result } = await renderTrainingHook();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(
      result.current.saveCustomRoutine({ name: 'Vacía', days: [{ focus: [], exerciseIds: [] }] })
    ).rejects.toThrow(InvalidCustomRoutineError);
    await expect(loadTraining()).resolves.toMatchObject({ customRoutines: [] });
  });
});

describe('useTraining', () => {
  it('throws outside TrainingProvider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(renderHook(() => useTraining())).rejects.toThrow(
      'useTraining must be used inside TrainingProvider'
    );
  });
});
