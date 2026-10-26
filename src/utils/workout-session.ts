/**
 * State of a workout in progress. Times are kept as timestamps (ms) instead of counters, so the
 * timers stay correct when the app goes to the background.
 *
 * Flow for every set: `ready` → `working` (timer counts up) → `logging` (the user enters reps,
 * weight and effort) → `resting` (countdown with the calculated rest) → `working` again.
 * Rest starts when the set ends, so the time spent logging counts as rest.
 */

import { getExercise } from '@/constants/exercises';
import type { Goal, Level } from '@/types/user';
import type {
  Effort,
  Exercise,
  LoggedSet,
  Prescription,
  Routine,
  WorkoutLog,
} from '@/types/workout';
import { calculateRest, getPrescription } from '@/utils/prescription';

export type PlannedExercise = {
  exercise: Exercise;
  prescription: Prescription;
};

export type SessionPhase =
  | { name: 'ready' }
  | { name: 'working'; setStartedAt: number }
  | { name: 'logging'; setStartedAt: number; setEndedAt: number }
  | { name: 'resting'; restStartedAt: number; restEndsAt: number }
  | { name: 'finished'; finishedAt: number };

export type SessionState = {
  routineId: string;
  routineName: string;
  startedAt: number;
  plan: PlannedExercise[];
  /** Index in `plan` of the exercise of the next (or current) set. */
  exerciseIndex: number;
  /** 1-based number of the next (or current) set. */
  setNumber: number;
  phase: SessionPhase;
  sets: LoggedSet[];
};

export type SessionAction =
  | { type: 'startSet'; now: number }
  | { type: 'endSet'; now: number }
  | { type: 'logSet'; effort: Effort; reps?: number; weightKg?: number }
  | { type: 'adjustRest'; seconds: number }
  | { type: 'finish'; now: number };

export function planRoutine(routine: Routine, goal: Goal, level: Level): PlannedExercise[] {
  return routine.exerciseIds.map((id) => {
    const exercise = getExercise(id);
    return { exercise, prescription: getPrescription(exercise, goal, level) };
  });
}

export function createSession(
  routine: Routine,
  plan: PlannedExercise[],
  now: number
): SessionState {
  return {
    routineId: routine.id,
    routineName: routine.name,
    startedAt: now,
    plan,
    exerciseIndex: 0,
    setNumber: 1,
    phase: { name: 'ready' },
    sets: [],
  };
}

function toSeconds(ms: number) {
  return Math.max(0, Math.round(ms / 1000));
}

/** Saves the rest really taken on the last logged set. */
function closeRest(state: SessionState, now: number): LoggedSet[] {
  if (state.phase.name !== 'resting' || state.sets.length === 0) {
    return state.sets;
  }
  const restTakenSec = toSeconds(now - state.phase.restStartedAt);
  const sets = [...state.sets];
  sets[sets.length - 1] = { ...sets[sets.length - 1], restTakenSec };
  return sets;
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  const { phase } = state;

  switch (action.type) {
    case 'startSet': {
      if (phase.name !== 'ready' && phase.name !== 'resting') return state;
      return {
        ...state,
        sets: closeRest(state, action.now),
        phase: { name: 'working', setStartedAt: action.now },
      };
    }

    case 'endSet': {
      if (phase.name !== 'working') return state;
      return {
        ...state,
        phase: { name: 'logging', setStartedAt: phase.setStartedAt, setEndedAt: action.now },
      };
    }

    case 'logSet': {
      if (phase.name !== 'logging') return state;
      const { exercise, prescription } = state.plan[state.exerciseIndex];
      const workSec = toSeconds(phase.setEndedAt - phase.setStartedAt);
      const reps = exercise.tracking === 'reps' ? action.reps : undefined;
      const restSuggestedSec = calculateRest(prescription, { effort: action.effort, reps });
      const sets: LoggedSet[] = [
        ...state.sets,
        {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          setNumber: state.setNumber,
          ...(reps !== undefined && { reps }),
          ...(action.weightKg !== undefined && { weightKg: action.weightKg }),
          workSec,
          effort: action.effort,
          restSuggestedSec,
        },
      ];

      const isLastSetOfExercise = state.setNumber >= prescription.sets;
      const exerciseIndex = isLastSetOfExercise ? state.exerciseIndex + 1 : state.exerciseIndex;
      if (exerciseIndex >= state.plan.length) {
        return { ...state, sets, phase: { name: 'finished', finishedAt: phase.setEndedAt } };
      }

      return {
        ...state,
        sets,
        exerciseIndex,
        setNumber: isLastSetOfExercise ? 1 : state.setNumber + 1,
        phase: {
          name: 'resting',
          restStartedAt: phase.setEndedAt,
          restEndsAt: phase.setEndedAt + restSuggestedSec * 1000,
        },
      };
    }

    case 'adjustRest': {
      if (phase.name !== 'resting') return state;
      const restEndsAt = Math.max(phase.restStartedAt, phase.restEndsAt + action.seconds * 1000);
      return { ...state, phase: { ...phase, restEndsAt } };
    }

    case 'finish': {
      if (phase.name === 'finished') return state;
      // A set that is not logged yet is discarded.
      return {
        ...state,
        sets: closeRest(state, action.now),
        phase: { name: 'finished', finishedAt: action.now },
      };
    }
  }
}

/** Remaining rest in whole seconds, never negative. */
export function getRemainingRest(phase: SessionPhase, now: number): number {
  if (phase.name !== 'resting') return 0;
  return Math.max(0, Math.ceil((phase.restEndsAt - now) / 1000));
}

export function getTotalSets(plan: PlannedExercise[]) {
  return plan.reduce((total, { prescription }) => total + prescription.sets, 0);
}

export function toWorkoutLog(state: SessionState): WorkoutLog {
  const endedAt = state.phase.name === 'finished' ? state.phase.finishedAt : state.startedAt;
  return {
    id: String(state.startedAt),
    routineId: state.routineId,
    routineName: state.routineName,
    startedAt: new Date(state.startedAt).toISOString(),
    endedAt: new Date(endedAt).toISOString(),
    durationSec: toSeconds(endedAt - state.startedAt),
    sets: state.sets,
  };
}
