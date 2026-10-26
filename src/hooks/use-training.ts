import { useContext } from 'react';

import { TrainingContext } from '@/providers/training-provider';

export function useTraining() {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error('useTraining must be used inside TrainingProvider');
  }
  return context;
}
