import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import * as trainingStorage from '@/storage/training-storage';
import type { WorkoutLog } from '@/types/workout';

export type TrainingContextValue = trainingStorage.TrainingData & {
  /** `true` while the data is read from the device. */
  isLoading: boolean;
  selectRoutine: (routineId: string) => Promise<void>;
  addWorkout: (log: WorkoutLog) => Promise<void>;
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

  const value = useMemo(
    () => ({ ...data, isLoading, selectRoutine, addWorkout }),
    [data, isLoading, selectRoutine, addWorkout]
  );

  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>;
}
