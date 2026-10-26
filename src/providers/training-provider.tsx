import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import * as trainingStorage from '@/storage/training-storage';
import type { CustomRoutine, WorkoutLog } from '@/types/workout';
import {
  createCustomRoutine,
  updateCustomRoutine,
  type CustomRoutineInput,
} from '@/utils/custom-routine';

export type TrainingContextValue = trainingStorage.TrainingData & {
  /** `true` while the data is read from the device. */
  isLoading: boolean;
  selectRoutine: (routineId: string) => Promise<void>;
  addWorkout: (log: WorkoutLog) => Promise<void>;
  /** Creates a custom routine, or updates it when `id` is given. */
  saveCustomRoutine: (input: CustomRoutineInput, id?: string) => Promise<CustomRoutine>;
  /** Deletes a custom routine. If it was the active routine, no routine stays active. */
  deleteCustomRoutine: (id: string) => Promise<void>;
};

export const TrainingContext = createContext<TrainingContextValue | null>(null);

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(trainingStorage.EMPTY_TRAINING_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    void trainingStorage
      .loadTraining()
      .catch((error: unknown) => {
        console.warn('Could not read the training data', error);
        return trainingStorage.EMPTY_TRAINING_DATA;
      })
      .then((loaded) => {
        if (isActive) {
          setData(loaded);
          setIsLoading(false);
        }
      });
    return () => {
      isActive = false;
    };
  }, []);

  const save = useCallback(async (next: trainingStorage.TrainingData) => {
    await trainingStorage.saveTraining(next);
    setData(next);
  }, []);

  const selectRoutine = useCallback(
    (routineId: string) => save({ ...data, activeRoutineId: routineId }),
    [data, save]
  );

  const addWorkout = useCallback(
    (log: WorkoutLog) => save({ ...data, history: [log, ...data.history] }),
    [data, save]
  );

  const saveCustomRoutine = useCallback(
    async (input: CustomRoutineInput, id?: string) => {
      const existing = id ? data.customRoutines.find((routine) => routine.id === id) : undefined;
      if (id && !existing) {
        throw new Error(`There is no custom routine with id ${id}`);
      }
      const routine = existing ? updateCustomRoutine(existing, input) : createCustomRoutine(input);
      const customRoutines = existing
        ? data.customRoutines.map((item) => (item.id === routine.id ? routine : item))
        : [routine, ...data.customRoutines];
      await save({ ...data, customRoutines });
      return routine;
    },
    [data, save]
  );

  const deleteCustomRoutine = useCallback(
    (id: string) =>
      save({
        ...data,
        activeRoutineId: data.activeRoutineId === id ? null : data.activeRoutineId,
        customRoutines: data.customRoutines.filter((routine) => routine.id !== id),
      }),
    [data, save]
  );

  const value = useMemo(
    () => ({
      ...data,
      isLoading,
      selectRoutine,
      addWorkout,
      saveCustomRoutine,
      deleteCustomRoutine,
    }),
    [data, isLoading, selectRoutine, addWorkout, saveCustomRoutine, deleteCustomRoutine]
  );

  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>;
}
